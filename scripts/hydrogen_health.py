#!/usr/bin/env python3
"""hydrogen_health.py — Probe whether a Hydrogen dev server is running.

Hydrogen 2026.x dev server (`shopify hydrogen dev --codegen`) runs as
workerd.exe and binds to a RANDOM high port (per MEMORY: not 3000).
The CLI flag is `--socket-addr=entry=127.0.0.1:0` so the OS picks
any free port.

This script:
  1. Lists running workerd.exe processes
  2. Reads their listening TCP sockets (port numbers via netstat-style
     PowerShell query, since Windows + Python is annoying here)
  3. Probes each port with a small HTTP GET; reports what's responsive
  4. Prints a one-line health summary and (optionally) JSON for piping

Usage:
    python scripts/hydrogen_health.py            # human-readable
    python scripts/hydrogen_health.py --json    # JSON
    python scripts/hydrogen_health.py --port 52179  # probe a specific port
"""
import argparse
import json
import subprocess
import sys
import urllib.request
from pathlib import Path


def list_workerd_pids():
    """Return list of PIDs for running workerd.exe processes."""
    try:
        out = subprocess.check_output(
            ['powershell', '-NoProfile', '-Command',
             "Get-Process workerd -ErrorAction SilentlyContinue "
             "| Select-Object -ExpandProperty Id"],
            text=True, timeout=15,
        )
        return [int(line.strip()) for line in out.splitlines() if line.strip().isdigit()]
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
        return []


def listening_ports_for_pid(pid):
    """Return list of TCP ports in LISTEN state owned by pid (Windows)."""
    try:
        cmd = (
            f"Get-NetTCPConnection -State Listen -OwningProcess {pid} "
            "| Select-Object -ExpandProperty LocalPort"
        )
        out = subprocess.check_output(
            ['powershell', '-NoProfile', '-Command', cmd],
            text=True, timeout=15,
        )
        return [int(line.strip()) for line in out.splitlines() if line.strip().isdigit()]
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, ValueError):
        return []


def probe_port(port, host='127.0.0.1', timeout=3.0):
    """Try a quick HTTP GET on the port; return (ok, status, snippet)."""
    url = f'http://{host}:{port}/'
    try:
        req = urllib.request.Request(url, method='GET',
                                      headers={'User-Agent': 'hydrogen-health/1.0'})
        with urllib.request.urlopen(req, timeout=timeout) as r:
            body = r.read(200)
            return True, r.status, body[:120].decode('utf-8', errors='replace')
    except urllib.error.HTTPError as e:
        return True, e.code, '(http-error)'
    except (urllib.error.URLError, TimeoutError, ConnectionRefusedError, OSError) as e:
        return False, None, type(e).__name__


def find_dev_server():
    """Find Hydrogen dev server workerd processes and their listening ports.

    Returns a list of dicts: {pid, ports: [..], probes: [{port, ok, status, body}]}
    """
    pids = list_workerd_pids()
    results = []
    for pid in pids:
        ports = listening_ports_for_pid(pid)
        probes = []
        for port in ports:
            ok, status, snippet = probe_port(port)
            probes.append({'port': port, 'ok': ok, 'status': status, 'body': snippet})
        results.append({'pid': pid, 'ports': ports, 'probes': probes})
    return results


def main():
    ap = argparse.ArgumentParser(description='Probe Hydrogen dev server health.')
    ap.add_argument('--json', action='store_true', help='Output JSON instead of text')
    ap.add_argument('--port', type=int, help='Probe a specific port only')
    ap.add_argument('--timeout', type=float, default=3.0,
                    help='HTTP probe timeout in seconds (default 3)')
    args = ap.parse_args()

    if args.port:
        # Probe a specific port, ignore workerd processes
        ok, status, snippet = probe_port(args.port, timeout=args.timeout)
        result = {
            'target_port': args.port,
            'ok': ok,
            'status': status,
            'body': snippet,
        }
        if args.json:
            print(json.dumps(result, indent=2))
        else:
            if ok:
                print(f'OK  port={args.port} http_status={status}')
                print(f'    snippet: {snippet[:80]}')
            else:
                print(f'FAIL port={args.port} error={snippet}')
                sys.exit(1)
        return

    results = find_dev_server()
    if args.json:
        print(json.dumps(results, indent=2))
    else:
        if not results:
            print('No workerd.exe processes found.')
            print('Is `npm run dev` running? Start it with: cd E:\\Claude\\puchica-site && npm run dev')
            sys.exit(1)
        print(f'Found {len(results)} workerd process(es):')
        for r in results:
            print(f'\n  PID {r["pid"]}')
            if not r['ports']:
                print('    No LISTEN sockets')
                continue
            for probe in r['probes']:
                if probe['ok']:
                    status = probe['status']
                    body = (probe['body'] or '').replace('\n', ' ').strip()[:80]
                    print(f'    port {probe["port"]:>5}: OK   http {status}  "{body}"')
                else:
                    print(f'    port {probe["port"]:>5}: FAIL ({probe["body"]})')


if __name__ == '__main__':
    main()
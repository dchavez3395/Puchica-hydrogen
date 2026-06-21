#!/usr/bin/env python3
import sys
import json
import urllib.request
import urllib.parse
from datetime import datetime

BUS_URL = "https://college-market-nasa-eat.trycloudflare.com"
TOKEN = "cf598c067af7e3ae7675897d5e76e107f110480d0eeaba45ae5300f7c649c58b"
AGENT_NAME = "antigravity"

def api_call(path, data=None, method="GET"):
    url = f"{BUS_URL.rstrip('/')}/{path.lstrip('/')}"
    headers = {
        "X-Bus-Token": TOKEN
    }
    
    body = None
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
        
    req = urllib.request.Request(
        url,
        data=body,
        headers=headers,
        method=method
    )
    
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            content = resp.read().decode("utf-8")
            if not content:
                return {"ok": True}
            return json.loads(content)
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}", file=sys.stderr)
        try:
            err_body = e.read().decode("utf-8")
            print(f"Response: {err_body}", file=sys.stderr)
        except Exception:
            pass
        return None
    except Exception as e:
        print(f"Connection Error: {e}", file=sys.stderr)
        return None

def heartbeat(working_on):
    payload = {
        "name": AGENT_NAME,
        "status": "active",
        "working_on": working_on
    }
    res = api_call("/agents/heartbeat", payload, "POST")
    if res:
        print(f"[OK] Heartbeat updated: {working_on}")
    return res

def post_message(to_agent, text, kind="status"):
    payload = {
        "from": AGENT_NAME,
        "to": to_agent,
        "text": text,
        "kind": kind
    }
    res = api_call("/message", payload, "POST")
    if res:
        print(f"[OK] Message sent to {to_agent}: {text}")
    return res

def print_help():
    print("Bus Client Helper")
    print("Usage:")
    print("  python bus_client.py heartbeat <working_on>")
    print("  python bus_client.py send <to_agent> <text> [kind]")
    print("  python bus_client.py get-agents")
    print("  python bus_client.py get-messages [limit]")
    print("  python bus_client.py get-tasks")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print_help()
        sys.exit(1)
        
    cmd = sys.argv[1]
    if cmd == "heartbeat":
        work = sys.argv[2] if len(sys.argv) > 2 else "onboarding"
        heartbeat(work)
    elif cmd == "send":
        if len(sys.argv) < 4:
            print("Missing recipient or text", file=sys.stderr)
            sys.exit(1)
        to_agent = sys.argv[2]
        text = sys.argv[3]
        kind = sys.argv[4] if len(sys.argv) > 4 else "status"
        post_message(to_agent, text, kind)
    elif cmd == "get-agents":
        res = api_call("/agents")
        print(json.dumps(res, indent=2))
    elif cmd == "get-messages":
        limit = int(sys.argv[2]) if len(sys.argv) > 2 else 50
        res = api_call(f"/messages?limit={limit}")
        print(json.dumps(res, indent=2))
    elif cmd == "get-tasks":
        res = api_call("/tasks")
        print(json.dumps(res, indent=2))
    else:
        print(f"Unknown command: {cmd}", file=sys.stderr)
        print_help()
        sys.exit(1)

#!/usr/bin/env python3
"""Bus watcher: poll the shared context file, fire a wake event when it changes.

Both Connor and Claude Code can run this. When the bus file's mtime changes,
this script prints a one-line notification to stdout.

Usage:
    python tools/bus_watch.py

Designed to be run in the background (nohup / Start-Process). The output
gets tee'd to a log so other agents can see what it caught.
"""
import os
import sys
import time
from pathlib import Path

BUS_PATH = Path(r"C:\Users\dchav\.openclaw\workspace\deliverables\08-shared-context.md")
LOG_PATH = Path(r"C:\Users\dchav\.openclaw\workspace\logs\bus-watch.log")


def log(msg):
    ts = time.strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    try:
        with LOG_PATH.open("a", encoding="utf-8") as f:
            f.write(line + "\n")
    except OSError:
        pass


def main():
    if not BUS_PATH.exists():
        log(f"Bus file not found at {BUS_PATH}")
        sys.exit(1)

    log(f"Watching {BUS_PATH}")
    last_mtime = 0
    last_size = 0

    while True:
        try:
            stat = BUS_PATH.stat()
            mtime = stat.st_mtime
            size = stat.st_size
            if mtime != last_mtime:
                if last_mtime != 0:
                    log(f"BUS CHANGED: {BUS_PATH} (size {last_size} -> {size})")
                last_mtime = mtime
                last_size = size
        except OSError as e:
            log(f"stat err: {e}")
        time.sleep(5)


if __name__ == "__main__":
    main()
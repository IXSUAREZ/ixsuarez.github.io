#!/usr/bin/env python3
"""Serve the isolated preview reliably during the full-library browser sweep."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

class Server(ThreadingHTTPServer):
    request_queue_size = 256
    daemon_threads = True

class Handler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8965)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    print(f'Journal preview: http://127.0.0.1:{args.port}/learn/', flush=True)
    Server(('127.0.0.1', args.port), partial(Handler, directory=str(root))).serve_forever()

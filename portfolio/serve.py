#!/usr/bin/env python3
"""Dev server with no-cache headers for portfolio."""
import socket
from http.server import SimpleHTTPRequestHandler, HTTPServer
import os, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8091

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()
    def log_message(self, *_):
        pass

os.chdir(os.path.dirname(os.path.abspath(__file__)))
server = HTTPServer(("", PORT), NoCacheHandler)
server.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
print(f"Portfolio → http://localhost:{PORT}")
print(f"Build 01  → http://localhost:{PORT}/build.html?id=01")
print(f"Build 02  → http://localhost:{PORT}/build.html?id=02")
server.serve_forever()

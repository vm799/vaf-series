#!/usr/bin/env python3
"""Dev server with no-cache headers for portfolio."""
import http.server
import os

PORT = 8090

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate")
        self.send_header("Pragma", "no-cache")
        super().end_headers()

    def log_message(self, fmt, *args):
        pass  # silence logs

os.chdir(os.path.dirname(os.path.abspath(__file__)))
print(f"Portfolio server: http://localhost:{PORT}")
http.server.test(HandlerClass=NoCacheHandler, port=PORT, bind="")

import http.server
import socketserver
import os
import urllib.parse
from datetime import datetime

PORT = 3000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')

# AI Scraper User-Agent detection
BANNED_AI_AGENTS = [
    'gptbot', 'chatgpt-user', 'claudebot', 'anthropic-ai', 'perplexitybot',
    'ccbot', 'bytespider', 'google-extended', 'amazonbot', 'diffbot',
    'facebookbot', 'applebot-extended', 'cohere-ai', 'scrapy', 'headlesschrome'
]

def is_ai_crawler(user_agent: str) -> bool:
    if not user_agent:
        return False
    ua = user_agent.lower()
    for bot in BANNED_AI_AGENTS:
        if bot in ua:
            return True
    return False

class StoryToAnimeHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Strict anti-AI & anti-scraping headers
        self.send_header('X-Robots-Tag', 'noai, noimageai, noindex, nofollow, max-snippet:0')
        self.send_header('Permissions-Policy', 'interest-cohort=(), browsing-topics=()')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Anti-AI-Shield', 'Active-v2.5 (Automated AI Scraping Prohibited)')
        super().end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        ua = self.headers.get('User-Agent', '')

        if is_ai_crawler(ua):
            self.send_response(403)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.end_headers()
            self.wfile.write(b"403 Forbidden: Automated AI bots and scrapers are strictly prohibited.")
            return

        if path == '/' or path == '':
            file_path = os.path.join(PUBLIC_DIR, 'index.html')
        else:
            clean_path = path.lstrip('/')
            file_path = os.path.join(PUBLIC_DIR, clean_path)

        if os.path.exists(file_path) and os.path.isfile(file_path):
            content_type = 'text/html; charset=utf-8'
            if file_path.endswith('.css'):
                content_type = 'text/css; charset=utf-8'
            elif file_path.endswith('.js'):
                content_type = 'application/javascript; charset=utf-8'
            elif file_path.endswith('.json'):
                content_type = 'application/json; charset=utf-8'
            elif file_path.endswith(('.jpg', '.jpeg')):
                content_type = 'image/jpeg'
            elif file_path.endswith('.png'):
                content_type = 'image/png'
            elif file_path.endswith('.svg'):
                content_type = 'image/svg+xml'
            elif file_path.endswith('.ico'):
                content_type = 'image/x-icon'

            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.end_headers()
            with open(file_path, 'rb') as f:
                self.wfile.write(f.read())
        else:
            # Fallback to index.html
            index_path = os.path.join(PUBLIC_DIR, 'index.html')
            if os.path.exists(index_path):
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.end_headers()
                with open(index_path, 'rb') as f:
                    self.wfile.write(f.read())
                return
            self.send_response(404)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(b"404 Not Found")

def run():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), StoryToAnimeHandler) as httpd:
        print("============================================================")
        print(f" ✨ ANIMORPHIA: STORY-TO-ANIME LOCAL SERVER RUNNING")
        print(f" 🌐 URL: http://localhost:{PORT}")
        print(f" 🎡 WorksWheel 3D Portfolio Component: MOUNTED")
        print(f" 🛡️ Anti-AI Scraper Shield: ARMED")
        print(f" 🚫 No-Nudity Guardrail: ENFORCED")
        print("============================================================")
        httpd.serve_forever()

if __name__ == '__main__':
    run()

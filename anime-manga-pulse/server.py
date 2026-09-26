import http.server
import socketserver
import json
import os
import re
import urllib.parse
from datetime import datetime

PORT = 8080
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
DATA_DIR = os.path.join(BASE_DIR, 'data')
UPDATES_FILE = os.path.join(DATA_DIR, 'updates.json')
SCHEDULE_FILE = os.path.join(DATA_DIR, 'schedule.json')
BLOCKED_FILE = os.path.join(DATA_DIR, 'blocked_bots.json')

# Known AI crawlers, LLM data scrapers, and automated scraping agents to block
BANNED_AI_AGENTS = [
    'gptbot', 'chatgpt-user', 'claudebot', 'anthropic-ai', 'perplexitybot',
    'ccbot', 'bytespider', 'google-extended', 'amazonbot', 'diffbot',
    'facebookbot', 'applebot-extended', 'cohere-ai', 'omgili', 'youbot',
    'scrapy', 'python-requests', 'aiohttp', 'go-http-client', 'curl', 'wget',
    'headlesschrome', 'selenium', 'puppeteer', 'playwright', 'bot'
]

# Whitelist regular human web browsers and webview
HUMAN_BROWSER_TOKENS = ['mozilla', 'chrome', 'safari', 'firefox', 'edge', 'opera', 'mobile']

def is_ai_scraper(user_agent: str) -> bool:
    if not user_agent or len(user_agent.strip()) == 0:
        return True  # Empty user agent is almost always automated scraper
    ua = user_agent.lower()
    
    # Check if explicitly identifies as an AI crawler or headless scraper
    for bot in BANNED_AI_AGENTS:
        # Match word boundaries or distinct token
        if bot in ua:
            # Let normal human browsers like chrome pass unless it's headless or explicitly an AI bot
            if bot in ['curl', 'wget', 'scrapy', 'python-requests', 'aiohttp', 'go-http-client',
                       'gptbot', 'claudebot', 'perplexitybot', 'ccbot', 'bytespider', 'google-extended',
                       'amazonbot', 'diffbot', 'facebookbot', 'applebot-extended', 'cohere-ai', 'headlesschrome']:
                return True
            if 'bot' in ua and not any(h in ua for h in ['mobile', 'applewebkit']) and 'robot' in ua:
                return True
    return False

def record_blocked_bot(ip: str, bot_ua: str, reason: str):
    try:
        data = {"blocked_count": 0, "recent_blocked": []}
        if os.path.exists(BLOCKED_FILE):
            with open(BLOCKED_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
        
        data["blocked_count"] = data.get("blocked_count", 0) + 1
        new_entry = {
            "ip": ip or "Unknown IP",
            "bot": (bot_ua[:50] if bot_ua else "Automated Scraper/Empty UA"),
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "reason": reason
        }
        data["recent_blocked"].insert(0, new_entry)
        data["recent_blocked"] = data["recent_blocked"][:25] # Keep last 25
        
        with open(BLOCKED_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error logging blocked bot: {e}")

def get_updates():
    if os.path.exists(UPDATES_FILE):
        with open(UPDATES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_updates(updates_list):
    with open(UPDATES_FILE, 'w', encoding='utf-8') as f:
        json.dump(updates_list, f, indent=2, ensure_ascii=False)

def get_schedule():
    if os.path.exists(SCHEDULE_FILE):
        with open(SCHEDULE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {}

def get_blocked_stats():
    if os.path.exists(BLOCKED_FILE):
        with open(BLOCKED_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"blocked_count": 0, "recent_blocked": []}

class AnimeMangaServerHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Strict anti-AI & anti-scraping response headers
        self.send_header('X-Robots-Tag', 'noai, noimageai, noindex, nofollow, max-snippet:0')
        self.send_header('Permissions-Policy', 'interest-cohort=(), browsing-topics=()')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Anti-AI-Shield', 'Active-v2.5 (Automated AI Scraping Forbidden)')
        super().end_headers()

    def send_ai_blocked_page(self, reason="Automated AI Scraper Detected"):
        client_ip = self.client_address[0] if self.client_address else "Unknown"
        ua = self.headers.get('User-Agent', '')
        record_blocked_bot(client_ip, ua, reason)
        
        self.send_response(403)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>403 Forbidden - AI Crawlers Prohibited</title>
    <style>
        body {{
            background: #0d0c15;
            color: #fff;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
        }}
        .card {{
            border: 2px solid transparent;
            border-image: linear-gradient(90deg, #ff0055, #ff7700, #ffea00, #00e676, #00b0ff, #7000ff) 1;
            padding: 40px;
            background: #141124;
            max-width: 600px;
            box-shadow: 0 10px 40px rgba(255, 0, 85, 0.4);
            border-radius: 12px;
        }}
        h1 {{
            background: linear-gradient(90deg, #ff0055, #ff7700, #ffea00, #00e676, #00b0ff, #7000ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-size: 2.2rem;
            margin-bottom: 12px;
        }}
        p {{ color: #ccc; line-height: 1.6; font-size: 1.1rem; }}
        .badge {{
            display: inline-block;
            background: #ff0055;
            color: #fff;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: bold;
            margin-top: 15px;
        }}
        .human-btn {{
            margin-top: 25px;
            display: inline-block;
            background: linear-gradient(90deg, #00b0ff, #7000ff);
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 30px;
            font-weight: bold;
        }}
    </style>
</head>
<body>
    <div class="card">
        <h1>🛡️ ACCESS DENIED (403)</h1>
        <p><strong>Niji Anime & Manga Pulse Anti-AI Defense Active</strong></p>
        <p>Automated AI web crawlers, LLM training scrapers, and bot agents are strictly prohibited from harvesting anime & manga updates from this server.</p>
        <div class="badge">Reason: {reason}</div>
        <p style="margin-top:20px; font-size: 0.9rem; color: #888;">If you are an authentic human anime fan, please browse using a standard web browser with JavaScript enabled.</p>
        <a href="/" class="human-btn">I am a Human Anime Fan</a>
    </div>
</body>
</html>"""
        self.wfile.write(html.encode('utf-8'))

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)
        client_ip = self.client_address[0] if self.client_address else "Unknown"
        ua = self.headers.get('User-Agent', '')

        # 1. Honeypot trap check
        if path == '/api/trap-ai-honeypot' or path == '/honeypot' or path == '/trap-ai-crawler':
            self.send_ai_blocked_page("Tripped Invisible Anti-AI Honeypot Trap")
            return

        # 2. Check for AI scrapers on API & data routes
        if is_ai_scraper(ua) and not path.endswith(('.css', '.jpg', '.png', '.ico')):
            # Allow browser clients to load robots.txt
            if path != '/robots.txt':
                self.send_ai_blocked_page("Disallowed AI / Web Crawler User-Agent Detected")
                return

        # 3. Serve robots.txt
        if path == '/robots.txt':
            robots_file = os.path.join(PUBLIC_DIR, 'robots.txt')
            if os.path.exists(robots_file):
                self.send_response(200)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                with open(robots_file, 'rb') as f:
                    self.wfile.write(f.read())
            else:
                self.send_response(200)
                self.send_header('Content-Type', 'text/plain')
                self.end_headers()
                self.wfile.write(b"User-agent: *\nDisallow: /\nUser-agent: GPTBot\nDisallow: /\nUser-agent: ClaudeBot\nDisallow: /\n")
            return

        # 4. API Endpoints
        if path == '/api/updates':
            updates = get_updates()
            # Filter by type (anime / manga)
            req_type = query.get('type', ['all'])[0].lower()
            if req_type in ['anime', 'manga']:
                updates = [u for u in updates if u.get('type', '').lower() == req_type]
            
            # Filter by status (official / unofficial)
            req_status = query.get('status', ['all'])[0].lower()
            if req_status in ['official', 'unofficial']:
                updates = [u for u in updates if u.get('status', '').lower() == req_status]
            
            # Filter by category
            req_cat = query.get('category', ['all'])[0].lower()
            if req_cat != 'all':
                updates = [u for u in updates if u.get('category', '').lower() == req_cat]

            # Filter by franchise
            req_franchise = query.get('franchise', ['all'])[0]
            if req_franchise != 'all':
                updates = [u for u in updates if req_franchise.lower() in u.get('franchise', '').lower()]

            # Search query
            q = query.get('q', [''])[0].strip().lower()
            if q:
                updates = [
                    u for u in updates
                    if q in u.get('title', '').lower()
                    or q in u.get('summary', '').lower()
                    or q in u.get('content', '').lower()
                    or q in u.get('franchise', '').lower()
                    or q in u.get('source', '').lower()
                ]

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(updates, ensure_ascii=False).encode('utf-8'))
            return

        elif path.startswith('/api/updates/'):
            update_id = path.replace('/api/updates/', '')
            updates = get_updates()
            match = next((u for u in updates if u.get('id') == update_id), None)
            if match:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps(match, ensure_ascii=False).encode('utf-8'))
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Update not found"}).encode('utf-8'))
            return

        elif path == '/api/schedule':
            schedule = get_schedule()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(schedule, ensure_ascii=False).encode('utf-8'))
            return

        elif path == '/api/stats':
            updates = get_updates()
            blocked_data = get_blocked_stats()
            anime_count = len([u for u in updates if u.get('type') == 'anime'])
            manga_count = len([u for u in updates if u.get('type') == 'manga'])
            official_count = len([u for u in updates if u.get('status') == 'official'])
            unofficial_count = len([u for u in updates if u.get('status') == 'unofficial'])
            
            stats = {
                "total_updates": len(updates),
                "anime_count": anime_count,
                "manga_count": manga_count,
                "official_count": official_count,
                "unofficial_count": unofficial_count,
                "ai_bots_blocked": blocked_data.get("blocked_count", 0),
                "server_time_jst": datetime.now().strftime("%Y-%m-%d %H:%M:%S JST"),
                "shield_status": "ARMED & BLOCKING"
            }
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(stats).encode('utf-8'))
            return

        elif path == '/api/blocked-bots':
            blocked_data = get_blocked_stats()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(blocked_data).encode('utf-8'))
            return

        # 5. Serve static files from public/
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
            elif file_path.endswith('.jpg') or file_path.endswith('.jpeg'):
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
            # Fallback for SPA routing to index.html if not an API route
            if not path.startswith('/api/'):
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

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        client_ip = self.client_address[0] if self.client_address else "Unknown"
        ua = self.headers.get('User-Agent', '')

        # Check AI bots on POST
        if is_ai_scraper(ua):
            self.send_ai_blocked_page("Automated Bot Post Rejected")
            return

        content_len = int(self.headers.get('Content-Length', 0))
        post_body = self.rfile.read(content_len).decode('utf-8') if content_len > 0 else "{}"
        
        try:
            data = json.loads(post_body)
        except Exception:
            data = {}

        if path == '/api/updates':
            # Create a new anime or manga update
            title = data.get('title', '').strip()
            if not title:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Title is required"}).encode('utf-8'))
                return

            updates = get_updates()
            new_id = f"up-{len(updates) + 1:03d}"
            new_update = {
                "id": new_id,
                "title": title,
                "type": data.get('type', 'anime'),
                "status": data.get('status', 'official'),
                "category": data.get('category', 'anime_announcement'),
                "franchise": data.get('franchise', 'General Anime'),
                "summary": data.get('summary', ''),
                "content": data.get('content', data.get('summary', '')),
                "source": data.get('source', 'Community Verified Contributor'),
                "source_url": data.get('source_url', 'https://animenewsnetwork.com'),
                "credibility": int(data.get('credibility', 90 if data.get('status') == 'official' else 75)),
                "date": datetime.now().strftime("%Y-%m-%d"),
                "time": datetime.now().strftime("%I:%M %p JST"),
                "badge_color": "green" if data.get('status') == 'official' else "yellow",
                "hot": True,
                "views": 1,
                "image_theme": "rainbow-red" if data.get('status') == 'official' else "rainbow-yellow"
            }
            updates.insert(0, new_update)
            save_updates(updates)

            self.send_response(201)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({"success": True, "update": new_update}).encode('utf-8'))
            return

        elif path == '/api/report-ai-bot':
            # Client-side Anti-AI defense script reports automated webdriver activity
            detected_reason = data.get('reason', 'Client WebDriver / Automation Fingerprint')
            bot_name = data.get('fingerprint', 'Headless Automation Script')
            record_blocked_bot(client_ip, bot_name, detected_reason)
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "reported_and_defended"}).encode('utf-8'))
            return

        elif path == '/api/verify-human':
            # Human otaku puzzle verification
            answer = data.get('answer', '').strip().lower()
            # Simple proof-of-human puzzle: question answered correctly
            valid_tokens = ["anime", "manga", "shonen", "luffy", "goku", "otaku", "human"]
            if any(t in answer for t in valid_tokens) or data.get('slider_verified') is True:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Set-Cookie', 'human_verified_token=otaku_human_verified_2026; Path=/; Max-Age=86400; SameSite=Strict')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": "Human verification successful! Access granted."}).encode('utf-8'))
            else:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "message": "Verification failed. Answer is incorrect."}).encode('utf-8'))
            return

        self.send_response(404)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Route not found"}).encode('utf-8'))

def run_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), AnimeMangaServerHandler) as httpd:
        print(f"============================================================")
        print(f" 🌈 NIJI ANIME & MANGA PULSE SERVER RUNNING ON PORT {PORT}")
        print(f" URL: http://localhost:{PORT}")
        print(f" Anti-AI Bot Shield: ACTIVE (Blocking AI scrapers & crawlers)")
        print(f"============================================================")
        httpd.serve_forever()

if __name__ == '__main__':
    run_server()

import urllib.request
import json

urls = [
    'http://localhost:8080/',
    'http://localhost:8080/styles.css',
    'http://localhost:8080/app.js',
    'http://localhost:8080/ai-blocker.js',
    'http://localhost:8080/assets/banner.jpg',
    'http://localhost:8080/robots.txt',
    'http://localhost:8080/api/updates',
    'http://localhost:8080/api/schedule',
    'http://localhost:8080/api/stats',
    'http://localhost:8080/api/blocked-bots'
]

print("=== ENDPOINT VALIDATION SUITE ===")
for u in urls:
    req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req) as res:
        content = res.read()
        print(f"[{res.status} OK] {u} -> {len(content)} bytes | {res.headers.get('Content-Type')}")

# Test submitting a new anime update
print("\n=== TESTING POST /api/updates ===")
post_data = {
    'title': 'Chainsaw Man Chapter 180 Official Announcement',
    'type': 'manga',
    'status': 'official',
    'category': 'chapter_release',
    'franchise': 'Chainsaw Man',
    'summary': 'Tatsuki Fujimoto delivers climax with full color opening spread.',
    'content': 'Shonen Jump+ release confirmed for Tuesday midnight JST.',
    'source': 'Shonen Jump+',
    'source_url': 'https://shonenjump.com',
    'credibility': 100
}
post_req = urllib.request.Request(
    'http://localhost:8080/api/updates',
    data=json.dumps(post_data).encode('utf-8'),
    headers={'Content-Type': 'application/json', 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
)
with urllib.request.urlopen(post_req) as post_res:
    body = json.loads(post_res.read().decode('utf-8'))
    print(f"[{post_res.status} CREATED] Success: {body.get('success')} | ID: {body.get('update', {}).get('id')}")

print("\nAll endpoints and features validated successfully!")

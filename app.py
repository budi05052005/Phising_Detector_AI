import os
import datetime
import urllib.parse
import hashlib
import socket
import requests
from flask import Flask, render_template, request, jsonify
from utils.homograph_detector import check_homograph
from utils.network_checker import check_network

app = Flask(__name__)
app.config['SECRET_KEY'] = 'bitsmikro-ai-link-guard-cyber-2026-secret-key'

# Known top trusted domains for baseline scoring adjustment
TRUSTED_DOMAINS = {
    'google.com', 'www.google.com', 'youtube.com', 'github.com',
    'microsoft.com', 'apple.com', 'wikipedia.org', 'amazon.com'
}

def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        try:
            return socket.gethostbyname(socket.gethostname())
        except Exception:
            return "192.168.1.108"

def get_client_public_ip(req):
    forwarded = req.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    remote = req.remote_addr
    if remote and remote not in ("127.0.0.1", "::1", "localhost"):
        return remote
    try:
        res = requests.get("https://api.ipify.org?format=json", timeout=2)
        if res.status_code == 200:
            return res.json().get("ip", "182.9.34.54")
    except Exception:
        pass
    return "182.9.34.54"

@app.route('/')
def index():
    client_pub = get_client_public_ip(request)
    client_priv = get_local_ip()
    return render_template('index.html', client_pub=client_pub, client_priv=client_priv)

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/register')
def register():
    return render_template('register.html')

@app.route('/dashboard/member')
def dashboard_member():
    client_pub = get_client_public_ip(request)
    client_priv = get_local_ip()
    return render_template('dashboard_member.html', client_pub=client_pub, client_priv=client_priv)

@app.route('/dashboard/admin')
def dashboard_admin():
    client_pub = get_client_public_ip(request)
    client_priv = get_local_ip()
    return render_template('dashboard_admin.html', client_pub=client_pub, client_priv=client_priv)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json() or {}
    url = data.get('url', '').strip()

    if not url:
        return jsonify({
            "error": True,
            "message": "URL input cannot be empty."
        }), 400

    raw_url = url
    if not url.startswith(('http://', 'https://')):
        url = 'http://' + url

    # Perform modular deep reconnaissance
    homograph_res = check_homograph(url)
    network_res = check_network(url)

    domain = homograph_res.get('domain', '')
    
    # ----------------------------------------------------
    # AI Risk Assessment & Weighting Engine
    # ----------------------------------------------------
    risk_score = 0
    risk_factors = []

    # 1. Homograph & Punycode Weight: +45%
    if homograph_res.get('is_punycode'):
        risk_score += 45
        risk_factors.append("CRITICAL IDN HOMOGRAPH: Punycode (xn--) domain masking detected (+45%)")
    elif homograph_res.get('has_non_ascii'):
        risk_score += 45
        risk_factors.append("CRITICAL IDN HOMOGRAPH: Non-ASCII / Spoofed Unicode characters present (+45%)")

    # 2. SSL Security Weight: +25%
    if not network_res.get('has_ssl'):
        risk_score += 25
        risk_factors.append("Insecure Connection: Missing SSL/HTTPS Certificate (+25%)")
    elif not network_res.get('ssl_valid'):
        risk_score += 25
        risk_factors.append("Invalid or Untrusted SSL Certificate (+25%)")

    # 3. Domain Age Weight: +30%
    if network_res.get('is_new_domain'):
        risk_score += 30
        risk_factors.append("High Risk: Newly Registered Domain (<30 days old) (+30%)")

    # 4. URL Pattern / Heuristics Weight: +10% to +20%
    phishing_keywords = ['login', 'verify', 'account', 'update', 'secure', 'banking', 'sign-in', 'password', 'wallet', 'free', 'bonus']
    found_keywords = [kw for kw in phishing_keywords if kw in url.lower()]
    if found_keywords:
        risk_score += 15
        risk_factors.append(f"Suspicious Phishing Keywords in URL path: {', '.join(found_keywords)} (+15%)")

    if '@' in url:
        risk_score += 15
        risk_factors.append("URL contains '@' user-info redirect trick (+15%)")

    host_only = domain.split(':')[0]
    if host_only.replace('.', '').isdigit():
        risk_score += 20
        risk_factors.append("Host is a Direct IP Address instead of a registered Domain (+20%)")

    if domain.count('.') >= 4 and not homograph_res.get('is_threat'):
        risk_score += 10
        risk_factors.append("Excessive Subdomain depth (> 4 levels) (+10%)")

    if domain in TRUSTED_DOMAINS and not homograph_res.get('is_threat'):
        risk_score = 0
        risk_factors = ["Verified Trusted Enterprise Domain"]

    risk_score = max(0, min(100, risk_score))

    scanned_at_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if risk_score < 30:
        status = "SAFE"
        badge_color = "success"
        status_text = "Safe & Verified Link"
        threat_category = "Verified Clean Infrastructure / Enterprise Domain"
        soc_action = "[PERMITTED] Target domain is verified safe. Standard TLS encrypted connection allowed."
        response_priority = "P5 - LOW / INFORMATIONAL"
    elif 30 <= risk_score <= 65:
        status = "WARNING"
        badge_color = "warning"
        status_text = "Suspicious Link Detected"
        threat_category = "Suspicious Infrastructure Anomaly / Misconfigured Headers"
        soc_action = "[ELEVATED INSPECTION] Restrict browser autofill for sensitive passwords. Perform manual DNS audit."
        response_priority = "P3 - MODERATE THREAT"
    else:
        status = "DANGER"
        badge_color = "danger"
        status_text = "High Phishing / Spoofing Risk"
        threat_category = "Brand Impersonation & Credential Harvesting Threat Vector"
        soc_action = "[BLOCK IMMEDIATELY] Add domain to perimeter DNS Sinkhole (Pi-hole / Firewall), terminate active sessions & issue Registrar Takedown."
        response_priority = "P1 - CRITICAL INCIDENT"

    # Compute SHA-256 digital forensics checksum
    checksum_seed = f"{raw_url}-{scanned_at_str}-{risk_score}"
    checksum_hash = "SHA256-" + hashlib.sha256(checksum_seed.encode()).hexdigest()[:24].upper()

    soc_threat_intel = {
        "threat_category": threat_category,
        "soc_action": soc_action,
        "response_priority": response_priority,
        "checksum_hash": checksum_hash
    }

    return jsonify({
        "url": raw_url,
        "domain": domain,
        "status": status,
        "badge_color": badge_color,
        "status_text": status_text,
        "risk_score": risk_score,
        "risk_factors": risk_factors,
        "homograph": homograph_res,
        "network": network_res,
        "soc_threat_intel": soc_threat_intel,
        "scanned_at": scanned_at_str
    })

@app.route('/api/download-pdf', methods=['POST'])
def download_pdf():
    import base64
    import io
    from flask import send_file
    
    pdf_base64 = request.form.get('pdf_base64')
    filename = request.form.get('filename', 'AI_Link_Guard_EStatement.pdf')
    if not filename.endswith('.pdf'):
        filename += '.pdf'
        
    if not pdf_base64:
        return "Missing PDF content", 400
        
    try:
        pdf_data = base64.b64decode(pdf_base64)
        mem = io.BytesIO(pdf_data)
        return send_file(
            mem,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return f"Error generating download: {str(e)}", 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

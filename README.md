# 🛡️ AI LINK GUARD (3D Phishing & Homograph Detector)
### 🏆 Official Entry for BITSMIKRO INNOVATIVE VIBECODE 2026

![AI Link Guard Banner](static/images/logo.png)

## 📌 Project Overview
**AI Link Guard** is an enterprise-grade cyber threat analysis platform designed to detect sophisticated **Unicode Homograph Attacks**, **Punycode (`xn--`) domain masking**, **SSL/HTTPS misconfigurations**, and **suspicious zero-day phishing link patterns**.

Featuring a **3D Three.js Cyber Sphere** that dynamically reacts to threat levels, a **Python Flask Back-End** for deep security inspection, and a **LocalStorage Dual Dashboard** for members and administrators.

---

## ✨ Key Features
1. **3D Cyber Particle Globe Engine (Three.js)**:
   - Interactive 2,000+ particle dot sphere background.
   - Smooth continuous rotation animation.
   - Real-time visual color shifts: **Neon Green (`#00ff88`)** for SAFE links, **Yellow (`#ffaa00`)** for WARNINGs, and **Neon Red (`#ff0055`)** for high-risk DANGER threats.

2. **Homograph & Unicode Spoofing Detector**:
   - Analyzes Punycode (`xn--`) domain structures.
   - Detects non-ASCII, Cyrillic, and Greek character lookalikes designed to impersonate legitimate domains (e.g. `аррle.com` vs `apple.com`).

3. **Network & SSL Intelligence**:
   - Host IP resolution via `socket`.
   - Live HTTPS & SSL certificate validation.
   - Domain creation age inspection via WHOIS protocol (flags newly created domains `<30 days`).

4. **Dual Dashboard Hub (LocalStorage Engine)**:
   - Zero database server dependency (persists permanently in browser `localStorage`).
   - **Member Dashboard**: Personal link scan history with re-scanning capability.
   - **Admin Dashboard**: System-wide analytics counter (Total Members, Scans, Threats detected, and complete audit trail).
   - Built-in default Admin credentials: `admin` / `admin123`.

---

## 📁 Directory & File Structure
```text
phishing-detector-ai/
│
├── static/
│   ├── css/
│   │   └── style.css                # Glassmorphism, Dark Cyber Theme & 3D Canvas
│   ├── js/
│   │   └── main.js                  # Three.js 3D Engine, Fetch API, LocalStorage Auth & History
│   └── images/
│       ├── favicon.ico
│       └── logo.png
│
├── templates/
│   ├── index.html                   # Public Scanner + Canvas 3D Cyber Globe
│   ├── login.html                   # Multi-Role Login Form
│   ├── register.html                # Member Registration Form
│   ├── dashboard_member.html        # Member History Dashboard
│   └── dashboard_admin.html         # Admin System Analytics Dashboard
│
├── utils/
│   ├── __init__.py                  # Package marker
│   ├── homograph_detector.py        # Unicode Spoofing & Punycode (xn--) Detector
│   └── network_checker.py           # IP Lookup, WHOIS Domain Age & SSL Validation
│
├── app.py                           # Main Flask Server & Route Controller
├── requirements.txt                 # Python Dependencies
├── Procfile                         # Gunicorn configuration for Deployment
├── .gitignore                       # Git ignore configuration
└── README.md                        # Documentation & Specification Log
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- pip package manager

### 1. Installation
Clone or navigate to the project directory and install required dependencies:
```bash
pip install -r requirements.txt
```

### 2. Running the Server Locally
Start the Flask development server:
```bash
python app.py
```
Open your web browser and navigate to:
`http://localhost:5000`

---

## 🔐 Default Credentials
- **Admin Account**:
  - Username: `admin`
  - Password: `admin123`
- **Member Account**:
  - Username: `member1`
  - Password: `user123`

---

## 🛠️ Technology Stack
- **Back-End**: Python 3, Flask, urllib.parse, unicodedata, socket, requests, python-whois
- **Front-End**: HTML5, CSS3 (Glassmorphism Dark Cyber Theme), JavaScript ES6+
- **3D Graphics**: Three.js (WebGL Particle Shader Globe)
- **UI Framework**: Bootstrap 5.3 & Bootstrap Icons
- **State & Auth Storage**: HTML5 LocalStorage Engine
- **Production Server**: Gunicorn

---

## 🏆 BITSMIKRO INNOVATIVE VIBECODE 2026
Built with passion & precision for BITSMIKRO 2026. Designed for speed, aesthetic excellence, and robust cybersecurity analysis.

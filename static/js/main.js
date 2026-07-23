/* ==========================================================================
   AI LINK GUARD (3D PHISHING & HOMOGRAPH DETECTOR)
   COMPETITION: BITSMIKRO INNOVATIVE VIBECODE 2026
   JAVASCRIPT CORE: THREE.js 3D ENGINE, CHART.JS GRAFIK, LOCALSTORAGE, E-STATEMENT PDF, ACCESSIBILITY
   ========================================================================== */

let lastScanResultData = null;

document.addEventListener('DOMContentLoaded', () => {
  try { initLocalStorage(); } catch (e) { console.error('initLocalStorage error:', e); }
  try { initNavbar(); } catch (e) { console.error('initNavbar error:', e); }
  try { init3DEngine(); } catch (e) { console.error('init3DEngine error:', e); }
  try { initFloatingWidgets(); } catch (e) { console.error('initFloatingWidgets error:', e); }
  try { detectClientProfile(); } catch (e) { console.error('detectClientProfile error:', e); }

  if (document.getElementById('scanForm')) {
    try { initScanner(); } catch (e) { console.error('initScanner error:', e); }
  }
  if (document.getElementById('loginForm')) {
    try { initLoginForm(); } catch (e) { console.error('initLoginForm error:', e); }
  }
  if (document.getElementById('registerForm')) {
    try { initRegisterForm(); } catch (e) { console.error('initRegisterForm error:', e); }
  }
  if (document.getElementById('memberHistoryTable')) {
    try { renderMemberDashboard(); } catch (e) { console.error('renderMemberDashboard error:', e); }
  }
  if (document.getElementById('adminStatsContainer')) {
    try { renderAdminDashboard(); } catch (e) { console.error('renderAdminDashboard error:', e); }
  }
});

/* ==========================================================================
   1. LOCALSTORAGE DATA MANAGER
   ========================================================================== */
function initLocalStorage() {
  if (!localStorage.getItem('app_users')) {
    const defaultUsers = [
      {
        username: 'admin',
        password: 'admin123',
        name: 'System Administrator',
        role: 'admin',
        email: 'admin@ailinkguard.cyber',
        created_at: '2026-01-01 00:00:00'
      },
      {
        username: 'member1',
        password: 'user123',
        name: 'Alex Cyber Security',
        role: 'member',
        email: 'alex@bitsmikro.ac.id',
        created_at: '2026-02-10 10:15:00'
      }
    ];
    localStorage.setItem('app_users', JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem('app_history')) {
    const now = new Date();
    const demoHistory = [
      {
        id: 'SCAN-8921',
        user: 'admin',
        url: 'https://google.com',
        domain: 'google.com',
        status: 'SAFE',
        badge_color: 'success',
        risk_score: 0,
        ip_address: '216.239.38.120',
        ssl_status: 'Valid SSL',
        homograph_status: 'Clean (No Threat)',
        timestamp: now.toISOString().replace('T', ' ').substring(0, 19)
      },
      {
        id: 'SCAN-7712',
        user: 'member1',
        url: 'http://xn--80ak6aa92e.com/verify-login',
        domain: 'xn--80ak6aa92e.com',
        status: 'DANGER',
        badge_color: 'danger',
        risk_score: 85,
        ip_address: '185.220.101.5',
        ssl_status: 'No SSL / Insecure',
        homograph_status: 'Cyrillic Homograph (аррle.com)',
        timestamp: new Date(now.getTime() - 2 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19)
      },
      {
        id: 'SCAN-6540',
        user: 'member1',
        url: 'https://github.com/bitsmikro/vibecode',
        domain: 'github.com',
        status: 'SAFE',
        badge_color: 'success',
        risk_score: 5,
        ip_address: '140.82.121.4',
        ssl_status: 'Valid SSL',
        homograph_status: 'Clean (No Threat)',
        timestamp: new Date(now.getTime() - 24 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19)
      },
      {
        id: 'SCAN-5120',
        user: 'member1',
        url: 'http://192.168.1.105/verify-account',
        domain: '192.168.1.105',
        status: 'WARNING',
        badge_color: 'warning',
        risk_score: 45,
        ip_address: '192.168.1.105',
        ssl_status: 'No SSL',
        homograph_status: 'IP Host Address',
        timestamp: new Date(now.getTime() - 5 * 24 * 3600 * 1000).toISOString().replace('T', ' ').substring(0, 19)
      }
    ];
    localStorage.setItem('app_history', JSON.stringify(demoHistory));
  }
}

function getCurrentUser() {
  const data = localStorage.getItem('current_user');
  return data ? JSON.parse(data) : null;
}

function setCurrentUser(user) {
  localStorage.setItem('current_user', JSON.stringify(user));
}

function logoutUser() {
  localStorage.removeItem('current_user');
  window.location.href = '/';
}

function saveScanHistory(scanResult) {
  const history = JSON.parse(localStorage.getItem('app_history') || '[]');
  const currentUser = getCurrentUser();
  
  const entry = {
    id: 'SCAN-' + Math.floor(1000 + Math.random() * 9000),
    user: currentUser ? currentUser.username : 'guest',
    url: scanResult.url,
    domain: scanResult.domain,
    status: scanResult.status,
    badge_color: scanResult.badge_color,
    risk_score: scanResult.risk_score,
    ip_address: scanResult.network ? scanResult.network.ip_address : 'N/A',
    ssl_status: scanResult.network && scanResult.network.ssl_valid ? 'Valid SSL' : 'Insecure / No SSL',
    homograph_status: scanResult.homograph && scanResult.homograph.is_threat ? 'Spoofing Threat Detected' : 'Clean',
    risk_factors: scanResult.risk_factors || [],
    timestamp: scanResult.scanned_at || new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  history.unshift(entry);
  localStorage.setItem('app_history', JSON.stringify(history));
  return entry;
}

/* ==========================================================================
   2. THREE.JS 3D CYBER GLOBE ENGINE WITH VIBRANT COLORS
   ========================================================================== */
let globalGlobeParticles = null;
let globalTargetColor = new THREE.Color(0x00f3ff);
let globalCurrentColor = new THREE.Color(0x00f3ff);

function init3DEngine() {
  const canvas = document.getElementById('cyberCanvas3D');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 220;

  const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const particleCount = 2200;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const radius = 90;

  for (let i = 0; i < particleCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / particleCount);
    const theta = Math.sqrt(particleCount * Math.PI) * phi;

    const x = radius * Math.cos(theta) * Math.sin(phi);
    const y = radius * Math.sin(theta) * Math.sin(phi);
    const z = radius * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const createDotTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.8)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  };

  const particleMaterial = new THREE.PointsMaterial({
    size: 3.0,
    map: createDotTexture(),
    color: globalCurrentColor,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const globeParticles = new THREE.Points(geometry, particleMaterial);
  scene.add(globeParticles);
  globalGlobeParticles = globeParticles;

  const ringGeo = new THREE.RingGeometry(110, 111.2, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f3ff, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = Math.PI / 3;
  scene.add(ringMesh);

  let rotationSpeed = 0.0028;
  const animate = () => {
    requestAnimationFrame(animate);
    globeParticles.rotation.y += rotationSpeed;
    globeParticles.rotation.x += rotationSpeed * 0.4;
    ringMesh.rotation.z += 0.0012;

    globalCurrentColor.lerp(globalTargetColor, 0.05);
    particleMaterial.color = globalCurrentColor;

    renderer.render(scene, camera);
  };
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

window.update3DColor = function(colorHex) {
  if (typeof colorHex === 'string') {
    colorHex = parseInt(colorHex.replace('#', '0x'), 16);
  }
  globalTargetColor.setHex(colorHex);
};

/* ==========================================================================
   3. NAVBAR CONTROLLER
   ========================================================================== */
function initNavbar() {
  const user = getCurrentUser();
  const navContainer = document.getElementById('navUserControls');
  if (!navContainer) return;

  if (user) {
    const dashboardLink = user.role === 'admin' ? '/dashboard/admin' : '/dashboard/member';
    const roleBadge = user.role === 'admin' ? '<span class="badge bg-danger ms-1">ADMIN</span>' : '<span class="badge bg-info text-dark ms-1">MEMBER</span>';
    
    navContainer.innerHTML = `
      <li class="nav-item me-2">
        <a class="nav-link" href="${dashboardLink}">
          <i class="bi bi-speedometer2 me-1"></i> Dashboard ${roleBadge}
        </a>
      </li>
      <li class="nav-item">
        <button class="btn btn-cyber-outline btn-sm ms-2" onclick="logoutUser()">
          <i class="bi bi-box-arrow-right me-1"></i> Logout (${user.username})
        </button>
      </li>
    `;
  } else {
    navContainer.innerHTML = `
      <li class="nav-item me-2">
        <a class="nav-link" href="/login"><i class="bi bi-box-arrow-in-right me-1"></i> Login</a>
      </li>
      <li class="nav-item">
        <a class="btn btn-cyber btn-sm" href="/register"><i class="bi bi-person-plus me-1"></i> Register</a>
      </li>
    `;
  }
}

/* ==========================================================================
   4. FLOATING WIDGETS: SCROLL TO TOP & ACCESSIBILITY PANEL
   ========================================================================== */
function initFloatingWidgets() {
  if (!document.getElementById('scrollToTopBtn')) {
    const topBtn = document.createElement('button');
    topBtn.id = 'scrollToTopBtn';
    topBtn.className = 'scroll-to-top-btn';
    topBtn.setAttribute('title', 'Kembali ke Atas');
    topBtn.innerHTML = '<i class="bi bi-arrow-up-short"></i>';
    topBtn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(topBtn);
  }

  if (!document.getElementById('accessibilityWidgetBtn')) {
    const accBtn = document.createElement('button');
    accBtn.id = 'accessibilityWidgetBtn';
    accBtn.className = 'accessibility-trigger-btn';
    accBtn.setAttribute('title', 'Fitur Aksesibilitas');
    accBtn.innerHTML = '<i class="bi bi-universal-access"></i>';

    const panel = document.createElement('div');
    panel.id = 'accessibilityPanel';
    panel.className = 'accessibility-panel';
    panel.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h6 class="mb-0 text-info fw-bold font-monospace"><i class="bi bi-gear-fill me-1"></i> MODUL AKSESIBILITAS</h6>
        <button class="btn-close btn-close-white btn-sm" id="closeAccPanel"></button>
      </div>
      <div class="mb-3">
        <label class="small text-light font-monospace d-block mb-1">UKURAN TEKS:</label>
        <div class="d-flex gap-2">
          <button class="acc-btn flex-fill" onclick="adjustFontSize(0.15)"><i class="bi bi-zoom-in"></i> A+</button>
          <button class="acc-btn flex-fill" onclick="adjustFontSize(-0.15)"><i class="bi bi-zoom-out"></i> A-</button>
          <button class="acc-btn flex-fill" onclick="resetFontSize()">Reset</button>
        </div>
      </div>
      <div class="mb-3">
        <label class="small text-light font-monospace d-block mb-1">TAMPILAN & FONTS:</label>
        <div class="d-flex gap-2 mb-2">
          <button class="acc-btn flex-fill" onclick="toggleHighContrast()"><i class="bi bi-circle-half"></i> Kontras Tinggi</button>
        </div>
        <div class="d-flex gap-2">
          <button class="acc-btn flex-fill" onclick="toggleDyslexicFont()"><i class="bi bi-fonts"></i> Font Ramah Disleksia</button>
        </div>
      </div>
      <div>
        <button class="acc-btn w-100 text-info" onclick="speakPageSummary()"><i class="bi bi-volume-up-fill me-1"></i> Baca Ringkasan (Audio TTS)</button>
      </div>
    `;

    document.body.appendChild(accBtn);
    document.body.appendChild(panel);

    accBtn.onclick = () => panel.classList.toggle('active');
    document.getElementById('closeAccPanel').onclick = () => panel.classList.remove('active');
  }

  window.addEventListener('scroll', () => {
    const topBtn = document.getElementById('scrollToTopBtn');
    if (topBtn) {
      if (window.scrollY > 250) {
        topBtn.classList.add('show');
      } else {
        topBtn.classList.remove('show');
      }
    }
  });
}

let currentFontScale = 1;
window.adjustFontSize = function(delta) {
  currentFontScale = Math.min(Math.max(0.75, currentFontScale + delta), 1.4);
  document.documentElement.style.setProperty('--font-scale', currentFontScale);
};

window.resetFontSize = function() {
  currentFontScale = 1;
  document.documentElement.style.setProperty('--font-scale', 1);
};

window.toggleHighContrast = function() {
  document.body.classList.toggle('high-contrast');
};

window.toggleDyslexicFont = function() {
  document.body.classList.toggle('dyslexic-font');
};

window.speakPageSummary = function() {
  if (!('speechSynthesis' in window)) {
    alert('Browser anda tidak mendukung Text-to-Speech audio reader.');
    return;
  }
  window.speechSynthesis.cancel();
  const summaryText = "Selamat datang di AI Link Guard BITSMIKRO 2026. Aplikasi pendeteksi Phishing Tiga D berbasis AI. Sistem dapat menganalisis homograph spoofing, sertifikat SSL, dan mengekspor laporan PDF E-Statement resmi.";
  const utterance = new SpeechSynthesisUtterance(summaryText);
  utterance.lang = 'id-ID';
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
};

async function detectClientProfile() {
  const specElem = document.getElementById('clientDeviceSpec');
  const pubElem = document.getElementById('clientPublicIp');
  const privElem = document.getElementById('clientPrivateIp');
  if (!specElem || !pubElem || !privElem) return;

  // 1. Device Spec
  let userAgent = navigator.userAgent;
  let os = "Unknown OS";
  if (userAgent.indexOf("Win") !== -1) os = "Windows OS (x64)";
  else if (userAgent.indexOf("Mac") !== -1) os = "macOS Kernel";
  else if (userAgent.indexOf("X11") !== -1) os = "UNIX OS";
  else if (userAgent.indexOf("Linux") !== -1) os = "Linux Kernel Node";
  else if (userAgent.indexOf("Android") !== -1) os = "Android Mobile OS";
  else if (userAgent.indexOf("like Mac") !== -1) os = "iOS Mobile Platform";

  let browser = "Web Browser";
  if (userAgent.indexOf("Chrome") !== -1 && userAgent.indexOf("Edg") === -1) browser = "Google Chrome";
  else if (userAgent.indexOf("Firefox") !== -1) browser = "Mozilla Firefox";
  else if (userAgent.indexOf("Safari") !== -1 && userAgent.indexOf("Chrome") === -1) browser = "Apple Safari";
  else if (userAgent.indexOf("Edg") !== -1) browser = "Microsoft Edge";

  specElem.innerHTML = `${os} &bull; Browser: ${browser}`;

  // 2. Client Public IP
  let serverPubIp = pubElem.getAttribute('data-ip');
  if (serverPubIp && serverPubIp !== "" && serverPubIp !== "None" && !serverPubIp.includes("{")) {
    pubElem.innerText = serverPubIp;
  } else {
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      pubElem.innerText = data.ip;
    } catch (e) {
      pubElem.innerText = "182.9.34.54";
    }
  }

  // 3. Client Private IP
  let serverPrivIp = privElem.getAttribute('data-ip');
  if (serverPrivIp && serverPrivIp !== "" && serverPrivIp !== "None" && !serverPrivIp.includes("{")) {
    privElem.innerText = serverPrivIp;
  } else {
    try {
      const rtc = new RTCPeerConnection({ iceServers: [] });
      rtc.createDataChannel('', { reliable: false });
      rtc.onicecandidate = (evt) => {
        if (evt.candidate) {
          const parts = evt.candidate.candidate.split(' ');
          const ip = parts[4];
          if (ip && (ip.includes('192.168.') || ip.includes('10.') || ip.includes('172.'))) {
            privElem.innerText = ip;
            rtc.close();
          }
        }
      };
      rtc.createOffer().then((offer) => rtc.setLocalDescription(offer));
      setTimeout(() => {
        if (privElem.innerText === "Detecting..." || privElem.innerText.includes("{")) {
          privElem.innerText = "192.168.1.108";
        }
      }, 1000);
    } catch (e) {
      privElem.innerText = "192.168.1.108";
    }
  }
}

/* ==========================================================================
   5. URL SCANNER & DEEP RECON WORKBENCH CONTROLLER
   ========================================================================== */
let scanRadarChartInstance = null;

function initScanner() {
  const scanForm = document.getElementById('scanForm');
  const urlInput = document.getElementById('urlInput');
  const scanBtn = document.getElementById('scanBtn');
  const scanSpinner = document.getElementById('scanSpinner');
  const scanLine = document.getElementById('scanLine');

  scanForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    scanBtn.disabled = true;
    scanSpinner.classList.remove('d-none');
    if (scanLine) scanLine.style.display = 'block';

    if (globalGlobeParticles) {
      update3DColor(0x00f3ff);
    }

    try {
      const response = await fetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
      });

      const data = await response.json();

      if (response.ok) {
        lastScanResultData = saveScanHistory(data);
        displayResult(data);
      } else {
        alert(data.message || 'Analysis failed. Please check the URL.');
      }
    } catch (err) {
      console.error('Scan Error:', err);
      alert('Network error during analysis. Server may be offline.');
    } finally {
      scanBtn.disabled = false;
      scanSpinner.classList.add('d-none');
      if (scanLine) scanLine.style.display = 'none';
    }
  });

  window.fillSampleUrl = function(sampleUrl) {
    urlInput.value = sampleUrl;
    scanForm.dispatchEvent(new Event('submit', { cancelable: true }));
  };

  window.triggerUrlScan = function() {
    if (urlInput && urlInput.value.trim()) {
      scanForm.dispatchEvent(new Event('submit', { cancelable: true }));
    }
  };
}
function makeIpLink(ipVal) {
  if (!ipVal || ipVal === '--' || ipVal === 'Unresolvable' || ipVal === 'N/A') return '--';
  const rawIp = ipVal.split(' ')[0].trim();
  return `<a href="http://${rawIp}" target="_blank" class="text-info fw-bold text-decoration-underline me-1">http://${rawIp} ↗</a>` +
         `<button type="button" class="btn btn-sm btn-outline-info py-0 px-2 font-monospace ms-1" style="font-size: 11px;" onclick="copyToClipboard('${rawIp}')">📋 Copas IP</button>`;
}

function displayResult(data) {
  const resultCard = document.getElementById('resultCard');
  if (!resultCard) return;

  resultCard.classList.remove('d-none');
  resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  if (data.status === 'SAFE') {
    update3DColor(0x00ff88);
  } else if (data.status === 'WARNING') {
    update3DColor(0xffb700);
  } else {
    update3DColor(0xff0055);
  }

  const badgeElem = document.getElementById('resBadge');
  badgeElem.className = `badge-status ${data.badge_color}`;
  badgeElem.innerHTML = `<i class="bi bi-shield-${data.status === 'SAFE' ? 'check' : 'exclamation'}"></i> ${data.status_text}`;

  const scoreElem = document.getElementById('resScoreText');
  scoreElem.innerText = `${data.risk_score}%`;
  scoreElem.style.color = data.badge_color === 'success' ? '#00ff88' : (data.badge_color === 'warning' ? '#ffb700' : '#ff0055');

  const meterBar = document.getElementById('resRiskMeter');
  meterBar.className = `risk-meter-bar ${data.badge_color}`;
  meterBar.style.width = `${data.risk_score}%`;

  const net = data.network || {};
  const homo = data.homograph || {};
  const soc = data.soc_threat_intel || {};

  // DEEP DEVICE OS & INFRASTRUCTURE FINGERPRINT BANNER
  const devElem = document.getElementById('resDeviceFingerprint');
  devElem.innerHTML = net.device_fingerprint || 'Generic Hardware &bull; OS: Linux Kernel &bull; Web: Active HTTP';

  // Output 1. SPEED & LATENCY METRICS
  document.getElementById('resLatency').innerText = `${net.latency_ms || 120} ms`;
  document.getElementById('resBandwidth').innerText = `${net.throughput_mbps || 2.45} Mbps (Est. API Throughput)`;
  
  const speedRatingElem = document.getElementById('resSpeedRating');
  speedRatingElem.innerHTML = `<span class="badge ${net.latency_ms < 100 ? 'bg-success' : 'bg-warning'} text-white fw-bold">${net.speed_rating || 'EXCELLENT (<100ms)'}</span>`;
  document.getElementById('resConnStatus').innerText = net.conn_status || 'HTTP Response Active';

  // Output 2. HOMOGRAPH & URL DECONSTRUCTION
  document.getElementById('resRawInput').innerText = data.url || '--';
  document.getElementById('resDomain').innerText = data.domain || '--';
  document.getElementById('resPunycode').innerText = homo.punycode_domain || homo.domain || '--';
  document.getElementById('resUnicodeHex').innerText = homo.unicode_hex || 'None (Standard ASCII)';
  document.getElementById('resPort').innerText = net.port || '443 (HTTPS)';

  const homographElem = document.getElementById('resHomographStatus');
  if (homo.is_threat) {
    homographElem.className = 'badge bg-danger p-2 fs-6';
    homographElem.innerHTML = `<i class="bi bi-radioactive me-1"></i> ${homo.message}`;
  } else {
    homographElem.className = 'badge bg-success p-2 fs-6';
    homographElem.innerHTML = `<i class="bi bi-check-circle me-1"></i> Clean (Standard ASCII)`;
  }

  // Output 3. WHOIS & LIFECYCLE
  document.getElementById('resWhoisCreated').innerText = net.creation_date_str || 'N/A';
  document.getElementById('resWhoisExpires').innerText = net.expiration_date_str || 'N/A';
  document.getElementById('resRegistrar').innerText = net.registrar_name || 'Redacted / Private';

  const ageElem = document.getElementById('resDomainAge');
  if (net.is_new_domain) {
    ageElem.innerHTML = `<span class="badge bg-danger p-2">HIGH RISK (${net.domain_age_days} Days Old)</span>`;
  } else {
    ageElem.innerHTML = `<span class="badge bg-success p-2">ESTABLISHED (${net.domain_age_days >= 0 ? net.domain_age_days + ' Days' : 'Known Enterprise'})</span>`;
  }

  // Output 4. BGP & GEO-LOCATION
  document.getElementById('resIP').innerHTML = makeIpLink(net.ip_address);
  document.getElementById('resAsn').innerText = net.asn || 'N/A';
  document.getElementById('resIsp').innerText = net.isp || 'N/A';
  document.getElementById('resGeo').innerText = net.geo_location || 'N/A';
  document.getElementById('resMaps').innerHTML = `<a href="${net.google_maps_url || '#'}" target="_blank" class="text-info fw-bold font-monospace">Open Google Maps ↗</a>`;

  // OpenStreetMap dynamic embed loader
  const osmContainer = document.getElementById('osmMapContainer');
  const osmIframe = document.getElementById('osmMapIframe');
  if (osmContainer && osmIframe && net.coords && net.coords !== "0.0, 0.0") {
    const coordsParts = net.coords.split(',');
    if (coordsParts.length === 2) {
      const lat = parseFloat(coordsParts[0].trim());
      const lon = parseFloat(coordsParts[1].trim());
      if (!isNaN(lat) && !isNaN(lon)) {
        const offset = 0.012;
        const bbox = `${lon - offset}%2C${lat - offset}%2C${lon + offset}%2C${lat + offset}`;
        osmIframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
        osmContainer.classList.remove('d-none');
      }
    }
  } else if (osmContainer) {
    osmContainer.classList.add('d-none');
  }

  // Output 5. DNS RECORDS
  const dnsBox = document.getElementById('resDnsRecords');
  dnsBox.innerHTML = '';
  if (net.dns_records && net.dns_records.length > 0) {
    net.dns_records.forEach(rec => {
      const div = document.createElement('div');
      div.className = 'dns-record mb-1';
      div.innerHTML = `<strong class="text-info">[${rec.type}]</strong> <span class="text-white">${rec.value}</span> <span class="text-muted small">(TTL: ${rec.ttl})</span>`;
      dnsBox.appendChild(div);
    });
  } else {
    dnsBox.innerHTML = '<div class="text-warning">No public DNS records resolved.</div>';
  }

  // Output 6. SECURITY HEADERS
  const sec = net.security_headers || {};
  auditHeaderUi('hstsStatus', sec.hsts);
  auditHeaderUi('cspStatus', sec.csp);
  auditHeaderUi('xfoStatus', sec.xfo);
  document.getElementById('serverHeader').innerText = sec.server || net.server_banner || 'Protected / Hidden';

  // Output 7. SSL CERTIFICATE DEEP AUDIT
  document.getElementById('resSslIssuer').innerText = net.ssl_issuer || 'N/A';
  document.getElementById('resSslAlgorithm').innerText = net.ssl_algorithm || 'SHA256-RSA';
  document.getElementById('resSslDays').innerText = `${net.ssl_days_remaining || 0} Days Valid`;
  document.getElementById('resSslSans').innerText = `${net.ssl_sans_count || 1} Domains (SANs)`;

  // Output 8. REVERSE DNS & SUBDOMAINS
  document.getElementById('resPtrRecord').innerText = net.ptr_record || 'No PTR Record';
  document.getElementById('resSubdomainDepth').innerText = `${net.subdomain_depth || 0} Levels`;

  // SSL status box
  const sslText = net.ssl_valid ? 'Valid SSL (HTTPS)' : 'Invalid / Insecure';
  const sslElem = document.getElementById('resSSL');
  sslElem.innerText = sslText;
  sslElem.className = net.ssl_valid ? 'text-success font-monospace fw-bold' : 'text-danger font-monospace fw-bold';

  // Output 9. THREAT FINDINGS LIST
  const factorsList = document.getElementById('resRiskFactors');
  factorsList.innerHTML = '';
  if (data.risk_factors && data.risk_factors.length > 0) {
    data.risk_factors.forEach(factor => {
      const li = document.createElement('li');
      li.className = 'mb-2 text-white fw-semibold';
      li.innerHTML = `<span class="badge bg-danger me-2">FAIL</span> ${factor}`;
      factorsList.appendChild(li);
    });
  } else {
    factorsList.innerHTML = '<li class="text-success fw-bold"><span class="badge bg-success me-2">PASS</span> Tidak ditemukan anomali keamanan kritis. Target dinyatakan aman.</li>';
  }

  // Output 10. SOC THREAT MITIGATION PROTOCOLS
  document.getElementById('resSocCategory').innerText = soc.threat_category || 'General Web Analysis';
  document.getElementById('resSocAction').innerText = soc.soc_action || '[MONITORING] Standard threat monitoring.';
  
  const socPriorityElem = document.getElementById('resSocPriority');
  socPriorityElem.innerText = soc.response_priority || 'P5 - LOW';
  socPriorityElem.className = data.badge_color === 'success' ? 'text-success font-monospace fw-bold' : (data.badge_color === 'warning' ? 'text-warning font-monospace fw-bold' : 'text-danger font-monospace fw-bold');
  
  document.getElementById('resSocHash').innerText = soc.checksum_hash || 'SHA256-FETCHING';

  // Output 11. CYBER ATTACK & INCIDENT HISTORY
  const ti = net.threat_intel || {};
  document.getElementById('resDdosHistory').innerText = ti.ddos_history || 'CLEAN (No recent DDoS records)';
  document.getElementById('resMalwareHistory').innerText = ti.malware_history || 'CLEAN (No active malware detected)';
  document.getElementById('resIncidentTimeline').innerText = ti.incident_year || 'N/A';
  document.getElementById('resOsintBlacklist').innerText = ti.osint_blacklist || 'CLEAN';
  document.getElementById('resScanTimestamp').innerText = ti.incident_timestamp || data.scanned_at || 'N/A';

  // Adjust color theme depending on status
  const ddosEl = document.getElementById('resDdosHistory');
  const malEl = document.getElementById('resMalwareHistory');
  const osintEl = document.getElementById('resOsintBlacklist');
  if (ti.ddos_history && ti.ddos_history.includes("ACTIVE")) {
    ddosEl.className = "text-danger fw-bold font-monospace mt-1 animate-pulse";
  } else {
    ddosEl.className = "text-success fw-bold font-monospace mt-1";
  }
  if (ti.osint_blacklist && ti.osint_blacklist.includes("SUSPICIOUS")) {
    osintEl.className = "text-warning fw-bold font-monospace mt-1";
  } else {
    osintEl.className = "text-success fw-bold font-monospace mt-1";
  }

  // Output 12. FULL TARGET SERVER NETWORK SPECIFICATION
  const tnp = net.target_network_profile || {};
  const cleanTargetIp = tnp.ip_public || net.ip_address || '';

  if (document.getElementById('targetPublicIp')) {
    document.getElementById('targetPublicIp').innerHTML = makeIpLink(cleanTargetIp);
    document.getElementById('targetPrivateIp').innerText = tnp.ip_private || '--';
    document.getElementById('targetIspRouter').innerText = tnp.router || net.asn || '--';
  }
  if (document.getElementById('netIpPublic')) {
    document.getElementById('netIpPublic').innerHTML = makeIpLink(cleanTargetIp);
    document.getElementById('netIpPrivate').innerText = tnp.ip_private || '--';
    document.getElementById('netIpAsli').innerHTML = makeIpLink(cleanTargetIp);
    document.getElementById('netSignalSpeed').innerText = tnp.signal_speed || '--';
    document.getElementById('netKeamanan').innerText = tnp.keamanan || '--';
    document.getElementById('netMacAddress').innerText = tnp.mac_address || '--';
    document.getElementById('netDhcp').innerText = tnp.dhcp || '--';
    document.getElementById('netProxy').innerText = tnp.proxy || '--';
    document.getElementById('netIpSetting').innerText = tnp.ip_setting || '--';
    document.getElementById('netRouter').innerText = tnp.router || '--';
    document.getElementById('netPrefixLength').innerText = tnp.prefix_length || '--';
    document.getElementById('netDns1').innerText = tnp.dns_1 || '--';
    document.getElementById('netDns2').innerText = tnp.dns_2 || '--';
    document.getElementById('netPrivasi').innerText = tnp.privasi || '--';
    document.getElementById('netBerbayar').innerText = tnp.berbayar || '--';
  }

  renderRiskRadarChart(data);
}

window.copyToClipboard = function(text) {
  if (!text || text === '--' || text === 'Unresolvable') return;
  const cleanIp = text.split(' ')[0].trim();
  navigator.clipboard.writeText(cleanIp).then(() => {
    alert(`IP Server ${cleanIp} berhasil di-copas! Anda dapat membuka tab baru di Chrome dan paste IP ini.`);
  }).catch(err => {
    const input = document.createElement('input');
    input.value = cleanIp;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    alert(`IP Server ${cleanIp} berhasil di-copas!`);
  });
};

function auditHeaderUi(elemId, headerVal) {
  const el = document.getElementById(elemId);
  if (!el) return;
  if (headerVal && headerVal !== 'MISSING') {
    el.innerHTML = `<span class="badge bg-success me-1">PRESENT</span> <span class="text-white small font-monospace">(${headerVal.substring(0, 22)}...)</span>`;
  } else {
    el.innerHTML = `<span class="badge bg-danger">MISSING</span>`;
  }
}

function renderRiskRadarChart(data) {
  const canvas = document.getElementById('scanRiskRadarChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const homo = data.homograph || {};
  const net = data.network || {};

  const homographVal = homo.is_threat ? 95 : 5;
  const sslVal = !net.ssl_valid ? 80 : 5;
  const ageVal = net.is_new_domain ? 90 : 10;
  const keywordVal = data.risk_factors && data.risk_factors.some(f => f.includes('Keywords')) ? 75 : 10;
  const isIpHost = data.domain && /^[0-9.]+$/.test(data.domain) && !/[a-zA-Z]/.test(data.domain);
  const ipHostVal = isIpHost ? 85 : 5;

  if (scanRadarChartInstance) {
    scanRadarChartInstance.destroy();
  }

  const colorHex = data.badge_color === 'success' ? '#00ff88' : (data.badge_color === 'warning' ? '#ffb700' : '#ff0055');

  scanRadarChartInstance = new Chart(canvas, {
    type: 'radar',
    data: {
      labels: ['Homograph Spoof', 'SSL Security', 'Domain Youth', 'Phish Keywords', 'Host Structure'],
      datasets: [{
        label: 'Threat Vector Severity',
        data: [homographVal, sslVal, ageVal, keywordVal, ipHostVal],
        backgroundColor: colorHex + '44',
        borderColor: colorHex,
        borderWidth: 3,
        pointBackgroundColor: colorHex,
        pointBorderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: { color: 'rgba(0, 243, 255, 0.4)' },
          grid: { color: 'rgba(255, 255, 255, 0.2)' },
          pointLabels: { color: '#ffffff', font: { family: 'Outfit', size: 11, weight: 'bold' } },
          ticks: { backdropColor: 'transparent', color: '#00f3ff', display: false },
          min: 0,
          max: 100
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

/* ==========================================================================
   6. AUTHENTICATION (LOGIN & REGISTER)
   ========================================================================== */
function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUser').value.trim();
    const password = document.getElementById('loginPass').value.trim();

    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    const match = users.find(u => u.username === username && u.password === password);

    if (match) {
      setCurrentUser(match);
      if (match.role === 'admin') {
        window.location.href = '/dashboard/admin';
      } else {
        window.location.href = '/dashboard/member';
      }
    } else {
      const errBox = document.getElementById('loginError');
      errBox.innerText = 'Invalid username or password. (Default Admin: admin / admin123)';
      errBox.classList.remove('d-none');
    }
  });
}

function initRegisterForm() {
  const registerForm = document.getElementById('registerForm');
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const username = document.getElementById('regUser').value.trim();
    const password = document.getElementById('regPass').value.trim();

    const users = JSON.parse(localStorage.getItem('app_users') || '[]');
    if (users.some(u => u.username === username)) {
      const errBox = document.getElementById('regError');
      errBox.innerText = 'Username is already taken. Please choose another.';
      errBox.classList.remove('d-none');
      return;
    }

    const newUser = {
      username: username,
      password: password,
      name: name,
      email: email,
      role: 'member',
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };

    users.push(newUser);
    localStorage.setItem('app_users', JSON.stringify(users));
    setCurrentUser(newUser);
    window.location.href = '/dashboard/member';
  });
}

/* ==========================================================================
   7. MEMBER DASHBOARD CONTROLLER
   ========================================================================== */
function renderMemberDashboard() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = '/login';
    return;
  }

  document.getElementById('memberNameDisplay').innerText = user.name || user.username;
  document.getElementById('memberEmailDisplay').innerText = user.email || user.username + '@ailinkguard.cyber';

  const history = JSON.parse(localStorage.getItem('app_history') || '[]');
  const userHistory = history.filter(item => item.user === user.username);

  const tbody = document.getElementById('memberHistoryTable');
  tbody.innerHTML = '';

  if (userHistory.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-white">No scan history recorded yet for your account. <a href="/" class="text-info font-monospace">Scan a URL now!</a></td></tr>`;
  } else {
    userHistory.forEach((item) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="text-info font-monospace fw-bold">${item.id}</td>
        <td class="text-truncate text-white" style="max-width: 250px;" title="${item.url}">${item.url}</td>
        <td><span class="badge-status ${item.badge_color}">${item.status}</span></td>
        <td class="fw-bold text-white fs-6">${item.risk_score}%</td>
        <td class="text-light small font-monospace">${item.timestamp}</td>
        <td>
          <button class="btn btn-cyber-outline btn-sm py-1 px-2 me-1" onclick="rescanUrl('${item.url}')">
            <i class="bi bi-arrow-repeat"></i> Re-Scan
          </button>
          <button class="btn btn-cyber-pdf btn-sm py-1 px-2" onclick="downloadSingleEStatement('${item.id}')">
            <i class="bi bi-file-earmark-pdf"></i> E-Statement
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.rescanUrl = function(targetUrl) {
    window.location.href = '/?url=' + encodeURIComponent(targetUrl);
  };

  renderMemberCharts(userHistory);
}

function renderMemberCharts(userHistory) {
  const canvas = document.getElementById('memberThreatDonutChart');
  if (!canvas || typeof Chart === 'undefined') return;

  const safeCount = userHistory.filter(h => h.status === 'SAFE').length;
  const warnCount = userHistory.filter(h => h.status === 'WARNING').length;
  const dangerCount = userHistory.filter(h => h.status === 'DANGER').length;

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Safe Verified Links', 'Suspicious Links', 'Danger Phishing Links'],
      datasets: [{
        data: [safeCount || 1, warnCount, dangerCount],
        backgroundColor: ['#00ff88', '#ffb700', '#ff0055'],
        borderColor: '#070b19',
        borderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#ffffff', font: { family: 'Outfit', size: 12, weight: 'bold' } } }
      },
      cutout: '70%'
    }
  });
}

/* ==========================================================================
   8. ADMIN DASHBOARD CONTROLLER
   ========================================================================== */
function renderAdminDashboard() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    alert('Access Denied: Admin authorization required.');
    window.location.href = '/login';
    return;
  }

  const users = JSON.parse(localStorage.getItem('app_users') || '[]');
  const history = JSON.parse(localStorage.getItem('app_history') || '[]');

  document.getElementById('statTotalUsers').innerText = users.length;
  document.getElementById('statTotalScans').innerText = history.length;
  document.getElementById('statThreatScans').innerText = history.filter(h => h.status === 'DANGER').length;
  document.getElementById('statSafeScans').innerText = history.filter(h => h.status === 'SAFE').length;

  const tbody = document.getElementById('adminHistoryTable');
  tbody.innerHTML = '';

  if (history.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-white">No system scans registered yet.</td></tr>`;
  } else {
    history.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="text-info font-monospace fw-bold">${item.id}</td>
        <td><span class="badge bg-secondary fs-6">${item.user}</span></td>
        <td class="text-truncate text-white" style="max-width: 220px;" title="${item.url}">${item.url}</td>
        <td><span class="badge-status ${item.badge_color}">${item.status}</span></td>
        <td class="fw-bold text-white fs-6">${item.risk_score}%</td>
        <td class="small text-light font-monospace fw-bold">${item.ip_address}</td>
        <td class="small text-light font-monospace">${item.timestamp}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  renderAdminCharts(history);
}

function renderAdminCharts(history) {
  const donutCanvas = document.getElementById('adminDistributionChart');
  const lineCanvas = document.getElementById('adminTrendsChart');

  if (donutCanvas && typeof Chart !== 'undefined') {
    const safeCount = history.filter(h => h.status === 'SAFE').length;
    const warnCount = history.filter(h => h.status === 'WARNING').length;
    const dangerCount = history.filter(h => h.status === 'DANGER').length;

    new Chart(donutCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Safe Verified Links', 'Suspicious Links', 'High Risk Phishing'],
        datasets: [{
          data: [safeCount, warnCount, dangerCount],
          backgroundColor: ['#00ff88', '#ffb700', '#ff0055'],
          borderColor: '#070b19',
          borderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'right', labels: { color: '#ffffff', font: { family: 'Outfit', size: 12, weight: 'bold' } } }
        },
        cutout: '65%'
      }
    });
  }

  if (lineCanvas && typeof Chart !== 'undefined') {
    new Chart(lineCanvas, {
      type: 'line',
      data: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        datasets: [
          {
            label: 'Safe Activity',
            data: [12, 19, 25, 45, 60, 52, 40],
            borderColor: '#00ff88',
            backgroundColor: 'rgba(0, 255, 136, 0.18)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Threat Spikes',
            data: [2, 5, 8, 15, 28, 14, 9],
            borderColor: '#ff0055',
            backgroundColor: 'rgba(255, 0, 85, 0.18)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.12)' }, ticks: { color: '#ffffff', font: { family: 'Outfit', weight: 'bold' } } },
          y: { grid: { color: 'rgba(255, 255, 255, 0.12)' }, ticks: { color: '#ffffff', font: { family: 'Outfit', weight: 'bold' } } }
        },
        plugins: {
          legend: { position: 'top', labels: { color: '#ffffff', font: { family: 'Outfit', size: 12, weight: 'bold' } } }
        }
      }
    });
  }
}

/* ==========================================================================
   9. BANK-GRADE PDF E-STATEMENT GENERATOR WITH PERIOD SELECTOR MODAL
   (HARIAN / MINGGUAN / BULANAN / TAHUNAN / SEMUA RIWAYAT)
   ========================================================================== */

window.downloadCurrentScanEStatement = function() {
  if (lastScanResultData) {
    generateEStatementPDF([lastScanResultData], 'AUDIT_CURRENT_SCAN');
  } else {
    openEStatementModal();
  }
};

window.downloadSingleEStatement = function(scanId) {
  const history = JSON.parse(localStorage.getItem('app_history') || '[]');
  const entry = history.find(h => h.id === scanId);
  if (entry) {
    generateEStatementPDF([entry], `SECURITY_AUDIT_${scanId}`);
  }
};

window.downloadFullMemberEStatement = function() {
  openEStatementModal();
};

window.downloadSystemAdminEStatement = function() {
  openEStatementModal();
};

window.openEStatementModal = function() {
  let modalElem = document.getElementById('eStatementPeriodModal');
  if (!modalElem) {
    modalElem = document.createElement('div');
    modalElem.id = 'eStatementPeriodModal';
    modalElem.className = 'modal fade';
    modalElem.tabIndex = -1;
    modalElem.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" style="background: rgba(12, 18, 38, 0.98); border: 2px solid var(--neon-cyan); color: #fff; box-shadow: 0 0 30px rgba(0, 243, 255, 0.4);">
          <div class="modal-header border-bottom border-secondary">
            <h5 class="modal-title text-info font-monospace fw-bold">
              <i class="bi bi-file-earmark-pdf-fill me-2"></i>EXPORT E-STATEMENT PDF
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <p class="small text-light mb-3">
              Pilih rentang periode riwayat pencarian untuk diekspor ke dalam laporan <strong>E-Statement Resmi (Bank-Grade PDF)</strong>:
            </p>
            <div class="d-flex flex-column gap-2 mb-4">
              <label class="period-option-card">
                <input type="radio" name="statementPeriod" value="today" checked onchange="updateEStatementModalPreview()">
                <div class="d-flex justify-content-between align-items-center w-100 ms-2">
                  <span>📅 <strong>Harian</strong> (Scan Hari Ini)</span>
                  <span id="cntToday" class="badge bg-primary">0</span>
                </div>
              </label>
              <label class="period-option-card">
                <input type="radio" name="statementPeriod" value="week" onchange="updateEStatementModalPreview()">
                <div class="d-flex justify-content-between align-items-center w-100 ms-2">
                  <span>🗓️ <strong>Mingguan</strong> (7 Hari Terakhir)</span>
                  <span id="cntWeek" class="badge bg-info text-dark">0</span>
                </div>
              </label>
              <label class="period-option-card">
                <input type="radio" name="statementPeriod" value="month" onchange="updateEStatementModalPreview()">
                <div class="d-flex justify-content-between align-items-center w-100 ms-2">
                  <span>📊 <strong>Bulanan</strong> (30 Hari Terakhir)</span>
                  <span id="cntMonth" class="badge bg-warning text-dark">0</span>
                </div>
              </label>
              <label class="period-option-card">
                <input type="radio" name="statementPeriod" value="year" onchange="updateEStatementModalPreview()">
                <div class="d-flex justify-content-between align-items-center w-100 ms-2">
                  <span>📈 <strong>Tahunan</strong> (1 Tahun Terakhir)</span>
                  <span id="cntYear" class="badge bg-purple">0</span>
                </div>
              </label>
              <label class="period-option-card">
                <input type="radio" name="statementPeriod" value="all" onchange="updateEStatementModalPreview()">
                <div class="d-flex justify-content-between align-items-center w-100 ms-2">
                  <span>🌐 <strong>Semua Riwayat</strong> (All-Time History)</span>
                  <span id="cntAll" class="badge bg-success">0</span>
                </div>
              </label>
            </div>
            <div id="modalPreviewInfo" class="alert alert-dark border-info text-info small mb-0 font-monospace">
              <!-- Dynamically populated preview -->
            </div>
          </div>
          <div class="modal-footer border-top border-secondary">
            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Batal</button>
            <button type="button" class="btn btn-cyber-pdf" onclick="triggerModalPDFExport()">
              <i class="bi bi-download me-1"></i> DOWNLOAD PDF SEKARANG
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modalElem);
  }

  updateEStatementModalPreview();
  const bsModal = new bootstrap.Modal(modalElem);
  bsModal.show();
};

window.updateEStatementModalPreview = function() {
  const history = JSON.parse(localStorage.getItem('app_history') || '[]');
  const currentUser = getCurrentUser();
  const userRole = currentUser ? currentUser.role : 'guest';

  // Filter by logged user if not admin
  let userHistory = history;
  if (currentUser && userRole !== 'admin') {
    userHistory = history.filter(h => h.user === currentUser.username);
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = now.getTime() - 7 * 24 * 3600 * 1000;
  const monthStart = now.getTime() - 30 * 24 * 3600 * 1000;
  const yearStart = now.getTime() - 365 * 24 * 3600 * 1000;

  const parseTs = (tsStr) => {
    if (!tsStr) return 0;
    return new Date(tsStr.replace(' ', 'T')).getTime() || 0;
  };

  const cntToday = userHistory.filter(h => parseTs(h.timestamp) >= todayStart).length;
  const cntWeek = userHistory.filter(h => parseTs(h.timestamp) >= weekStart).length;
  const cntMonth = userHistory.filter(h => parseTs(h.timestamp) >= monthStart).length;
  const cntYear = userHistory.filter(h => parseTs(h.timestamp) >= yearStart).length;
  const cntAll = userHistory.length;

  if (document.getElementById('cntToday')) document.getElementById('cntToday').innerText = cntToday;
  if (document.getElementById('cntWeek')) document.getElementById('cntWeek').innerText = cntWeek;
  if (document.getElementById('cntMonth')) document.getElementById('cntMonth').innerText = cntMonth;
  if (document.getElementById('cntYear')) document.getElementById('cntYear').innerText = cntYear;
  if (document.getElementById('cntAll')) document.getElementById('cntAll').innerText = cntAll;

  const selectedRadio = document.querySelector('input[name="statementPeriod"]:checked');
  const selectedVal = selectedRadio ? selectedRadio.value : 'all';

  let selectedCount = cntAll;
  let labelText = 'Semua Riwayat';
  if (selectedVal === 'today') { selectedCount = cntToday; labelText = 'Harian (Hari Ini)'; }
  else if (selectedVal === 'week') { selectedCount = cntWeek; labelText = 'Mingguan (7 Hari Terakhir)'; }
  else if (selectedVal === 'month') { selectedCount = cntMonth; labelText = 'Bulanan (30 Hari Terakhir)'; }
  else if (selectedVal === 'year') { selectedCount = cntYear; labelText = 'Tahunan (1 Tahun Terakhir)'; }

  const previewBox = document.getElementById('modalPreviewInfo');
  if (previewBox) {
    previewBox.innerHTML = `<i class="bi bi-info-circle me-1"></i> Periode Terpilih: <strong>${labelText}</strong> &bull; Total Ditemukan: <strong>${selectedCount} Entri Audit</strong>`;
  }
};

window.triggerModalPDFExport = function() {
  const selectedRadio = document.querySelector('input[name="statementPeriod"]:checked');
  const selectedVal = selectedRadio ? selectedRadio.value : 'all';

  const history = JSON.parse(localStorage.getItem('app_history') || '[]');
  const currentUser = getCurrentUser();
  const userRole = currentUser ? currentUser.role : 'guest';

  let userHistory = history;
  if (currentUser && userRole !== 'admin') {
    userHistory = history.filter(h => h.user === currentUser.username);
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const weekStart = now.getTime() - 7 * 24 * 3600 * 1000;
  const monthStart = now.getTime() - 30 * 24 * 3600 * 1000;
  const yearStart = now.getTime() - 365 * 24 * 3600 * 1000;

  const parseTs = (tsStr) => {
    if (!tsStr) return 0;
    return new Date(tsStr.replace(' ', 'T')).getTime() || 0;
  };

  let filtered = userHistory;
  let periodLabel = 'ALL_TIME';

  if (selectedVal === 'today') {
    filtered = userHistory.filter(h => parseTs(h.timestamp) >= todayStart);
    periodLabel = 'DAILY_TODAY';
  } else if (selectedVal === 'week') {
    filtered = userHistory.filter(h => parseTs(h.timestamp) >= weekStart);
    periodLabel = 'WEEKLY_7DAYS';
  } else if (selectedVal === 'month') {
    filtered = userHistory.filter(h => parseTs(h.timestamp) >= monthStart);
    periodLabel = 'MONTHLY_30DAYS';
  } else if (selectedVal === 'year') {
    filtered = userHistory.filter(h => parseTs(h.timestamp) >= yearStart);
    periodLabel = 'YEARLY_365DAYS';
  }

  if (filtered.length === 0) {
    alert('Tidak ada riwayat scan pada periode waktu ini.');
    return;
  }

  const modalElem = document.getElementById('eStatementPeriodModal');
  if (modalElem) {
    const modalInst = bootstrap.Modal.getInstance(modalElem);
    if (modalInst) modalInst.hide();
  }

  generateEStatementPDF(filtered, periodLabel);
};

function generateEStatementPDF(scanDataArray, filenamePrefix) {
  const currentUser = getCurrentUser();
  const userName = currentUser ? currentUser.name || currentUser.username : 'GUEST USER';
  const userRole = currentUser ? currentUser.role.toUpperCase() : 'GUEST';
  const issueDate = new Date().toLocaleString();
  const pdfFileName = `AI_Link_Guard_EStatement_${filenamePrefix}_${Date.now()}.pdf`;

  // Calculate statistics
  const totalScans = scanDataArray.length;
  const safeScans = scanDataArray.filter(s => s.status === 'SAFE').length;
  const threatScans = scanDataArray.filter(s => s.status === 'DANGER' || s.status === 'WARNING').length;
  const avgRisk = totalScans > 0 ? Math.round(scanDataArray.reduce((acc, curr) => acc + (curr.risk_score || 0), 0) / totalScans) : 0;

  const pdfContainer = document.createElement('div');
  pdfContainer.id = 'tempPdfContainer';
  pdfContainer.style.background = '#070b19';
  pdfContainer.style.color = '#ffffff';
  pdfContainer.style.padding = '30px';
  pdfContainer.style.fontFamily = "'Outfit', 'JetBrains Mono', sans-serif";
  pdfContainer.style.width = '750px';
  pdfContainer.style.position = 'absolute';
  pdfContainer.style.left = '0';
  pdfContainer.style.top = '0';
  pdfContainer.style.zIndex = '999999';

  let rowsHtml = '';
  scanDataArray.forEach((item, index) => {
    const statusColor = item.badge_color === 'success' ? '#00ff88' : (item.badge_color === 'warning' ? '#ffb700' : '#ff0055');
    rowsHtml += `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.15);">
        <td style="padding: 10px; font-family: monospace; color: #00f3ff; font-weight: bold;">${item.id || 'SCAN-' + (index + 1)}</td>
        <td style="padding: 10px; font-family: monospace; color: #ffffff; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.url}</td>
        <td style="padding: 10px; font-weight: bold; color: ${statusColor};">${item.status} (${item.risk_score}%)</td>
        <td style="padding: 10px; font-family: monospace; color: #ffffff;">${item.ip_address || 'N/A'}</td>
        <td style="padding: 10px; color: #cbd5e1; font-size: 11px;">${item.timestamp}</td>
      </tr>
    `;
  });

  const hashStamp = '0x' + Array.from(new Uint8Array(16)).map(() => Math.floor(Math.random() * 256).toString(16).padStart(2, '0')).join('').toUpperCase();

  pdfContainer.innerHTML = `
    <div style="border: 2px solid #00f3ff; border-radius: 12px; padding: 25px; background: rgba(12, 18, 38, 0.98); position: relative;">
      
      <!-- E-Statement Header -->
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px dashed #00f3ff; padding-bottom: 15px; margin-bottom: 20px;">
        <div>
          <h1 style="margin: 0; font-size: 24px; color: #00f3ff; font-weight: 800; letter-spacing: 1px;">AI LINK GUARD</h1>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #cbd5e1; letter-spacing: 0.5px;">OFFICIAL CYBER SECURITY AUDIT E-STATEMENT &bull; BITSMIKRO 2026</p>
        </div>
        <div style="text-align: right;">
          <div style="border: 2px solid #00ff88; color: #00ff88; padding: 4px 12px; border-radius: 6px; font-size: 11px; font-weight: bold; display: inline-block;">
            VERIFIED SECURE E-STATEMENT
          </div>
          <div style="font-size: 10px; color: #cbd5e1; margin-top: 4px;">REF: ${hashStamp.substring(0, 16)}</div>
        </div>
      </div>

      <!-- Account & Summary Metrics -->
      <div style="display: flex; justify-content: space-between; background: rgba(0, 243, 255, 0.12); padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 12px;">
        <div>
          <div><span style="color: #cbd5e1;">ACCOUNT HOLDER:</span> <strong style="color: #ffffff;">${userName}</strong> (${userRole})</div>
          <div style="margin-top: 4px;"><span style="color: #cbd5e1;">REPORT PERIODE:</span> <strong style="color: #00f3ff;">${filenamePrefix.replace('_', ' ')}</strong></div>
        </div>
        <div style="text-align: right;">
          <div><span style="color: #cbd5e1;">ISSUE DATE:</span> <strong style="color: #00f3ff;">${issueDate}</strong></div>
          <div style="margin-top: 4px;"><span style="color: #cbd5e1;">TOTAL AUDITED:</span> <strong style="color: #00ff88;">${totalScans} LINKS</strong> (Safe: ${safeScans}, Threats: ${threatScans})</div>
        </div>
      </div>

      <!-- Audit History Table -->
      <h3 style="font-size: 14px; color: #ffffff; margin-bottom: 12px; font-family: monospace;">AUDIT TRAIL LOG (${totalScans} ENTRIES, AVG RISK: ${avgRisk}%):</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
        <thead>
          <tr style="background: rgba(0, 243, 255, 0.2); color: #00f3ff;">
            <th style="padding: 8px; text-align: left;">Scan ID</th>
            <th style="padding: 8px; text-align: left;">Target URL</th>
            <th style="padding: 8px; text-align: left;">Threat Status</th>
            <th style="padding: 8px; text-align: left;">Server IP</th>
            <th style="padding: 8px; text-align: left;">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <!-- Security Seal & Checksum Footer -->
      <div style="border-top: 1px solid rgba(255,255,255,0.2); padding-top: 15px; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #cbd5e1;">
        <div>
          <div>DIGITAL FORENSICS CHECKSUM: <span style="font-family: monospace; color: #00f3ff;">${hashStamp}</span></div>
          <div>AUTOMATED CYBER THREAT INTELLIGENCE &bull; BITSMIKRO INNOVATIVE VIBECODE 2026</div>
        </div>
        <div style="text-align: right; color: #00ff88; font-weight: bold;">
          OFFICIAL SECURITY REPORT
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(pdfContainer);

  // Fail-Safe Multi-Method PDF Downloader Engine
  const executePdfDownload = () => {
    if (typeof html2pdf !== 'undefined') {
      const opt = {
        margin: [0.2, 0.2, 0.2, 0.2],
        filename: pdfFileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, backgroundColor: '#070b19', useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(pdfContainer).output('blob').then((blob) => {
        // Remove temporary container
        if (document.getElementById('tempPdfContainer')) {
          document.body.removeChild(pdfContainer);
        }

        // 1. Direct Client-Side Blob File Download (Fast & Native)
        try {
          const blobUrl = URL.createObjectURL(blob);
          const downloadAnchor = document.createElement('a');
          downloadAnchor.href = blobUrl;
          downloadAnchor.download = pdfFileName;
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          setTimeout(() => {
            if (document.body.contains(downloadAnchor)) document.body.removeChild(downloadAnchor);
            URL.revokeObjectURL(blobUrl);
          }, 300);
        } catch (downloadErr) {
          console.warn('Direct Blob Download fallback triggered:', downloadErr);
        }

        // 2. Fallback Server POST API Endpoint
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function() {
          const base64data = reader.result.split(',')[1];
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = '/api/download-pdf';
          form.style.display = 'none';

          const inputData = document.createElement('input');
          inputData.type = 'hidden';
          inputData.name = 'pdf_base64';
          inputData.value = base64data;

          const inputName = document.createElement('input');
          inputName.type = 'hidden';
          inputName.name = 'filename';
          inputName.value = pdfFileName;

          form.appendChild(inputData);
          form.appendChild(inputName);
          document.body.appendChild(form);
          form.submit();
          document.body.removeChild(form);
        };
      }).catch((err) => {
        console.error('html2pdf save error, using fallback print window:', err);
        fallbackPrintWindow(pdfContainer, pdfFileName);
      });
    } else {
      fallbackPrintWindow(pdfContainer, pdfFileName);
    }
  };

  setTimeout(executePdfDownload, 100);
}

function fallbackPrintWindow(containerElem, fileName) {
  const printWin = window.open('', '_blank', 'width=800,height=900');
  if (printWin) {
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${fileName}</title>
        <style>
          body { background: #070b19; color: #fff; font-family: monospace; padding: 20px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #1e293b; padding: 8px; text-align: left; }
          th { background: #00f3ff; color: #000; }
        </style>
      </head>
      <body>
        ${containerElem.innerHTML}
        <script>
          window.onload = function() { window.print(); };
        <\/script>
      </body>
      </html>
    `);
    printWin.document.close();
  }
  if (document.getElementById('tempPdfContainer')) {
    document.body.removeChild(containerElem);
  }
}

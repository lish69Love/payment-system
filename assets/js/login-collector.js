/**
 * Login Data Collector
 * Collects comprehensive user data including IP, fingerprints, device info, etc.
 * Stores data in localStorage with export and management capabilities
 */

class LoginDataCollector {
  constructor() {
    this.storageKey = 'login_data';
    this.data = this.loadData();
  }

  /**
   * Load data from localStorage
   */
  loadData() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Save data to localStorage
   */
  saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  /**
   * Get User's IP Address (IPv4 and IPv6)
   */
  async getIPAddress() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return { publicIP: data.ip };
    } catch (error) {
      return { publicIP: 'N/A' };
    }
  }

  /**
   * Get Local IP via WebRTC
   */
  getLocalIPAddress() {
    return new Promise((resolve) => {
      const pc = new RTCPeerConnection({ iceServers: [] });
      const ips = {};

      pc.createDataChannel('');
      pc.createOffer().then((offer) => pc.setLocalDescription(offer));

      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate) return;
        const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
        const ipAddress = ipRegex.exec(ice.candidate.candidate)[1];
        ips[ipAddress] = true;
      };

      setTimeout(() => {
        resolve(Object.keys(ips).length > 0 ? Object.keys(ips) : ['N/A']);
      }, 1000);
    });
  }

  /**
   * Get Canvas Fingerprint
   */
  getCanvasFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 280;
      canvas.height = 60;

      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('Canvas Fingerprint 🔐', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('Canvas Fingerprint 🔐', 4, 17);

      const dataURL = canvas.toDataURL();
      return this.hashString(dataURL);
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Get WebGL Fingerprint
   */
  getWebGLFingerprint() {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return 'N/A';

      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return 'N/A';

      const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

      return this.hashString(`${vendor}-${renderer}`);
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Get Device Information
   */
  getDeviceInfo() {
    const userAgent = navigator.userAgent;
    let osName = 'Unknown';
    let browser = 'Unknown';
    let deviceType = 'Unknown';

    // Detect OS
    if (userAgent.indexOf('Windows') > -1) osName = 'Windows';
    else if (userAgent.indexOf('Mac') > -1) osName = 'MacOS';
    else if (userAgent.indexOf('X11') > -1) osName = 'UNIX';
    else if (userAgent.indexOf('Linux') > -1) osName = 'Linux';
    else if (userAgent.indexOf('Android') > -1) osName = 'Android';
    else if (userAgent.indexOf('like Mac') > -1) osName = 'iOS';

    // Detect Browser
    if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Chromium') === -1) {
      browser = 'Chrome';
    } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
      browser = 'Safari';
    } else if (userAgent.indexOf('Firefox') > -1) {
      browser = 'Firefox';
    } else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg') > -1) {
      browser = 'Edge';
    } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
      browser = 'Opera';
    }

    // Detect Device Type
    if (/mobile|android|iphone|ipad|phone|webos/i.test(userAgent)) {
      deviceType = 'Mobile';
    } else if (/tablet|ipad/i.test(userAgent)) {
      deviceType = 'Tablet';
    } else {
      deviceType = 'Desktop';
    }

    return {
      userAgent,
      os: osName,
      browser,
      deviceType,
      language: navigator.language || navigator.userLanguage
    };
  }

  /**
   * Get Screen Information
   */
  getScreenInfo() {
    return {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth,
      pixelDepth: window.screen.pixelDepth,
      orientation: window.screen.orientation?.type || 'N/A',
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight
    };
  }

  /**
   * Get Timezone
   */
  getTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (error) {
      return 'N/A';
    }
  }

  /**
   * Get Language
   */
  getLanguage() {
    return {
      language: navigator.language,
      languages: Array.from(navigator.languages || [])
    };
  }

  /**
   * Get Referrer
   */
  getReferrer() {
    return document.referrer || 'direct';
  }

  /**
   * Get Cookies Status
   */
  getCookiesEnabled() {
    const test = '__test__';
    document.cookie = `${test}=1`;
    const enabled = document.cookie.indexOf(test) > -1;
    document.cookie = `${test}=; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
    return enabled;
  }

  /**
   * Get Available Plugins
   */
  getPluginsInfo() {
    const plugins = [];
    try {
      for (let i = 0; i < navigator.plugins.length; i++) {
        plugins.push({
          name: navigator.plugins[i].name,
          description: navigator.plugins[i].description,
          version: navigator.plugins[i].version
        });
      }
    } catch (error) {
      plugins.push({ name: 'Plugins access denied', description: '', version: '' });
    }
    return plugins.length > 0 ? plugins : [{ name: 'No plugins detected', description: '', version: '' }];
  }

  /**
   * Get Battery Status
   */
  async getBatteryStatus() {
    try {
      if (!navigator.getBattery && !navigator.battery) {
        return 'Battery API not available';
      }
      const battery = await navigator.getBattery?.();
      if (!battery) return 'Battery API not available';
      return {
        level: Math.round(battery.level * 100),
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
    } catch (error) {
      return 'Battery API not available';
    }
  }

  /**
   * Get Geolocation
   */
  async getGeolocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ available: false, error: 'Geolocation not available' });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            available: true,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed
          });
        },
        (error) => {
          resolve({
            available: false,
            error: error.message
          });
        },
        { timeout: 5000, enableHighAccuracy: true }
      );
    });
  }

  /**
   * Check Local/Session Storage Availability
   */
  getStorageStatus() {
    return {
      localStorageAvailable: this.isStorageAvailable('localStorage'),
      sessionStorageAvailable: this.isStorageAvailable('sessionStorage')
    };
  }

  /**
   * Check if Storage is Available
   */
  isStorageAvailable(type) {
    try {
      const storage = window[type];
      const test = '__test__';
      storage.setItem(test, '1');
      storage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Hash String using SHA256 (simple implementation)
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Collect All Data
   */
  async collectAllData() {
    const collectionStart = new Date();

    const [publicIP, localIPs, canvasFingerprint, webglFingerprint, batteryStatus, geolocation] = await Promise.all([
      this.getIPAddress(),
      this.getLocalIPAddress(),
      Promise.resolve(this.getCanvasFingerprint()),
      Promise.resolve(this.getWebGLFingerprint()),
      this.getBatteryStatus(),
      this.getGeolocation()
    ]);

    const collectedData = {
      id: this.generateID(),
      timestamp: new Date().toISOString(),
      collectionTime: new Date().getTime() - collectionStart.getTime(),

      // Network Info
      network: {
        publicIP: publicIP.publicIP,
        localIPs: localIPs
      },

      // Fingerprints
      fingerprints: {
        canvas: canvasFingerprint,
        webgl: webglFingerprint
      },

      // Device Information
      device: this.getDeviceInfo(),

      // Screen Information
      screen: this.getScreenInfo(),

      // Location Info
      location: {
        timezone: this.getTimezone(),
        language: this.getLanguage(),
        referrer: this.getReferrer(),
        geolocation: geolocation
      },

      // Browser Features
      features: {
        cookiesEnabled: this.getCookiesEnabled(),
        plugins: this.getPluginsInfo(),
        battery: batteryStatus,
        storage: this.getStorageStatus()
      },

      // Browsing Context
      context: {
        url: window.location.href,
        host: window.location.host,
        pathname: window.location.pathname
      }
    };

    return collectedData;
  }

  /**
   * Generate Unique ID
   */
  generateID() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Add Entry to Collection
   */
  async addEntry() {
    const entry = await this.collectAllData();
    this.data.push(entry);
    this.saveData();
    return entry;
  }

  /**
   * Get All Entries
   */
  getAllEntries() {
    return this.data;
  }

  /**
   * Get Entry by ID
   */
  getEntryById(id) {
    return this.data.find(entry => entry.id === id);
  }

  /**
   * Delete Entry by ID
   */
  deleteById(id) {
    const initialLength = this.data.length;
    this.data = this.data.filter(entry => entry.id !== id);
    if (this.data.length < initialLength) {
      this.saveData();
      return true;
    }
    return false;
  }

  /**
   * Clear All Data
   */
  clearAll() {
    this.data = [];
    this.saveData();
  }

  /**
   * Export to CSV
   */
  exportToCSV() {
    if (this.data.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'ID',
      'Timestamp',
      'Collection Time (ms)',
      'Public IP',
      'Local IPs',
      'Canvas Fingerprint',
      'WebGL Fingerprint',
      'OS',
      'Browser',
      'Device Type',
      'Language',
      'Screen Width',
      'Screen Height',
      'Color Depth',
      'Timezone',
      'Referrer',
      'Cookies Enabled',
      'Plugins Count',
      'Battery Available',
      'Geolocation Available',
      'URL',
      'Host'
    ];

    let csvContent = headers.join(',') + '\n';

    this.data.forEach(entry => {
      const row = [
        entry.id,
        entry.timestamp,
        entry.collectionTime,
        entry.network.publicIP,
        entry.network.localIPs.join(';'),
        entry.fingerprints.canvas,
        entry.fingerprints.webgl,
        entry.device.os,
        entry.device.browser,
        entry.device.deviceType,
        entry.device.language,
        entry.screen.width,
        entry.screen.height,
        entry.screen.colorDepth,
        entry.location.timezone,
        entry.location.referrer,
        entry.features.cookiesEnabled,
        entry.features.plugins.length,
        typeof entry.features.battery === 'object' ? 'Yes' : 'No',
        entry.location.geolocation.available,
        entry.context.url,
        entry.context.host
      ];

      csvContent += row.map(val => {
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
          return `"${val.replace(/"/g, '""')}"`;
        }
        return val;
      }).join(',') + '\n';
    });

    // Download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `login-data-${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export to JSON
   */
  exportToJSON() {
    if (this.data.length === 0) {
      alert('No data to export');
      return;
    }

    const jsonContent = JSON.stringify(this.data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `login-data-${new Date().getTime()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Get Summary Statistics
   */
  getSummary() {
    if (this.data.length === 0) {
      return {
        totalEntries: 0,
        dateRange: 'No data'
      };
    }

    const timestamps = this.data.map(e => new Date(e.timestamp));
    const firstDate = new Date(Math.min(...timestamps));
    const lastDate = new Date(Math.max(...timestamps));

    return {
      totalEntries: this.data.length,
      firstEntry: firstDate.toISOString(),
      lastEntry: lastDate.toISOString(),
      averageCollectionTime: Math.round(
        this.data.reduce((sum, e) => sum + e.collectionTime, 0) / this.data.length
      ),
      uniqueDevices: new Set(
        this.data.map(e => `${e.device.os}-${e.device.browser}`)
      ).size,
      uniqueIPs: new Set(this.data.map(e => e.network.publicIP)).size
    };
  }

  /**
   * Print All Data (Console)
   */
  printAllData() {
    console.log('=== Login Data Collection ===');
    console.log('Total Entries:', this.data.length);
    console.table(this.data);
  }

  /**
   * Print Entry Details (Console)
   */
  printEntry(id) {
    const entry = this.getEntryById(id);
    if (entry) {
      console.log('=== Entry Details ===');
      console.log(entry);
    } else {
      console.error('Entry not found:', id);
    }
  }
}

// Initialize collector
const loginCollector = new LoginDataCollector();

// Example usage:
// await loginCollector.addEntry(); // Collect and save data
// loginCollector.getAllEntries(); // Get all entries
// loginCollector.exportToCSV(); // Export to CSV
// loginCollector.exportToJSON(); // Export to JSON
// loginCollector.deleteById('id'); // Delete by ID
// loginCollector.clearAll(); // Clear all data
// loginCollector.getSummary(); // Get summary stats

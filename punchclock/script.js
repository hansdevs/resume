function hashMD5(text) {
    return CryptoJS.MD5(text).toString();
}

class JSONBinStorage {
    constructor() {
        this.baseUrl = 'https://api.jsonbin.io/v3/b';
        this.isOnline = true;
    }

    async readData() {
        try {
            if (!config.isLoaded()) {
                throw new Error('Credentials not loaded');
            }

            const response = await fetch(`${this.baseUrl}/${config.getBinId()}/latest`, {
                method: 'GET',
                headers: {
                    'X-Master-Key': config.getApiKey()
                }
            });

            if (!response.ok) {
                throw new Error(`JSONBin read failed: ${response.status}`);
            }

            const data = await response.json();
            
            let dataRecord = data.record;
            if (!dataRecord || !dataRecord.logs) {
                console.log('📦 Initializing empty JSONBin');
                dataRecord = { logs: [], hash: hashMD5('[]'), lastUpdated: new Date().toISOString() };
                await this.writeData(dataRecord);
            }
            
            const cleanedData = tamperProtection.cleanupTamperedData(dataRecord);
            console.log('✅ Data loaded from JSONBin');
            return cleanedData;
        } catch (error) {
            console.error('❌ JSONBin read error:', error);
            this.isOnline = false;
            return this.getLocalFallback();
        }
    }

    async writeData(data) {
        try {
            if (!config.isLoaded()) {
                throw new Error('Credentials not loaded');
            }

            const cleanedData = tamperProtection.cleanupTamperedData(data);
            const payload = {
                ...cleanedData,
                lastUpdated: new Date().toISOString(),
                hash: hashMD5(JSON.stringify(cleanedData.logs))
            };

            const response = await fetch(`${this.baseUrl}/${config.getBinId()}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': config.getApiKey()
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`JSONBin write failed: ${response.status}`);
            }

            console.log('✅ Data saved to JSONBin');
            this.isOnline = true;
            
            // Also save locally as backup
            localStorage.setItem('cordinova_punch_logs', JSON.stringify(data.logs));
            localStorage.setItem('cordinova_punch_hash', payload.hash);
            
            return true;
        } catch (error) {
            console.error('❌ JSONBin write error:', error);
            this.isOnline = false;
            // Fallback to local storage
            this.saveLocalFallback(data);
            return false;
        }
    }

    getLocalFallback() {
        console.log('📱 Using local storage fallback');
        try {
            const logs = JSON.parse(localStorage.getItem('cordinova_punch_logs') || '[]');
            const hash = localStorage.getItem('cordinova_punch_hash') || hashMD5('[]');
            return { logs, hash, lastUpdated: new Date().toISOString() };
        } catch (error) {
            return { logs: [], hash: hashMD5('[]'), lastUpdated: new Date().toISOString() };
        }
    }

    saveLocalFallback(data) {
        console.log('📱 Saving to local storage fallback');
        localStorage.setItem('cordinova_punch_logs', JSON.stringify(data.logs));
        localStorage.setItem('cordinova_punch_hash', hashMD5(JSON.stringify(data.logs)));
    }

    getStatus() {
        return this.isOnline ? '🌐 Online' : '📱 Offline (Local)';
    }
}

const jsonBinStorage = new JSONBinStorage();

const employees = {
    '99f97481f8214da999e3ccbe116f5334': {
        name: 'Hans Gamlien',
        id: 'hans',
        code: '****'
    },
    '1da785ade1299722ea5094d2ff0c4dbe': {
        name: 'Eh the Moo Htoo',
        id: 'eh',
        code: '****'
    },
    'c90b7f4378a55a9170642af29922cf5c': {
        name: 'Ryan',
        id: 'ryan',
        code: '****'
    },
    '5359c847ef4975cdc646e8be8cb5621f': {
        name: 'Ally Eldredge',
        id: 'ally',
        code: '****'
    }
};

const MASTER_CODE_HASH = '37f203943db163d65db3568889b5068a';

let isSystemUnlocked = false;
let currentEmployee = null;

document.addEventListener('DOMContentLoaded', function() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    document.getElementById('masterForm').addEventListener('submit', handleMasterAccess);
    document.getElementById('punchInBtn').addEventListener('click', () => handlePunch('in'));
    document.getElementById('punchOutBtn').addEventListener('click', () => handlePunch('out'));
    document.getElementById('refreshDataBtn').addEventListener('click', () => refreshData());
    document.getElementById('generateReportBtn').addEventListener('click', generateWeeklyReport);
    document.getElementById('clearLogsBtn').addEventListener('click', () => clearLogs());
    document.getElementById('clearCode').addEventListener('click', clearEmployeeCode);
    
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const num = this.getAttribute('data-num');
            addToEmployeeCode(num);
        });
    });
});

function updateCurrentTime() {
    const now = new Date();
    const timeString = now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('currentTime').textContent = timeString;
}

function handleMasterAccess(e) {
    e.preventDefault();
    const inputCode = document.getElementById('masterCode').value;
    const inputHash = hashMD5(inputCode);
    
    if (inputHash === MASTER_CODE_HASH && config.deriveCredentials(inputCode)) {
        isSystemUnlocked = true;
        document.getElementById('masterAccess').classList.add('hidden');
        document.getElementById('punchClockSystem').classList.remove('hidden');
        showStatus('System unlocked successfully!', 'success');
        
        console.log('🔓 Master access granted, loading data...');
        loadStoredData().then(async () => {
            console.log('📊 Initial data load complete, displaying logs...');
            await displayLogs();
            await updateDailySummary();
            updateConnectionStatus();
        }).catch(error => {
            console.error('❌ Failed to load initial data:', error);
            showStatus('Warning: Could not load existing data', 'warning');
            displayLogs();
            updateDailySummary();
        });
    } else {
        showStatus('Invalid master code!', 'error');
        document.getElementById('masterCode').value = '';
    }
}

async function handlePunch(action) {
    const employeeCode = document.getElementById('employeeCode').value;
    if (!employeeCode) {
        showStatus('Please enter employee code!', 'error');
        return;
    }
    
    const employeeHash = hashMD5(employeeCode);
    const employee = employees[employeeHash];
    
    if (!employee) {
        showStatus('Invalid employee code!', 'error');
        document.getElementById('employeeCode').value = '';
        return;
    }
    
    const now = new Date();
    const timestamp = now.getTime();
    
    const logs = await getStoredLogs();
    const employeeLogs = logs.filter(log => log.employeeId === employee.id);
    const lastLog = employeeLogs[employeeLogs.length - 1];
    
    if (action === 'in') {
        if (lastLog && lastLog.action === 'in' && !lastLog.punchOut) {
            showStatus(`${employee.name} is already punched in!`, 'error');
            return;
        }
        
        const punchRecord = {
            id: generateId(),
            employeeId: employee.id,
            employeeName: employee.name,
            action: 'in',
            timestamp: timestamp,
            datetime: now.toISOString(),
            punchOut: null
        };
        
        await savePunchRecord(punchRecord);
        showStatus(`${employee.name} punched in successfully!`, 'success');
        await displayLogs();
        await updateDailySummary();
        
    } else if (action === 'out') {
        if (!lastLog || lastLog.action === 'out' || lastLog.punchOut) {
            showStatus(`${employee.name} is not currently punched in!`, 'error');
            return;
        }
        
        lastLog.punchOut = timestamp;
        lastLog.punchOutDatetime = now.toISOString();
        lastLog.hoursWorked = calculateHours(lastLog.timestamp, timestamp);
        
        await updatePunchRecord(lastLog);
        showStatus(`${employee.name} punched out successfully! Hours worked: ${lastLog.hoursWorked.toFixed(2)}`, 'success');
        await displayLogs();
        await updateDailySummary();
    }
    
    document.getElementById('employeeCode').value = '';
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function calculateHours(startTime, endTime) {
    return (endTime - startTime) / (1000 * 60 * 60);
}

async function savePunchRecord(record) {
    const currentData = await jsonBinStorage.readData();
    currentData.logs.push(record);
    await jsonBinStorage.writeData(currentData);
}

async function updatePunchRecord(updatedRecord) {
    const currentData = await jsonBinStorage.readData();
    const index = currentData.logs.findIndex(log => log.id === updatedRecord.id);
    if (index !== -1) {
        currentData.logs[index] = updatedRecord;
        await jsonBinStorage.writeData(currentData);
    }
}

async function getStoredLogs() {
    try {
        const data = await jsonBinStorage.readData();
        
        // Verify data integrity
        const calculatedHash = hashMD5(JSON.stringify(data.logs));
        if (data.hash !== calculatedHash) {
            console.warn('⚠️ Data integrity check failed! Data may have been tampered with.');
            showStatus('Data integrity warning - please refresh', 'error');
        }
        
        return data.logs || [];
    } catch (error) {
        console.error('Error loading stored logs:', error);
        return [];
    }
}

async function refreshData() {
    try {
        showStatus('Refreshing data...', 'info');
        const data = await jsonBinStorage.readData();
        await displayLogs();
        await updateDailySummary();
        updateConnectionStatus();
        showStatus('Data refreshed successfully!', 'success');
    } catch (error) {
        console.error('❌ Failed to refresh data:', error);
        showStatus('Failed to refresh data', 'error');
    }
}

async function loadStoredData() {
    try {
        const data = await jsonBinStorage.readData();
        console.log(`📊 Loaded ${data.logs.length} records from ${jsonBinStorage.getStatus()}`);
        
        updateConnectionStatus();
        
        return data;
    } catch (error) {
        console.error('Error loading data:', error);
        showStatus('Failed to load data - using local backup', 'warning');
    }
}

function updateConnectionStatus() {
    const timeDisplay = document.querySelector('.time-display');
    if (timeDisplay) {
        let statusDiv = document.getElementById('connectionStatus');
        if (!statusDiv) {
            statusDiv = document.createElement('div');
            statusDiv.id = 'connectionStatus';
            statusDiv.style.cssText = 'text-align: center; margin-top: 10px; font-size: 12px; opacity: 0.7;';
            timeDisplay.appendChild(statusDiv);
        }
        statusDiv.textContent = `${jsonBinStorage.getStatus()}`;
    }
}

function addToEmployeeCode(num) {
    const codeInput = document.getElementById('employeeCode');
    if (codeInput.value.length < 4) {
        codeInput.value += num;
    }
}

function clearEmployeeCode() {
    document.getElementById('employeeCode').value = '';
}

async function updateDailySummary() {
    const logs = await getStoredLogs();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    // Filter logs for today
    const todayLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= today && logDate < tomorrow && log.hoursWorked;
    });
    
    // Calculate total hours
    const totalHours = todayLogs.reduce((total, log) => total + (log.hoursWorked || 0), 0);
    
    // Update display
    document.getElementById('totalHoursToday').textContent = totalHours.toFixed(2);
}

async function displayLogs() {
    const logs = await getStoredLogs();
    const logsContent = document.getElementById('logsContent');
    
    if (logs.length === 0) {
        logsContent.innerHTML = '<p class="no-logs">No time logs yet. Start punching in to see activity.</p>';
        return;
    }

    const sortedLogs = logs.sort((a, b) => b.timestamp - a.timestamp);
    
    const employeeGroups = {};
    sortedLogs.forEach(log => {
        if (!employeeGroups[log.employeeId]) {
            employeeGroups[log.employeeId] = [];
        }
        employeeGroups[log.employeeId].push(log);
    });
    
    let html = '';
    Object.keys(employeeGroups).forEach(employeeId => {
        const employeeLogs = employeeGroups[employeeId];
        const employeeName = employeeLogs[0].employeeName;
        
        html += `<div class="employee-summary">
            <h3>${employeeName}</h3>`;
        
        let totalHours = 0;
        employeeLogs.slice(0, 5).forEach(log => { // Show only last 5 entries per employee
            const date = new Date(log.timestamp).toLocaleDateString();
            const timeIn = new Date(log.timestamp).toLocaleTimeString();
            const timeOut = log.punchOut ? new Date(log.punchOut).toLocaleTimeString() : 'Still punched in';
            const hours = log.hoursWorked || 0;
            totalHours += hours;
            
            html += `<div class="log-entry ${log.punchOut ? 'completed' : 'active'}">
                <div>
                    <strong>${date}</strong><br>
                    In: ${timeIn} | Out: ${timeOut}<br>
                    Hours: ${hours.toFixed(2)}
                </div>
            </div>`;
        });
        
        html += `<div style="margin-top: 10px; font-weight: bold; color: #663399;">
            Recent Total: ${totalHours.toFixed(2)} hours
        </div></div>`;
    });
    
    logsContent.innerHTML = html;
}

async function generateWeeklyReport() {
    const logs = await getStoredLogs();
    if (logs.length === 0) {
        showStatus('No data available for report generation.', 'error');
        return;
    }
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const weekLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startOfWeek && logDate <= endOfWeek;
    });
    
    if (weekLogs.length === 0) {
        showStatus('No data available for this week.', 'error');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Cordinova Weekly Time Report', 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Week of: ${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`, 20, 35);
    doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 45);
    
    let yPosition = 60;
    
    const employeeGroups = {};
    weekLogs.forEach(log => {
        if (!employeeGroups[log.employeeId]) {
            employeeGroups[log.employeeId] = [];
        }
        employeeGroups[log.employeeId].push(log);
    });
    
    Object.keys(employeeGroups).forEach(employeeId => {
        const employeeLogs = employeeGroups[employeeId];
        const employeeName = employeeLogs[0].employeeName;
        
        doc.setFontSize(16);
        doc.text(employeeName, 20, yPosition);
        yPosition += 10;
        
        doc.setFontSize(10);
        let totalHours = 0;
        
        employeeLogs.forEach(log => {
            const date = new Date(log.timestamp).toLocaleDateString();
            const timeIn = new Date(log.timestamp).toLocaleTimeString();
            const timeOut = log.punchOut ? new Date(log.punchOut).toLocaleTimeString() : 'Still active';
            const hours = log.hoursWorked || 0;
            totalHours += hours;
            
            doc.text(`${date} | In: ${timeIn} | Out: ${timeOut} | Hours: ${hours.toFixed(2)}`, 25, yPosition);
            yPosition += 8;
        });
        
        doc.setFontSize(12);
        doc.text(`Total Hours: ${totalHours.toFixed(2)}`, 25, yPosition);
        yPosition += 20;
        
        if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
        }
    });
    
    const fileName = `Cordinova_Weekly_Report_${startOfWeek.toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    showStatus('Weekly report generated and downloaded!', 'success');
}

async function clearLogs() {
    if (confirm('Are you sure you want to clear all time logs? This action cannot be undone.')) {
        const emptyData = { logs: [], hash: hashMD5('[]'), lastUpdated: new Date().toISOString() };
        await jsonBinStorage.writeData(emptyData);
        
        localStorage.removeItem('cordinova_punch_logs');
        localStorage.removeItem('cordinova_punch_hash');
        
        showStatus('All logs cleared successfully!', 'success');
        await displayLogs();
        await updateDailySummary();
    }
}

function showStatus(message, type) {
    const statusDiv = document.getElementById('currentStatus');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    
    setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = 'status';
    }, 5000);
}

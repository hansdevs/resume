function hashMD5(text) {
    return CryptoJS.MD5(text).toString();
}

const employees = {
    '6748940b6e214bb0113c6558dd95e0f4': {
        name: 'Hans Gamlien',
        id: 'hans',
        code: '****'
    },
    '12fed9daa86e2cd5d610beedb2333aa7': {
        name: 'Eh the Moo Htoo',
        id: 'eh',
        code: '****'
    },
    'e2fc714c4727ee9395f324cd2e7f331f': {
        name: 'Ryan',
        id: 'ryan',
        code: '****'
    }
};

const MASTER_CODE_HASH = 'a8f5f167f44f4964e6c998dee827110c';

let isSystemUnlocked = false;
let currentEmployee = null;

document.addEventListener('DOMContentLoaded', function() {
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000);
    
    // Event listeners
    document.getElementById('masterForm').addEventListener('submit', handleMasterAccess);
    document.getElementById('punchInBtn').addEventListener('click', () => handlePunch('in'));
    document.getElementById('punchOutBtn').addEventListener('click', () => handlePunch('out'));
    document.getElementById('generateReportBtn').addEventListener('click', generateWeeklyReport);
    document.getElementById('clearLogsBtn').addEventListener('click', clearLogs);
    document.getElementById('clearCode').addEventListener('click', clearEmployeeCode);
    
    // Numpad functionality
    document.querySelectorAll('.num-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const num = this.getAttribute('data-num');
            addToEmployeeCode(num);
        });
    });
    
    // Load existing data and display logs immediately
    loadStoredData();
    displayLogs();
    updateDailySummary();
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
    
    if (inputHash === MASTER_CODE_HASH) {
        isSystemUnlocked = true;
        document.getElementById('masterAccess').classList.add('hidden');
        document.getElementById('punchClockSystem').classList.remove('hidden');
        showStatus('System unlocked successfully!', 'success');
    } else {
        showStatus('Invalid master code!', 'error');
        document.getElementById('masterCode').value = '';
    }
}

function handlePunch(action) {
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
    
    const logs = getStoredLogs();
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
        
        savePunchRecord(punchRecord);
        showStatus(`${employee.name} punched in successfully!`, 'success');
        displayLogs();
        updateDailySummary();
        
    } else if (action === 'out') {
        if (!lastLog || lastLog.action === 'out' || lastLog.punchOut) {
            showStatus(`${employee.name} is not currently punched in!`, 'error');
            return;
        }
        
        lastLog.punchOut = timestamp;
        lastLog.punchOutDatetime = now.toISOString();
        lastLog.hoursWorked = calculateHours(lastLog.timestamp, timestamp);
        
        updatePunchRecord(lastLog);
        showStatus(`${employee.name} punched out successfully! Hours worked: ${lastLog.hoursWorked.toFixed(2)}`, 'success');
        displayLogs();
        updateDailySummary();
    }
    
    document.getElementById('employeeCode').value = '';
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function calculateHours(startTime, endTime) {
    return (endTime - startTime) / (1000 * 60 * 60);
}

function savePunchRecord(record) {
    const logs = getStoredLogs();
    logs.push(record);
    const hashedData = hashMD5(JSON.stringify(logs));
    localStorage.setItem('cordinova_punch_logs', JSON.stringify(logs));
    localStorage.setItem('cordinova_punch_hash', hashedData);
}

function updatePunchRecord(updatedRecord) {
    const logs = getStoredLogs();
    const index = logs.findIndex(log => log.id === updatedRecord.id);
    if (index !== -1) {
        logs[index] = updatedRecord;
        const hashedData = hashMD5(JSON.stringify(logs));
        localStorage.setItem('cordinova_punch_logs', JSON.stringify(logs));
        localStorage.setItem('cordinova_punch_hash', hashedData);
    }
}

function getStoredLogs() {
    try {
        const storedLogs = localStorage.getItem('cordinova_punch_logs');
        const storedHash = localStorage.getItem('cordinova_punch_hash');
        
        if (!storedLogs) return [];
        
        const logs = JSON.parse(storedLogs);
        const calculatedHash = hashMD5(JSON.stringify(logs));
        
        if (storedHash !== calculatedHash) {
            console.warn('Data integrity check failed! Logs may have been tampered with.');
            return [];
        }
        
        return logs;
    } catch (error) {
        console.error('Error loading stored logs:', error);
        return [];
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

function updateDailySummary() {
    const logs = getStoredLogs();
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

function displayLogs() {
    const logs = getStoredLogs();
    const logsContent = document.getElementById('logsContent');
    
    if (logs.length === 0) {
        logsContent.innerHTML = '<p class="no-logs">No time logs yet. Start punching in to see activity.</p>';
        return;
    }

    // Sort logs by timestamp (newest first)
    const sortedLogs = logs.sort((a, b) => b.timestamp - a.timestamp);
    
    // Group logs by employee
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

function loadStoredData() {
    getStoredLogs();
}

function generateWeeklyReport() {
    const logs = getStoredLogs();
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

function clearLogs() {
    if (confirm('Are you sure you want to clear all time logs? This action cannot be undone.')) {
        localStorage.removeItem('cordinova_punch_logs');
        localStorage.removeItem('cordinova_punch_hash');
        showStatus('All logs cleared successfully!', 'success');
        displayLogs();
        updateDailySummary();
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

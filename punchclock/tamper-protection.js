class TamperProtection {
    constructor() {
        this.validEmployeeIds = ['hans', 'eh', 'ryan', 'ally'];
        this.validActions = ['in', 'out'];
    }

    validateLogEntry(entry) {
        if (!entry.employeeId || !this.validEmployeeIds.includes(entry.employeeId)) {
            return false;
        }
        
        if (!entry.employeeName || typeof entry.employeeName !== 'string') {
            return false;
        }
        
        if (!entry.action || !this.validActions.includes(entry.action)) {
            return false;
        }
        
        if (!entry.timestamp || isNaN(entry.timestamp)) {
            return false;
        }
        
        if (!entry.datetime || !entry.id) {
            return false;
        }
        
        const employeeMapping = {
            'hans': 'Hans Gamlien',
            'eh': 'Eh the Moo Htoo', 
            'ryan': 'Ryan',
            'ally': 'Ally Eldredge'
        };
        
        if (entry.employeeName !== employeeMapping[entry.employeeId]) {
            return false;
        }
        
        return true;
    }

    sanitizeData(logs) {
        const validLogs = logs.filter(log => this.validateLogEntry(log));
        const removedCount = logs.length - validLogs.length;
        
        if (removedCount > 0) {
            console.warn(`Removed ${removedCount} invalid entries`);
        }
        
        return validLogs;
    }

    detectAnomalies(logs) {
        const anomalies = [];
        const employeeCounts = {};
        
        logs.forEach(log => {
            if (!employeeCounts[log.employeeId]) {
                employeeCounts[log.employeeId] = 0;
            }
            employeeCounts[log.employeeId]++;
        });
        
        Object.keys(employeeCounts).forEach(empId => {
            if (employeeCounts[empId] > 50) {
                anomalies.push(`Excessive entries for ${empId}: ${employeeCounts[empId]}`);
            }
        });
        
        return anomalies;
    }

    cleanupTamperedData(data) {
        if (!data || !Array.isArray(data.logs)) {
            return { logs: [], hash: CryptoJS.MD5('[]').toString(), lastUpdated: new Date().toISOString() };
        }
        
        const cleanLogs = this.sanitizeData(data.logs);
        const anomalies = this.detectAnomalies(cleanLogs);
        
        if (anomalies.length > 0) {
            console.warn('Anomalies detected:', anomalies);
        }
        
        return {
            logs: cleanLogs,
            hash: CryptoJS.MD5(JSON.stringify(cleanLogs)).toString(),
            lastUpdated: new Date().toISOString()
        };
    }
}

const tamperProtection = new TamperProtection();

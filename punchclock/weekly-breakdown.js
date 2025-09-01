class WeeklyBreakdown {
    constructor() {
        this.isVisible = false;
        this.currentWeekOffset = 0;
        this.init();
    }

    getMountainTime() {
        const now = new Date();
        return new Date(now.toLocaleString("en-US", {timeZone: "America/Denver"}));
    }

    init() {
        this.createUI();
        this.bindEvents();
    }

    createUI() {
        const toggleButton = document.createElement('button');
        toggleButton.id = 'weeklyToggleBtn';
        toggleButton.className = 'admin-btn weekly-toggle';
        toggleButton.innerHTML = '<i class="fas fa-chart-line"></i> Weekly Breakdown';
        
        const adminControls = document.querySelector('.admin-controls');
        if (adminControls) {
            adminControls.insertBefore(toggleButton, adminControls.firstChild);
        }

        const weeklyContainer = document.createElement('div');
        weeklyContainer.id = 'weeklyBreakdownContainer';
        weeklyContainer.className = 'weekly-breakdown-card hidden';
        weeklyContainer.innerHTML = `
            <div class="weekly-header">
                <button id="prevWeek" class="week-nav-btn">←</button>
                <h2 id="weekRange">Weekly Breakdown</h2>
                <button id="nextWeek" class="week-nav-btn">→</button>
            </div>
            <div id="weeklyContent" class="weekly-content">
                <div class="loading-spinner">Loading...</div>
            </div>
            <div class="weekly-summary">
                <div class="summary-row">
                    <span>Total Team Hours:</span>
                    <span id="totalTeamHours">0.00</span>
                </div>
            </div>
        `;

        const summaryCard = document.querySelector('.summary-card');
        if (summaryCard) {
            summaryCard.parentNode.insertBefore(weeklyContainer, summaryCard.nextSibling);
        }
    }

    bindEvents() {
        document.getElementById('weeklyToggleBtn').addEventListener('click', () => this.toggle());
        document.getElementById('prevWeek').addEventListener('click', () => this.navigateWeek(-1));
        document.getElementById('nextWeek').addEventListener('click', () => this.navigateWeek(1));
    }

    toggle() {
        const container = document.getElementById('weeklyBreakdownContainer');
        const button = document.getElementById('weeklyToggleBtn');
        
        this.isVisible = !this.isVisible;
        
        if (this.isVisible) {
            container.classList.remove('hidden');
            button.classList.add('active');
            this.loadWeeklyData();
        } else {
            container.classList.add('hidden');
            button.classList.remove('active');
        }
    }

    navigateWeek(direction) {
        this.currentWeekOffset += direction;
        this.loadWeeklyData();
    }

    getWeekDates(offset = 0) {
        const now = this.getMountainTime();
        const currentWeekStart = new Date(now);
        
        const daysSinceMonday = (now.getDay() + 6) % 7;
        currentWeekStart.setDate(now.getDate() - daysSinceMonday + (offset * 7));
        currentWeekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(currentWeekStart);
        weekEnd.setDate(currentWeekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);
        
        return { start: currentWeekStart, end: weekEnd };
    }

    async loadWeeklyData() {
        const logs = await getStoredLogs();
        const weekDates = this.getWeekDates(this.currentWeekOffset);
        
        this.updateWeekHeader(weekDates);
        
        const weekLogs = logs.filter(log => {
            const logDate = new Date(log.timestamp);
            return logDate >= weekDates.start && logDate <= weekDates.end && log.hoursWorked;
        });

        this.renderWeeklyBreakdown(weekLogs, weekDates);
    }

    updateWeekHeader(weekDates) {
        const weekRange = document.getElementById('weekRange');
        const startStr = weekDates.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = weekDates.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        let headerText = `${startStr} - ${endStr}`;
        if (this.currentWeekOffset === 0) {
            headerText += ' (Current Week)';
        } else if (this.currentWeekOffset === -1) {
            headerText += ' (Last Week)';
        }
        
        weekRange.textContent = headerText;
    }

    renderWeeklyBreakdown(logs, weekDates) {
        const content = document.getElementById('weeklyContent');
        
        if (logs.length === 0) {
            content.innerHTML = '<div class="no-data">No time logs for this week</div>';
            document.getElementById('totalTeamHours').textContent = '0.00';
            return;
        }

        const employeeData = this.processEmployeeData(logs, weekDates);
        const html = this.generateEmployeeHTML(employeeData);
        
        content.innerHTML = html;
        
        const totalTeamHours = Object.values(employeeData)
            .reduce((sum, emp) => sum + emp.totalHours, 0);
        document.getElementById('totalTeamHours').textContent = totalTeamHours.toFixed(2);
    }

    processEmployeeData(logs, weekDates) {
        const employeeData = {};
        
        logs.forEach(log => {
            const empId = log.employeeId;
            if (!employeeData[empId]) {
                employeeData[empId] = {
                    name: log.employeeName,
                    days: this.initializeDays(weekDates),
                    totalHours: 0
                };
            }
            
            const logDate = new Date(log.timestamp);
            const jsDay = logDate.getDay();
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayKey = dayNames[jsDay];
            
            if (employeeData[empId].days[dayKey]) {
                employeeData[empId].days[dayKey].hours += log.hoursWorked;
                employeeData[empId].days[dayKey].sessions.push({
                    timeIn: new Date(log.timestamp).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }),
                    timeOut: log.punchOut ? new Date(log.punchOut).toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }) : 'Ongoing',
                    hours: log.hoursWorked
                });
            }
            
            employeeData[empId].totalHours += log.hoursWorked;
        });
        
        return employeeData;
    }

    initializeDays(weekDates) {
        const days = {};
        const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekDates.start);
            date.setDate(weekDates.start.getDate() + i);
            const dayKey = dayNames[i];
            
            days[dayKey] = {
                date: date.getDate(),
                hours: 0,
                sessions: []
            };
        }
        
        return days;
    }

    generateEmployeeHTML(employeeData) {
        let html = '';
        
        Object.values(employeeData).forEach(employee => {
            html += `
                <div class="employee-breakdown">
                    <div class="employee-header">
                        <h3>${employee.name}</h3>
                        <span class="employee-total">${employee.totalHours.toFixed(2)}h</span>
                    </div>
                    <div class="days-grid">
            `;
            
            Object.entries(employee.days).forEach(([day, data]) => {
                const hasHours = data.hours > 0;
                html += `
                    <div class="day-card ${hasHours ? 'has-hours' : 'no-hours'}">
                        <div class="day-header">
                            <span class="day-name">${day}</span>
                            <span class="day-date">${data.date}</span>
                        </div>
                        <div class="day-hours">${data.hours.toFixed(1)}h</div>
                `;
                
                if (data.sessions.length > 0) {
                    html += '<div class="sessions">';
                    data.sessions.forEach(session => {
                        html += `
                            <div class="session">
                                <span>${session.timeIn} - ${session.timeOut}</span>
                                <span class="session-hours">${session.hours.toFixed(1)}h</span>
                            </div>
                        `;
                    });
                    html += '</div>';
                }
                
                html += '</div>';
            });
            
            html += `
                    </div>
                </div>
            `;
        });
        
        return html;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (typeof getStoredLogs !== 'undefined') {
        new WeeklyBreakdown();
    }
});

// Alerts and Notices Handler
class AlertsHandler {
    constructor() {
        this.noticesList = document.getElementById('noticesList');
        this.eventsList = document.getElementById('eventsList');
        this.alertsList = document.getElementById('alertsList');
        this.newNoticesCount = document.getElementById('newNoticesCount');
        
        this.token = localStorage.getItem('token');
        this.API_URL = 'http://localhost:5000/api';
    }

    // Initialize alerts and notices
    async init() {
        await this.loadAlerts();
        await this.loadNotices();
        await this.loadEvents();
        this.setupRefreshInterval();
    }

    // Load all alerts
    async loadAlerts() {
        try {
            // Fetch exam alerts
            const response = await fetch(`${this.API_URL}/alerts/type/exam`, {
                headers: {
                    'x-auth-token': this.token
                }
            });
            const alerts = await response.json();

            // Fetch urgent notices
            const urgentNoticesResponse = await fetch(`${this.API_URL}/alerts/type/notice`, {
                headers: {
                    'x-auth-token': this.token
                }
            });
            const urgentNotices = await urgentNoticesResponse.json();
            const urgentOnly = urgentNotices.filter(n => n.priority === 'urgent' && n.status === 'active');

            // Combine exam alerts and urgent notices
            this.renderAlerts([...alerts, ...urgentOnly]);
        } catch (error) {
            console.error('Error loading alerts:', error);
        }
    }

    // Load notices
    async loadNotices() {
        try {
            const response = await fetch(`${this.API_URL}/alerts/type/notice`, {
                headers: {
                    'x-auth-token': this.token
                }
            });
            const notices = await response.json();
            this.renderNotices(notices);
            this.updateNoticesCount(notices.filter(n => n.status === 'active').length);
        } catch (error) {
            console.error('Error loading notices:', error);
        }
    }

    // Load events
    async loadEvents() {
        try {
            const response = await fetch(`${this.API_URL}/alerts/type/event`, {
                headers: {
                    'x-auth-token': this.token
                }
            });
            const events = await response.json();
            this.renderEvents(events);
        } catch (error) {
            console.error('Error loading events:', error);
        }
    }

    // Render alerts in the UI
    renderAlerts(alerts) {
        if (!this.alertsList) return;
        
        this.alertsList.innerHTML = alerts
            .filter(alert => alert.status === 'active')
            .map(alert => `
                <div class="alert-item ${alert.priority}-priority">
                    <div class="alert-header">
                        <h5 class="alert-title">${alert.title}</h5>
                        <span class="alert-date">${new Date(alert.date).toLocaleDateString()}</span>
                    </div>
                    <div class="alert-content">${alert.description}</div>
                    <div class="alert-footer">
                        ${alert.deadline ? `<span>Deadline: ${new Date(alert.deadline).toLocaleDateString()}</span>` : ''}
                        <span class="badge bg-${this.getPriorityColor(alert.priority)}">${alert.priority}</span>
                    </div>
                </div>
            `).join('');
    }

    // Render notices in the UI
    renderNotices(notices) {
        if (!this.noticesList) return;
        
        this.noticesList.innerHTML = notices
            .filter(notice => notice.status === 'active')
            .map(notice => `
                <div class="notice-item ${notice.priority ? notice.priority + '-priority' : ''} ${notice.status === 'active' ? 'unread' : ''}">
                    <div class="notice-header">
                        <h5 class="notice-title">${notice.title}</h5>
                        <span class="notice-date">${new Date(notice.date).toLocaleDateString()}</span>
                    </div>
                    <div class="notice-content">${notice.description}</div>
                </div>
            `).join('');
    }

    // Render events in the UI
    renderEvents(events) {
        if (!this.eventsList) return;
        
        this.eventsList.innerHTML = events
            .filter(event => event.status === 'active')
            .map(event => `
                <div class="event-item">
                    <div class="event-header">
                        <h5 class="event-title">${event.title}</h5>
                        <span class="event-date">${new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div class="event-content">${event.description}</div>
                    ${event.deadline ? `
                        <div class="event-footer">
                            <span>Deadline: ${new Date(event.deadline).toLocaleDateString()}</span>
                        </div>
                    ` : ''}
                </div>
            `).join('');
    }

    // Update the count of new notices
    updateNoticesCount(count) {
        if (this.newNoticesCount) {
            this.newNoticesCount.textContent = count || '';
            this.newNoticesCount.style.display = count ? 'inline' : 'none';
        }
    }

    // Get appropriate color for priority badges
    getPriorityColor(priority) {
        switch (priority) {
            case 'high': return 'danger';
            case 'medium': return 'warning';
            case 'low': return 'info';
            case 'urgent': return 'danger';
            default: return 'secondary';
        }
    }

    // Setup auto-refresh interval
    setupRefreshInterval() {
        // Refresh every 5 minutes
        setInterval(() => {
            this.loadAlerts();
            this.loadNotices();
            this.loadEvents();
        }, 5 * 60 * 1000);
    }
}

// Initialize alerts handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const alertsHandler = new AlertsHandler();
    
    // Initialize if user is logged in
    if (localStorage.getItem('token')) {
        alertsHandler.init();
    }
}); 
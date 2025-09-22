// Modern UI JavaScript for AirWatch AI

class ModernUI {
    constructor() {
        this.isDarkMode = true;
        this.notifications = [];
        this.currentSection = 'home';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupScrollEffects();
        this.setupThemeToggle();
        this.setupNotifications();
        this.setupAnimations();
        this.loadRealTimeData();
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');

        // Smooth scrolling for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                
                if (targetId === 'dashboard') {
                    this.navigateToPage('/source_analysis.html');
                } else if (targetId === 'forecast') {
                    this.navigateToPage('/forecasting.html');
                } else if (targetId === 'community') {
                    this.navigateToPage('/citizen_portal.html');
                } else {
                    this.scrollToSection(targetId);
                }
                
                this.updateActiveNavLink(link);
            });
        });

        // Mobile navigation toggle
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
                navMenu.classList.remove('active');
                navToggle.classList.remove('active');
            }
        });

        // Navbar scroll effect
        window.addEventListener('scroll', () => {
            const navbar = document.querySelector('.navbar');
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    setupScrollEffects() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    this.currentSection = entry.target.id;
                    this.updateActiveNavLink();
                }
            });
        }, observerOptions);

        // Observe all sections for scroll animations
        document.querySelectorAll('section').forEach(section => {
            section.classList.add('fade-in');
            observer.observe(section);
        });

        // Observe cards for staggered animations
        document.querySelectorAll('.stat-card, .feature-card, .insight-card').forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
            observer.observe(card);
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        
        themeToggle.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Load saved theme
        const savedTheme = localStorage.getItem('airwatch-theme');
        if (savedTheme) {
            this.isDarkMode = savedTheme === 'dark';
            this.applyTheme();
        }
    }

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        this.applyTheme();
        localStorage.setItem('airwatch-theme', this.isDarkMode ? 'dark' : 'light');
    }

    applyTheme() {
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        
        if (this.isDarkMode) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
            icon.className = 'fas fa-sun';
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
            icon.className = 'fas fa-moon';
        }
    }

    setupNotifications() {
        const notificationBtn = document.getElementById('notificationBtn');
        const notificationBadge = document.querySelector('.notification-badge');
        
        notificationBtn.addEventListener('click', () => {
            this.showNotifications();
        });

        // Simulate real-time notifications
        this.startNotificationSimulation();
    }

    startNotificationSimulation() {
        const notifications = [
            {
                id: 1,
                title: 'High AQI Alert',
                message: 'AQI levels have reached 287 in Central Delhi',
                type: 'critical',
                timestamp: new Date()
            },
            {
                id: 2,
                title: 'Stubble Burning Detected',
                message: 'Satellite imagery shows active fires in Haryana',
                type: 'warning',
                timestamp: new Date()
            },
            {
                id: 3,
                title: 'Weather Update',
                message: 'Wind speed decreased to 8 km/h, pollution may persist',
                type: 'info',
                timestamp: new Date()
            }
        ];

        this.notifications = notifications;
        this.updateNotificationBadge();
    }

    showNotifications() {
        // Create notification panel
        const panel = document.createElement('div');
        panel.className = 'notification-panel';
        panel.innerHTML = `
            <div class="notification-header">
                <h3>Notifications</h3>
                <button class="close-notifications">&times;</button>
            </div>
            <div class="notification-list">
                ${this.notifications.map(notification => `
                    <div class="notification-item ${notification.type}">
                        <div class="notification-icon">
                            <i class="fas fa-${this.getNotificationIcon(notification.type)}"></i>
                        </div>
                        <div class="notification-content">
                            <h4>${notification.title}</h4>
                            <p>${notification.message}</p>
                            <span class="notification-time">${this.formatTime(notification.timestamp)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.body.appendChild(panel);

        // Close panel functionality
        const closeBtn = panel.querySelector('.close-notifications');
        closeBtn.addEventListener('click', () => {
            panel.remove();
        });

        // Close on outside click
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                panel.remove();
            }
        });
    }

    getNotificationIcon(type) {
        const icons = {
            critical: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle',
            success: 'check-circle'
        };
        return icons[type] || 'bell';
    }

    formatTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        
        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return timestamp.toLocaleDateString();
    }

    updateNotificationBadge() {
        const badge = document.querySelector('.notification-badge');
        const count = this.notifications.length;
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
    }

    setupAnimations() {
        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroBackground = document.querySelector('.hero-background');
            if (heroBackground) {
                heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });

        // Hover effects for cards
        document.querySelectorAll('.stat-card, .feature-card, .insight-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Button hover effects
        document.querySelectorAll('.btn-primary, .btn-secondary, .btn-action').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-3px)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
            });
        });
    }

    loadRealTimeData() {
        // Simulate real-time data updates
        setInterval(() => {
            this.updateAQI();
            this.updateAlerts();
            this.updateStats();
        }, 5000);

        // Initial load
        this.updateAQI();
        this.updateAlerts();
        this.updateStats();
    }

    async updateAQI() {
        try {
            const response = await fetch('/api/overview/current-aqi');
            const data = await response.json();
            
            const aqiElement = document.getElementById('currentAQI');
            if (aqiElement) {
                this.animateValue(aqiElement, parseInt(aqiElement.textContent), data.aqi, 1000);
            }
        } catch (error) {
            console.log('Using mock data for AQI');
            this.animateValue(document.getElementById('currentAQI'), 287, 295, 1000);
        }
    }

    async updateAlerts() {
        try {
            const response = await fetch('/api/overview/alerts');
            const data = await response.json();
            
            const alertsElement = document.getElementById('activeAlerts');
            if (alertsElement) {
                this.animateValue(alertsElement, parseInt(alertsElement.textContent), data.length, 1000);
            }
        } catch (error) {
            console.log('Using mock data for alerts');
            this.animateValue(document.getElementById('activeAlerts'), 12, 15, 1000);
        }
    }

    async updateStats() {
        try {
            const response = await fetch('/api/overview/stations');
            const data = await response.json();
            
            const stationsElement = document.getElementById('monitoringStations');
            if (stationsElement) {
                this.animateValue(stationsElement, parseInt(stationsElement.textContent), data.length, 1000);
            }
        } catch (error) {
            console.log('Using mock data for stations');
            this.animateValue(document.getElementById('monitoringStations'), 45, 47, 1000);
        }
    }

    animateValue(element, start, end, duration) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.round(current);
        }, 16);
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    navigateToPage(url) {
        window.location.href = url;
    }

    updateActiveNavLink(clickedLink = null) {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        
        if (clickedLink) {
            clickedLink.classList.add('active');
        } else {
            // Update based on current section
            const activeLink = document.querySelector(`.nav-link[href="#${this.currentSection}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    }
}

// Global functions for HTML onclick handlers
window.scrollToSection = function(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ModernUI();
});

// Add notification panel styles
const notificationStyles = `
<style>
.notification-panel {
    position: fixed;
    top: 100px;
    right: 20px;
    width: 350px;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 20px;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

.notification-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.notification-header h3 {
    color: #ffffff;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
}

.close-notifications {
    background: none;
    border: none;
    color: #94a3b8;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.close-notifications:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
}

.notification-list {
    max-height: 400px;
    overflow-y: auto;
}

.notification-item {
    display: flex;
    gap: 1rem;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    transition: background-color 0.3s ease;
}

.notification-item:last-child {
    border-bottom: none;
}

.notification-item:hover {
    background: rgba(59, 130, 246, 0.05);
}

.notification-item.critical {
    border-left: 4px solid #ef4444;
}

.notification-item.warning {
    border-left: 4px solid #f59e0b;
}

.notification-item.info {
    border-left: 4px solid #3b82f6;
}

.notification-item.success {
    border-left: 4px solid #10b981;
}

.notification-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.notification-item.critical .notification-icon {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
}

.notification-item.warning .notification-icon {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
}

.notification-item.info .notification-icon {
    background: rgba(59, 130, 246, 0.2);
    color: #3b82f6;
}

.notification-item.success .notification-icon {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
}

.notification-content {
    flex: 1;
}

.notification-content h4 {
    color: #ffffff;
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
}

.notification-content p {
    color: #94a3b8;
    font-size: 0.875rem;
    line-height: 1.4;
    margin: 0 0 0.5rem 0;
}

.notification-time {
    color: #64748b;
    font-size: 0.75rem;
}

/* Mobile navigation styles */
@media (max-width: 768px) {
    .nav-menu {
        position: fixed;
        top: 80px;
        left: 0;
        right: 0;
        background: rgba(15, 23, 42, 0.98);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(59, 130, 246, 0.2);
        flex-direction: column;
        padding: 2rem;
        transform: translateY(-100%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .nav-menu.active {
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
    }
    
    .nav-toggle.active span:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active span:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .notification-panel {
        right: 10px;
        left: 10px;
        width: auto;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);

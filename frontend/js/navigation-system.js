// Advanced Navigation System for AirWatch AI

class NavigationSystem {
    constructor() {
        this.currentSection = 'overview';
        this.navigationHistory = [];
        this.sectionData = {};
        this.isLoading = false;
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupSectionHandlers();
        this.loadInitialData();
        this.setupBackButton();
        this.setupBreadcrumbs();
    }

    setupNavigation() {
        // Create navigation elements
        this.createNavigationBar();
        this.createSectionContainers();
        this.setupNavigationEvents();
    }

    createNavigationBar() {
        const navBar = document.createElement('div');
        navBar.className = 'navigation-bar';
        navBar.innerHTML = `
            <div class="nav-container">
                <div class="nav-brand">
                    <img src="assets/icons/airwatch-logo.png" alt="AirWatch AI">
                    <span>AirWatch AI</span>
                </div>
                <nav class="nav-menu">
                    <button class="nav-item active" data-section="overview">
                        <i class="fas fa-home"></i>
                        <span>Overview</span>
                    </button>
                    <button class="nav-item" data-section="source-analysis">
                        <i class="fas fa-chart-pie"></i>
                        <span>Source Analysis</span>
                    </button>
                    <button class="nav-item" data-section="forecasting">
                        <i class="fas fa-cloud-sun"></i>
                        <span>AI Forecasting</span>
                    </button>
                    <button class="nav-item" data-section="citizen-portal">
                        <i class="fas fa-users"></i>
                        <span>Citizen Portal</span>
                    </button>
                    <button class="nav-item" data-section="policy-dashboard">
                        <i class="fas fa-chart-line"></i>
                        <span>Policy Dashboard</span>
                    </button>
                </nav>
                <div class="nav-actions">
                    <button class="btn-back-home" id="backToHome" title="Back to Home">
                        <i class="fas fa-home"></i>
                        <span>Home</span>
                    </button>
                    <div class="breadcrumbs" id="breadcrumbs"></div>
                </div>
            </div>
        `;

        // Insert navigation bar
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.insertBefore(navBar, mainContent.firstChild);
        }
    }

    createSectionContainers() {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        // Create section containers
        const sections = [
            'overview',
            'source-analysis',
            'forecasting',
            'citizen-portal',
            'policy-dashboard'
        ];

        sections.forEach(section => {
            const container = document.createElement('div');
            container.className = `section-container ${section}-section`;
            container.id = `section-${section}`;
            container.style.display = section === 'overview' ? 'block' : 'none';
            
            // Add loading spinner
            container.innerHTML = `
                <div class="section-loading" style="display: none;">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Loading ${section.replace('-', ' ')} data...</p>
                    </div>
                </div>
                <div class="section-content"></div>
            `;

            mainContent.appendChild(container);
        });
    }

    setupNavigationEvents() {
        // Navigation item clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.nav-item')) {
                const navItem = e.target.closest('.nav-item');
                const section = navItem.dataset.section;
                this.navigateToSection(section);
            }

            if (e.target.closest('.btn-back-home')) {
                this.navigateToHome();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.navigateToSection('overview');
                        break;
                    case '2':
                        e.preventDefault();
                        this.navigateToSection('source-analysis');
                        break;
                    case '3':
                        e.preventDefault();
                        this.navigateToSection('forecasting');
                        break;
                    case '4':
                        e.preventDefault();
                        this.navigateToSection('citizen-portal');
                        break;
                    case '5':
                        e.preventDefault();
                        this.navigateToSection('policy-dashboard');
                        break;
                    case 'h':
                        e.preventDefault();
                        this.navigateToHome();
                        break;
                }
            }
        });
    }

    setupSectionHandlers() {
        this.sectionHandlers = {
            'overview': () => this.loadOverviewSection(),
            'source-analysis': () => this.loadSourceAnalysisSection(),
            'forecasting': () => this.loadForecastingSection(),
            'citizen-portal': () => this.loadCitizenPortalSection(),
            'policy-dashboard': () => this.loadPolicyDashboardSection()
        };
    }

    async navigateToSection(section) {
        if (this.isLoading || section === this.currentSection) return;

        this.isLoading = true;
        
        // Update navigation history
        this.navigationHistory.push(this.currentSection);
        
        // Update active navigation item
        this.updateActiveNavItem(section);
        
        // Hide current section
        this.hideCurrentSection();
        
        // Show loading spinner
        this.showLoadingSpinner(section);
        
        try {
            // Load section data
            await this.loadSectionData(section);
            
            // Show new section
            this.showSection(section);
            
            // Update breadcrumbs
            this.updateBreadcrumbs(section);
            
            // Update current section
            this.currentSection = section;
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
        } catch (error) {
            console.error(`Error loading section ${section}:`, error);
            this.showError(section, error.message);
        } finally {
            this.isLoading = false;
        }
    }

    navigateToHome() {
        this.navigateToSection('overview');
        this.navigationHistory = [];
    }

    updateActiveNavItem(section) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to current section
        const activeItem = document.querySelector(`[data-section="${section}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    hideCurrentSection() {
        const currentContainer = document.getElementById(`section-${this.currentSection}`);
        if (currentContainer) {
            currentContainer.style.display = 'none';
        }
    }

    showSection(section) {
        const container = document.getElementById(`section-${section}`);
        if (container) {
            container.style.display = 'block';
            // Hide loading spinner
            const loadingSpinner = container.querySelector('.section-loading');
            if (loadingSpinner) {
                loadingSpinner.style.display = 'none';
            }
        }
    }

    showLoadingSpinner(section) {
        const container = document.getElementById(`section-${section}`);
        if (container) {
            const loadingSpinner = container.querySelector('.section-loading');
            if (loadingSpinner) {
                loadingSpinner.style.display = 'flex';
            }
        }
    }

    async loadSectionData(section) {
        if (this.sectionHandlers[section]) {
            await this.sectionHandlers[section]();
        }
    }

    async loadOverviewSection() {
        const container = document.getElementById('section-overview');
        if (!container) return;

        const content = container.querySelector('.section-content');
        
        try {
            const response = await fetch('/api/comprehensive/source-analysis/dashboard');
            const data = await response.json();
            
            content.innerHTML = this.generateOverviewContent(data);
            this.sectionData.overview = data;
            
        } catch (error) {
            content.innerHTML = this.generateErrorContent('Failed to load overview data');
        }
    }

    async loadSourceAnalysisSection() {
        const container = document.getElementById('section-source-analysis');
        if (!container) return;

        const content = container.querySelector('.section-content');
        
        try {
            const response = await fetch('/api/comprehensive/source-analysis/dashboard');
            const data = await response.json();
            
            content.innerHTML = this.generateSourceAnalysisContent(data);
            this.sectionData.sourceAnalysis = data;
            
            // Initialize charts
            this.initializeSourceAnalysisCharts(data);
            
        } catch (error) {
            content.innerHTML = this.generateErrorContent('Failed to load source analysis data');
        }
    }

    async loadForecastingSection() {
        const container = document.getElementById('section-forecasting');
        if (!container) return;

        const content = container.querySelector('.section-content');
        
        try {
            const response = await fetch('/api/comprehensive/forecasting/dashboard');
            const data = await response.json();
            
            content.innerHTML = this.generateForecastingContent(data);
            this.sectionData.forecasting = data;
            
            // Initialize forecast charts
            this.initializeForecastingCharts(data);
            
        } catch (error) {
            content.innerHTML = this.generateErrorContent('Failed to load forecasting data');
        }
    }

    async loadCitizenPortalSection() {
        const container = document.getElementById('section-citizen-portal');
        if (!container) return;

        const content = container.querySelector('.section-content');
        
        try {
            const response = await fetch('/api/comprehensive/citizen-portal/dashboard');
            const data = await response.json();
            
            content.innerHTML = this.generateCitizenPortalContent(data);
            this.sectionData.citizenPortal = data;
            
        } catch (error) {
            content.innerHTML = this.generateErrorContent('Failed to load citizen portal data');
        }
    }

    async loadPolicyDashboardSection() {
        const container = document.getElementById('section-policy-dashboard');
        if (!container) return;

        const content = container.querySelector('.section-content');
        
        try {
            const response = await fetch('/api/comprehensive/policy-dashboard/data');
            const data = await response.json();
            
            content.innerHTML = this.generatePolicyDashboardContent(data);
            this.sectionData.policyDashboard = data;
            
        } catch (error) {
            content.innerHTML = this.generateErrorContent('Failed to load policy dashboard data');
        }
    }

    generateOverviewContent(data) {
        return `
            <div class="overview-dashboard">
                <div class="dashboard-header">
                    <h1>AirWatch AI Overview</h1>
                    <p>Comprehensive pollution monitoring and analysis for Delhi-NCR</p>
                </div>
                
                <div class="overview-stats">
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-wind"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Current AQI</h3>
                            <p class="stat-value">${data.summary?.dominant_source || 'Loading...'}</p>
                            <span class="stat-label">Primary Source</span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-chart-pie"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Sources Identified</h3>
                            <p class="stat-value">${data.summary?.total_sources || 0}</p>
                            <span class="stat-label">Active Sources</span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="stat-content">
                            <h3>High Impact</h3>
                            <p class="stat-value">${data.summary?.high_impact_sources || 0}</p>
                            <span class="stat-label">Critical Sources</span>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="stat-content">
                            <h3>Confidence</h3>
                            <p class="stat-value">${data.summary?.average_confidence || 0}%</p>
                            <span class="stat-label">AI Accuracy</span>
                        </div>
                    </div>
                </div>
                
                <div class="overview-actions">
                    <button class="action-btn" onclick="window.navigationSystem.navigateToSection('source-analysis')">
                        <i class="fas fa-chart-pie"></i>
                        <span>Analyze Sources</span>
                    </button>
                    <button class="action-btn" onclick="window.navigationSystem.navigateToSection('forecasting')">
                        <i class="fas fa-cloud-sun"></i>
                        <span>View Forecast</span>
                    </button>
                    <button class="action-btn" onclick="window.navigationSystem.navigateToSection('citizen-portal')">
                        <i class="fas fa-users"></i>
                        <span>Citizen Portal</span>
                    </button>
                    <button class="action-btn" onclick="window.navigationSystem.navigateToSection('policy-dashboard')">
                        <i class="fas fa-chart-line"></i>
                        <span>Policy Dashboard</span>
                    </button>
                </div>
            </div>
        `;
    }

    generateSourceAnalysisContent(data) {
        return `
            <div class="source-analysis-dashboard">
                <div class="dashboard-header">
                    <h1>Source Analysis Dashboard</h1>
                    <p>Comprehensive pollution source identification and impact analysis</p>
                </div>
                
                <div class="analysis-grid">
                    <div class="analysis-card">
                        <h3>Impact Distribution</h3>
                        <div id="impactChart" class="chart-container"></div>
                    </div>
                    
                    <div class="analysis-card">
                        <h3>Source Details</h3>
                        <div class="source-list">
                            ${data.impact_distribution?.map(source => `
                                <div class="source-item">
                                    <div class="source-info">
                                        <span class="source-name">${source.name}</span>
                                        <span class="source-percentage">${source.percentage}%</span>
                                    </div>
                                    <div class="source-bar">
                                        <div class="source-fill" style="width: ${source.percentage}%; background-color: ${source.color}"></div>
                                    </div>
                                </div>
                            `).join('') || '<p>No data available</p>'}
                        </div>
                    </div>
                </div>
                
                <div class="analysis-insights">
                    <h3>AI Insights</h3>
                    <div class="insights-grid">
                        <div class="insight-card">
                            <h4>Summary</h4>
                            <p>${data.ai_insights?.summary || 'No insights available'}</p>
                        </div>
                        <div class="insight-card">
                            <h4>Top Concerns</h4>
                            <ul>
                                ${data.ai_insights?.top_concerns?.map(concern => `<li>${concern}</li>`).join('') || '<li>No concerns identified</li>'}
                            </ul>
                        </div>
                        <div class="insight-card">
                            <h4>Recommendations</h4>
                            <ul>
                                ${data.ai_insights?.recommendations?.map(rec => `<li>${rec}</li>`).join('') || '<li>No recommendations available</li>'}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateForecastingContent(data) {
        return `
            <div class="forecasting-dashboard">
                <div class="dashboard-header">
                    <h1>AI Forecasting Dashboard</h1>
                    <p>Advanced AI-powered pollution forecasting and trend analysis</p>
                </div>
                
                <div class="forecast-grid">
                    <div class="forecast-card">
                        <h3>Current AQI</h3>
                        <div class="current-aqi">
                            <span class="aqi-value">${data.current_aqi || 0}</span>
                            <span class="aqi-category">${this.getAQICategory(data.current_aqi || 0)}</span>
                        </div>
                    </div>
                    
                    <div class="forecast-card">
                        <h3>24-Hour Forecast</h3>
                        <div id="hourlyChart" class="chart-container"></div>
                    </div>
                    
                    <div class="forecast-card">
                        <h3>7-Day Forecast</h3>
                        <div id="dailyChart" class="chart-container"></div>
                    </div>
                </div>
                
                <div class="forecast-alerts">
                    <h3>Forecast Alerts</h3>
                    <div class="alerts-list">
                        ${data.alerts?.map(alert => `
                            <div class="alert-item ${alert.type.toLowerCase()}">
                                <i class="fas fa-exclamation-triangle"></i>
                                <div class="alert-content">
                                    <h4>${alert.message}</h4>
                                    <p>${alert.recommended_action}</p>
                                </div>
                            </div>
                        `).join('') || '<p>No alerts at this time</p>'}
                    </div>
                </div>
            </div>
        `;
    }

    generateCitizenPortalContent(data) {
        return `
            <div class="citizen-portal-dashboard">
                <div class="dashboard-header">
                    <h1>Citizen Portal</h1>
                    <p>Personalized air quality information and health recommendations</p>
                </div>
                
                <div class="portal-grid">
                    <div class="portal-card">
                        <h3>Hyperlocal AQI</h3>
                        <div class="hyperlocal-list">
                            ${data.hyperlocal_data?.map(location => `
                                <div class="location-item">
                                    <span class="location-name">${location.location}</span>
                                    <span class="location-aqi">AQI: ${location.aqi}</span>
                                    <span class="location-category">${location.category}</span>
                                </div>
                            `).join('') || '<p>No hyperlocal data available</p>'}
                        </div>
                    </div>
                    
                    <div class="portal-card">
                        <h3>Health Recommendations</h3>
                        <div class="health-info">
                            <p><strong>Current AQI:</strong> ${data.health_recommendations?.current_aqi || 0}</p>
                            <p><strong>Category:</strong> ${data.health_recommendations?.category || 'Unknown'}</p>
                            <p><strong>Recommendation:</strong> ${data.health_recommendations?.general_recommendation || 'No recommendation'}</p>
                        </div>
                    </div>
                    
                    <div class="portal-card">
                        <h3>Safe Routes</h3>
                        <div class="routes-list">
                            ${data.safe_routes?.map(route => `
                                <div class="route-item">
                                    <div class="route-info">
                                        <span class="route-name">${route.origin} to ${route.destination}</span>
                                        <span class="route-aqi">AQI: ${route.avg_aqi}</span>
                                    </div>
                                    <div class="route-safety">
                                        <span class="safety-score">Safety: ${route.safety_score}%</span>
                                    </div>
                                </div>
                            `).join('') || '<p>No safe routes available</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generatePolicyDashboardContent(data) {
        return `
            <div class="policy-dashboard">
                <div class="dashboard-header">
                    <h1>Policy Dashboard</h1>
                    <p>Real-time policy effectiveness monitoring and AI recommendations</p>
                </div>
                
                <div class="policy-grid">
                    <div class="policy-card">
                        <h3>Policy Effectiveness</h3>
                        <div class="policy-list">
                            ${data.policy_effectiveness?.map(policy => `
                                <div class="policy-item">
                                    <div class="policy-name">${policy.policy_name}</div>
                                    <div class="policy-metrics">
                                        <span>AQI Reduction: ${policy.effectiveness.aqi_reduction}</span>
                                        <span>Compliance: ${policy.effectiveness.compliance_rate}%</span>
                                    </div>
                                </div>
                            `).join('') || '<p>No policy data available</p>'}
                        </div>
                    </div>
                    
                    <div class="policy-card">
                        <h3>AI Recommendations</h3>
                        <div class="recommendations-list">
                            ${data.ai_recommendations?.map(rec => `
                                <div class="recommendation-item">
                                    <div class="rec-priority ${rec.priority.toLowerCase()}">${rec.priority}</div>
                                    <div class="rec-content">
                                        <h4>${rec.recommendation}</h4>
                                        <p>Expected Impact: ${rec.expected_impact}</p>
                                    </div>
                                </div>
                            `).join('') || '<p>No recommendations available</p>'}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateErrorContent(message) {
        return `
            <div class="error-container">
                <div class="error-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Error Loading Data</h3>
                <p>${message}</p>
                <button class="retry-btn" onclick="location.reload()">Retry</button>
            </div>
        `;
    }

    showError(section, message) {
        const container = document.getElementById(`section-${section}`);
        if (container) {
            const content = container.querySelector('.section-content');
            if (content) {
                content.innerHTML = this.generateErrorContent(message);
            }
            this.showSection(section);
        }
    }

    initializeSourceAnalysisCharts(data) {
        // Initialize impact distribution chart
        if (window.pollutionMap && window.pollutionMap.updateSourceData) {
            window.pollutionMap.updateSourceData(data.impact_distribution);
        }
    }

    initializeForecastingCharts(data) {
        // Initialize forecast charts
        if (window.forecastChart && window.forecastChart.updateData) {
            window.forecastChart.updateData(data.hourly_forecast);
        }
    }

    getAQICategory(aqi) {
        if (aqi <= 50) return "Good";
        if (aqi <= 100) return "Satisfactory";
        if (aqi <= 200) return "Moderate";
        if (aqi <= 300) return "Poor";
        if (aqi <= 400) return "Very Poor";
        return "Severe";
    }

    setupBackButton() {
        // Add back button functionality
        const backButton = document.getElementById('backToHome');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.navigateToHome();
            });
        }
    }

    setupBreadcrumbs() {
        this.breadcrumbs = document.getElementById('breadcrumbs');
    }

    updateBreadcrumbs(section) {
        if (!this.breadcrumbs) return;

        const sectionNames = {
            'overview': 'Overview',
            'source-analysis': 'Source Analysis',
            'forecasting': 'AI Forecasting',
            'citizen-portal': 'Citizen Portal',
            'policy-dashboard': 'Policy Dashboard'
        };

        this.breadcrumbs.innerHTML = `
            <span class="breadcrumb-item">Home</span>
            <i class="fas fa-chevron-right"></i>
            <span class="breadcrumb-item active">${sectionNames[section] || section}</span>
        `;
    }

    loadInitialData() {
        // Load overview data on page load
        this.loadSectionData('overview');
    }

    // Public methods for external use
    getCurrentSection() {
        return this.currentSection;
    }

    getSectionData(section) {
        return this.sectionData[section];
    }

    refreshCurrentSection() {
        if (this.currentSection) {
            this.loadSectionData(this.currentSection);
        }
    }

    navigateBack() {
        if (this.navigationHistory.length > 0) {
            const previousSection = this.navigationHistory.pop();
            this.navigateToSection(previousSection);
        }
    }
}

// Initialize navigation system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigationSystem = new NavigationSystem();
});

// Add navigation styles
const navigationStyles = `
<style>
.navigation-bar {
    background: var(--bg-overlay);
    border-bottom: 1px solid var(--border-color);
    backdrop-filter: blur(20px);
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 1rem 0;
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.nav-brand {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
}

.nav-brand img {
    width: 32px;
    height: 32px;
}

.nav-menu {
    display: flex;
    gap: 1rem;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: transparent;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition-fast);
    font-size: 0.9rem;
}

.nav-item:hover {
    background: rgba(59, 130, 246, 0.1);
    color: var(--text-primary);
    border-color: var(--border-strong);
}

.nav-item.active {
    background: var(--gradient-primary);
    color: var(--text-inverse);
    border-color: transparent;
}

.nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.btn-back-home {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    color: var(--text-primary);
    cursor: pointer;
    transition: var(--transition-fast);
    font-size: 0.9rem;
}

.btn-back-home:hover {
    background: rgba(59, 130, 246, 0.2);
    transform: translateY(-2px);
}

.breadcrumbs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.breadcrumb-item {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    transition: var(--transition-fast);
}

.breadcrumb-item.active {
    background: rgba(59, 130, 246, 0.1);
    color: var(--text-primary);
}

.section-container {
    min-height: 100vh;
    padding: 2rem;
}

.section-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    color: var(--text-muted);
}

.loading-spinner i {
    font-size: 2rem;
    margin-bottom: 1rem;
}

.dashboard-header {
    text-align: center;
    margin-bottom: 3rem;
}

.dashboard-header h1 {
    font-size: 2.5rem;
    font-weight: 700;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
}

.dashboard-header p {
    font-size: 1.1rem;
    color: var(--text-secondary);
}

.overview-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
}

.stat-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: var(--transition-normal);
}

.stat-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px var(--shadow-color);
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--gradient-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-inverse);
    font-size: 1.5rem;
}

.stat-content h3 {
    font-size: 0.9rem;
    color: var(--text-secondary);
    margin-bottom: 0.5rem;
}

.stat-value {
    font-size: 1.8rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.8rem;
    color: var(--text-muted);
}

.overview-actions {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.action-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem 1rem;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    color: var(--text-primary);
    cursor: pointer;
    transition: var(--transition-normal);
    text-decoration: none;
}

.action-btn:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px var(--shadow-color);
    border-color: var(--border-strong);
}

.action-btn i {
    font-size: 2rem;
    color: var(--primary-color);
}

.action-btn span {
    font-size: 1rem;
    font-weight: 600;
}

.analysis-grid,
.forecast-grid,
.portal-grid,
.policy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 2rem;
    margin-bottom: 2rem;
}

.analysis-card,
.forecast-card,
.portal-card,
.policy-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 1.5rem;
}

.analysis-card h3,
.forecast-card h3,
.portal-card h3,
.policy-card h3 {
    margin-bottom: 1rem;
    color: var(--text-primary);
    font-size: 1.2rem;
    font-weight: 600;
}

.chart-container {
    height: 300px;
    background: var(--bg-secondary);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-muted);
}

.error-container {
    text-align: center;
    padding: 4rem 2rem;
    color: var(--text-primary);
}

.error-icon {
    font-size: 4rem;
    color: var(--danger-color);
    margin-bottom: 1rem;
}

.error-container h3 {
    margin-bottom: 1rem;
    color: var(--text-primary);
}

.error-container p {
    color: var(--text-secondary);
    margin-bottom: 2rem;
}

.retry-btn {
    padding: 0.75rem 1.5rem;
    background: var(--gradient-primary);
    border: none;
    border-radius: 8px;
    color: var(--text-inverse);
    cursor: pointer;
    transition: var(--transition-fast);
}

.retry-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.3);
}

@media (max-width: 768px) {
    .nav-container {
        flex-direction: column;
        gap: 1rem;
        padding: 0 1rem;
    }
    
    .nav-menu {
        flex-wrap: wrap;
        justify-content: center;
    }
    
    .nav-item {
        font-size: 0.8rem;
        padding: 0.5rem 0.75rem;
    }
    
    .overview-stats {
        grid-template-columns: 1fr;
    }
    
    .analysis-grid,
    .forecast-grid,
    .portal-grid,
    .policy-grid {
        grid-template-columns: 1fr;
    }
    
    .dashboard-header h1 {
        font-size: 2rem;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', navigationStyles);

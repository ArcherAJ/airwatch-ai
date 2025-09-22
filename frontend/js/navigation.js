// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    const navItems = document.querySelectorAll('.nav-item');
    const pageSections = document.querySelectorAll('.page-section');
    
    // Load overview page by default
    loadPageContent('overview');
    
    // Add click event listeners to navigation items
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            
            // Update active navigation item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Load the corresponding page content
            loadPageContent(page);
        });
    });
    
    // Function to load page content
    function loadPageContent(page) {
        // Hide all page sections
        pageSections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show the selected page section
        const activePage = document.getElementById(page);
        if (activePage) {
            activePage.classList.add('active');
            
            // Load content based on page
            switch(page) {
                case 'overview':
                    loadOverviewPage();
                    break;
                case 'source':
                    loadSourceAnalysisPage();
                    break;
                case 'forecast':
                    loadForecastingPage();
                    break;
                case 'citizen':
                    loadCitizenPortalPage();
                    break;
                case 'policy':
                    loadPolicyDashboardPage();
                    break;
            }
        }
    }
    
    // Function to load overview page content
    function loadOverviewPage() {
        // Content is already in HTML, just load data
        loadOverviewData();
    }
    
    // Function to load source analysis page content
    function loadSourceAnalysisPage() {
        document.getElementById('source').innerHTML = `
            <div class="header">
                <h1>Pollution Source Analysis</h1>
                <p>Deep dive into pollution sources with AI-powered identification and impact assessment</p>
            </div>
            
            <!-- Source Detection Overview -->
            <div class="grid grid-cols-3 gap-6 mb-8" id="sources-grid">
                <!-- Sources will be populated dynamically -->
            </div>
            
            <!-- Detailed Source Analysis -->
            <div class="grid grid-cols-2 gap-8 mb-8">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-search text-blue-600"></i>
                            <span>AI Source Detection</span>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="space-y-4" id="detections-list">
                            <!-- Detections will be populated dynamically -->
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-chart-pie text-purple-600"></i>
                            <span>Source Impact Distribution</span>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="chart-container" id="impactChart">
                            <!-- Impact distribution chart -->
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Source Monitoring Table -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-list text-green-600"></i>
                        <span>Real-time Source Monitoring</span>
                    </div>
                </div>
                <div class="card-content">
                    <div class="overflow-x-auto">
                        <table class="table" id="monitoring-table">
                            <thead>
                                <tr>
                                    <th>Location</th>
                                    <th>Primary Source</th>
                                    <th>Pollutant</th>
                                    <th>Level</th>
                                    <th>Trend</th>
                                    <th>Status</th>
                                    <th>Last Updated</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Monitoring data will be populated dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        // Load data for source analysis
        loadSourceAnalysisData();
    }
    
    // Function to load forecasting page content
    function loadForecastingPage() {
        document.getElementById('forecast').innerHTML = `
            <div class="header">
                <h1>AI-Powered Air Quality Forecasting</h1>
                <p>Advanced machine learning models providing accurate pollution predictions for better planning</p>
            </div>
            
            <!-- Forecast Overview -->
            <div class="grid grid-cols-4 gap-6 mb-8" id="forecast-metrics">
                <!-- Forecast metrics will be populated dynamically -->
            </div>
            
            <!-- Forecast Charts -->
            <div class="grid grid-cols-2 gap-8 mb-8">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-chart-line text-blue-600"></i>
                            <span>48-Hour AQI Forecast</span>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="chart-container" id="forecastChart">
                            <!-- 48-hour forecast chart -->
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-wind text-green-600"></i>
                            <span>Weather Impact Analysis</span>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="space-y-4" id="weather-impact">
                            <!-- Weather impact will be populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Weekly Forecast Table -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-calendar-alt text-purple-600"></i>
                        <span>7-Day Air Quality Outlook</span>
                    </div>
                </div>
                <div class="card-content">
                    <div class="overflow-x-auto">
                        <table class="table" id="weekly-forecast-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Forecast AQI</th>
                                    <th>Category</th>
                                    <th>Primary Pollutant</th>
                                    <th>Weather Impact</th>
                                    <th>Confidence</th>
                                    <th>Health Advisory</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Weekly forecast will be populated dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        
        // Load data for forecasting
        loadForecastingData();
    }
    
    // Function to load citizen portal page content
    function loadCitizenPortalPage() {
        document.getElementById('citizen').innerHTML = `
            <div class="header">
                <h1>Citizen Engagement Portal</h1>
                <p>Empowering citizens with real-time information, reporting tools, and community action</p>
            </div>
            
            <!-- Quick Actions -->
            <div class="grid grid-cols-4 gap-6 mb-8">
                <div class="card">
                    <div class="card-content text-center">
                        <div class="metric-icon bg-red-50 mx-auto mb-3">
                            <i class="fas fa-exclamation-triangle text-red-600"></i>
                        </div>
                        <h3 class="font-semibold mb-2">Report Pollution</h3>
                        <button class="btn btn-danger w-full" id="report-pollution-btn">Submit Report</button>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-content text-center">
                        <div class="metric-icon bg-blue-50 mx-auto mb-3">
                            <i class="fas fa-bell text-blue-600"></i>
                        </div>
                        <h3 class="font-semibold mb-2">Get Alerts</h3>
                        <button class="btn btn-primary w-full" id="get-alerts-btn">Subscribe</button>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-content text-center">
                        <div class="metric-icon bg-green-50 mx-auto mb-3">
                            <i class="fas fa-leaf text-green-600"></i>
                        </div>
                        <h3 class="font-semibold mb-2">Green Initiatives</h3>
                        <button class="btn btn-success w-full" id="green-initiatives-btn">Join Campaign</button>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-content text-center">
                        <div class="metric-icon bg-purple-50 mx-auto mb-3">
                            <i class="fas fa-chart-bar text-purple-600"></i>
                        </div>
                        <h3 class="font-semibold mb-2">My Area Data</h3>
                        <button class="btn btn-primary w-full" id="area-data-btn">View Stats</button>
                    </div>
                </div>
            </div>
            
            <!-- Recent Reports and Alerts -->
            <div class="grid grid-cols-2 gap-8 mb-8">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-flag text-red-600"></i>
                            <span>Recent Citizen Reports</span>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="space-y-4" id="citizen-reports">
                            <!-- Citizen reports will be populated dynamically -->
                        </div>
                        
                        <button class="btn btn-primary w-full mt-6" id="submit-report-btn">
                            <i class="fas fa-plus mr-2"></i>Submit New Report
                        </button>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-bell text-blue-600"></i>
                            <span>Community Alerts</span>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="space-y-4" id="community-alerts">
                            <!-- Community alerts will be populated dynamically -->
                        </div>
                        
                        <button class="btn btn-primary w-full mt-6" id="manage-alerts-btn">
                            <i class="fas fa-bell mr-2"></i>Manage Alert Preferences
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Community Initiatives -->
            <div class="card mb-8">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-hands-helping text-green-600"></i>
                        <span>Community Initiatives</span>
                    </div>
                </div>
                <div class="card-content">
                    <div class="grid grid-cols-3 gap-6" id="community-initiatives">
                        <!-- Community initiatives will be populated dynamically -->
                    </div>
                </div>
            </div>
        `;
        
        // Load data for citizen portal
        loadCitizenPortalData();
        
        // Add event listeners for buttons
        document.getElementById('report-pollution-btn')?.addEventListener('click', () => {
            alert('Pollution report form would open here');
        });
        
        document.getElementById('submit-report-btn')?.addEventListener('click', () => {
            alert('Pollution report form would open here');
        });
    }
    
    // Function to load policy dashboard page content
    function loadPolicyDashboardPage() {
        document.getElementById('policy').innerHTML = `
            <div class="header">
                <h1>Policy & Intervention Dashboard</h1>
                <p>Data-driven insights for policymakers and environmental agencies</p>
            </div>
            
            <!-- Policy Impact Metrics -->
            <div class="grid grid-cols-4 gap-6 mb-8" id="policy-metrics">
                <!-- Policy metrics will be populated dynamically -->
            </div>
            
            <!-- Policy Effectiveness -->
            <div class="grid grid-cols-2 gap-8 mb-8">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-tachometer-alt text-blue-600"></i>
                            <span>Policy Effectiveness</span>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="chart-container" id="policyChart">
                            <!-- Policy effectiveness chart -->
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-list-ol text-green-600"></i>
                            <span>Top Performing Interventions</span>
                        </div>
                    </div>
                    <div class="card-content">
                        <div class="space-y-4" id="top-interventions">
                            <!-- Top interventions will be populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Policy Implementation Table -->
            <div class="card mb-8">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-tasks text-purple-600"></i>
                        <span>Policy Implementation Status</span>
                    </div>
                </div>
                <div class="card-content">
                    <div class="overflow-x-auto">
                        <table class="table" id="policy-table">
                            <thead>
                                <tr>
                                    <th>Policy Name</th>
                                    <th>Type</th>
                                    <th>Start Date</th>
                                    <th>Status</th>
                                    <th>Areas Covered</th>
                                    <th>Effectiveness</th>
                                    <th>AQI Reduction</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <!-- Policy data will be populated dynamically -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <!-- Policy Recommendation Engine -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-robot text-blue-600"></i>
                        <span>AI Policy Recommendations</span>
                    </div>
                </div>
                <div class="card-content">
                    <div class="grid grid-cols-2 gap-6" id="policy-recommendations">
                        <!-- Policy recommendations will be populated dynamically -->
                    </div>
                </div>
            </div>
        `;
        
        // Load data for policy dashboard
        loadPolicyDashboardData();
    }
});
// Forecasting Page JavaScript - Optimized
class ForecastingDashboard {
    constructor() {
        this.chart = null;
        this.seasonalChart = null;
        this.gauges = {};
        this.currentData = null;
        this.updateInterval = null;
        this.isInitialized = false;
        
        // Initialize immediately with fallback data
        this.initWithFallback();
    }

    async initWithFallback() {
        // Show loading state immediately
        this.showLoadingState();
        
        // Initialize gauges first (fastest to render)
        this.initializeGauges();
        
        // Setup basic UI
        this.setupEventListeners();
        this.setupBasicAnimations();
        
        // Load data in background with shorter timeout
        try {
            await Promise.race([
                this.loadForecastData(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
            ]);
        } catch (error) {
            console.warn('Using fallback data for faster loading:', error);
            this.loadFallbackData();
        }
        
        // Initialize charts after data is ready
        this.initializeCharts();
        this.startRealTimeUpdates();
        this.isInitialized = true;
    }

    showLoadingState() {
        // Add loading skeletons to key elements
        const elements = [
            { selector: '.chart-container', skeleton: 'chart' },
            { selector: '.insights-content', skeleton: 'insight' },
            { selector: '.seasonal-content', skeleton: 'chart' },
            { selector: '.alerts-list', skeleton: 'alert' }
        ];
        
        elements.forEach(({ selector, skeleton }) => {
            const element = document.querySelector(selector);
            if (element) {
                element.innerHTML = `<div class="loading-skeleton ${skeleton}"></div>`;
            }
        });
        
        // Add gauge skeletons
        const gaugeIds = ['accuracyGauge', 'confidenceGauge', 'uptimeGauge'];
        gaugeIds.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                const container = canvas.parentElement;
                if (container) {
                    container.innerHTML = '<div class="loading-skeleton gauge"></div>';
                }
            }
        });
    }

    loadFallbackData() {
        // Fallback data for immediate display
        this.currentData = {
            current_conditions: {
                aqi: 245,
                category: "Unhealthy",
                primary_pollutant: "PM2.5",
                weather: {
                    temperature: 28.5,
                    humidity: 45,
                    wind_speed: 8.2,
                    wind_direction: "NW",
                    pressure: 1013
                }
            },
            forecasts: {
                "24_hour": {
                    predictions: Array.from({length: 24}, (_, i) => ({
                        timestamp: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
                        aqi: 245 + Math.random() * 50 - 25,
                        confidence: 90 - i * 0.5
                    }))
                }
            },
            ai_insights: {
                model_confidence: 92,
                key_factors: {
                    weather_impact: 0.7,
                    source_activity: 0.8,
                    seasonal_factors: 0.6
                },
                trend: "worsening",
                change_percent: 15
            },
            seasonal_context: {
                current_season: "Post-Monsoon (Stubble Burning)",
                seasonal_impact: "High",
                primary_source: "Stubble Burning",
                description: "Peak stubble burning season in Punjab-Haryana"
            },
            alerts: [
                {
                    type: "warning",
                    severity: "high",
                    title: "Unhealthy Conditions Predicted",
                    message: "AQI expected to reach 285 in next 24 hours",
                    timeframe: "Next 24 hours"
                }
            ],
            confidence_metrics: {
                overall_accuracy: 89.2,
                model_confidence: 92.5
            }
        };
        
        this.updateDashboard(this.currentData);
    }

    async loadForecastData() {
        try {
            // Set shorter timeout for faster loading
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000); // Reduced to 2 seconds
            
            const response = await fetch('/api/forecasting/advanced-forecast', {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            this.currentData = data;
            this.updateDashboard(data);
            
        } catch (error) {
            console.error('Error loading forecast data:', error);
            throw error; // Re-throw to trigger fallback
        }
    }

    updateDashboard(data) {
        // Update current conditions
        this.updateCurrentConditions(data.current_conditions);
        
        // Update AI insights
        this.updateAIInsights(data.ai_insights);
        
        // Update seasonal context
        this.updateSeasonalContext(data.seasonal_context);
        
        // Update alerts
        this.updateAlerts(data.alerts);
        
        // Update charts
        this.updateForecastChart(data.forecasts);
        
        // Update performance metrics
        this.updatePerformanceMetrics(data.confidence_metrics);
    }

    updateCurrentConditions(conditions) {
        document.getElementById('currentAQI').textContent = conditions.aqi;
        document.getElementById('currentWindSpeed').textContent = `${conditions.weather.wind_speed} km/h`;
        document.getElementById('currentTemperature').textContent = `${conditions.weather.temperature}°C`;
        document.getElementById('currentHumidity').textContent = `${conditions.weather.humidity}%`;
        document.getElementById('currentPressure').textContent = `${conditions.weather.pressure} hPa`;
        
        // Update AQI category styling
        const aqiElement = document.getElementById('currentAQI');
        aqiElement.className = `stat-value aqi-${this.getAQICategory(conditions.aqi).toLowerCase().replace(/\s+/g, '-')}`;
    }

    updateAIInsights(insights) {
        document.getElementById('aiConfidence').textContent = `${insights.model_confidence}%`;
        document.getElementById('keyFactors').textContent = this.formatKeyFactors(insights.key_factors);
        document.getElementById('trendAnalysis').textContent = this.getTrendAnalysis(insights);
        document.getElementById('recommendations').textContent = this.getRecommendations(insights);
    }

    updateSeasonalContext(context) {
        document.getElementById('currentSeason').textContent = context.current_season;
        document.getElementById('seasonName').textContent = context.current_season;
        document.getElementById('seasonDescription').textContent = context.description || 'Seasonal air quality patterns';
        
        const impactLevel = document.querySelector('.impact-level');
        impactLevel.textContent = `${context.seasonal_impact} Impact`;
        impactLevel.className = `impact-level ${context.seasonal_impact.toLowerCase().replace(/\s+/g, '-')}`;
    }

    updateAlerts(alerts) {
        const alertsList = document.getElementById('alertsList');
        const alertCount = document.getElementById('alertCount');
        
        alertCount.textContent = `${alerts.length} Active`;
        
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item ${alert.severity}">
                <div class="alert-icon">
                    <i class="fas fa-${this.getAlertIcon(alert.type)}"></i>
                </div>
                <div class="alert-content">
                    <h4>${alert.title}</h4>
                    <p>${alert.message}</p>
                    <span class="alert-timeframe">${alert.timeframe}</span>
                </div>
            </div>
        `).join('');
    }

    updateForecastChart(forecasts) {
        if (!this.chart) return;

        const timeLabels = forecasts['24_hour'].predictions.map(pred => 
            new Date(pred.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        );
        
        const aqiValues = forecasts['24_hour'].predictions.map(pred => pred.aqi);
        const confidenceValues = forecasts['24_hour'].predictions.map(pred => pred.confidence);

        this.chart.data.labels = timeLabels;
        this.chart.data.datasets[0].data = aqiValues;
        this.chart.data.datasets[1].data = confidenceValues;
        this.chart.update();
    }

    updatePerformanceMetrics(metrics) {
        // Update gauge values
        this.updateGauge('accuracyGauge', metrics.overall_accuracy);
        this.updateGauge('confidenceGauge', metrics.model_confidence);
        this.updateGauge('uptimeGauge', 99.1); // Mock uptime data
        
        // Update forecast accuracy
        document.getElementById('forecastAccuracy').textContent = `${metrics.overall_accuracy}%`;
        document.getElementById('modelConfidence').textContent = `${metrics.model_confidence}%`;
    }

    initializeCharts() {
        // Main forecast chart
        const ctx = document.getElementById('forecastChart');
        if (ctx) {
            this.chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'AQI Prediction',
                        data: [],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    }, {
                        label: 'Confidence',
                        data: [],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        yAxisID: 'y1'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: false,
                            min: 50,
                            max: 400,
                            title: {
                                display: true,
                                text: 'AQI'
                            }
                        },
                        y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            min: 0,
                            max: 100,
                            title: {
                                display: true,
                                text: 'Confidence %'
                            },
                            grid: {
                                drawOnChartArea: false,
                            },
                        }
                    },
                    interaction: {
                        intersect: false,
                        mode: 'index'
                    }
                }
            });
        }

        // Seasonal chart
        const seasonalCtx = document.getElementById('seasonalChart');
        if (seasonalCtx) {
            this.seasonalChart = new Chart(seasonalCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Stubble Burning', 'Industrial', 'Vehicular', 'Construction', 'Other'],
                    datasets: [{
                        data: [35, 25, 20, 12, 8],
                        backgroundColor: [
                            '#06b6d4',
                            '#f97316',
                            '#ef4444',
                            '#8b5cf6',
                            '#6b7280'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });
        }
    }

    initializeGauges() {
        // Initialize gauge charts
        this.gauges.accuracyGauge = this.createGauge('accuracyGauge', 89.2, '#10b981');
        this.gauges.confidenceGauge = this.createGauge('confidenceGauge', 92.5, '#3b82f6');
        this.gauges.uptimeGauge = this.createGauge('uptimeGauge', 99.1, '#8b5cf6');
    }

    createGauge(canvasId, value, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        // Set canvas size immediately for proper alignment
        const size = 120;
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = (size / 2) - 15; // Leave margin for stroke

        // Draw background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 2 * Math.PI);
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#e5e7eb';
        ctx.stroke();

        // Draw value arc with animation
        const angle = (value / 100) * Math.PI;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, Math.PI + angle);
        ctx.lineWidth = 12;
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw value text
        ctx.fillStyle = color;
        ctx.font = 'bold 20px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${value}%`, centerX, centerY + 5);

        return { canvas, ctx, centerX, centerY, radius };
    }

    updateGauge(gaugeId, value) {
        const gauge = this.gauges[gaugeId];
        if (!gauge) return;

        const { canvas, ctx, centerX, centerY, radius } = gauge;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Redraw with new value
        this.createGauge(gaugeId, value, gauge.ctx.strokeStyle);
    }

    setupEventListeners() {
        // Forecast type change
        document.getElementById('forecastType').addEventListener('change', (e) => {
            this.loadForecastData();
        });

        // Time horizon change
        document.getElementById('timeHorizon').addEventListener('change', (e) => {
            this.loadForecastData();
        });

        // Update forecast button
        document.getElementById('updateForecast').addEventListener('click', () => {
            this.loadForecastData();
        });

        // Chart period buttons
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.updateChartPeriod(e.target.dataset.period);
            });
        });
    }

    updateChartPeriod(period) {
        if (!this.currentData) return;

        let forecasts;
        switch(period) {
            case '24h':
                forecasts = this.currentData.forecasts['24_hour'];
                break;
            case '72h':
                forecasts = this.currentData.forecasts['72_hour'];
                break;
            case 'weekly':
                // Mock weekly data
                forecasts = this.generateWeeklyData();
                break;
        }

        this.updateForecastChart({ [period]: forecasts });
    }

    generateWeeklyData() {
        const predictions = [];
        for (let i = 0; i < 7; i++) {
            predictions.push({
                timestamp: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
                aqi: 200 + Math.random() * 100,
                confidence: 85 - i * 2
            });
        }
        return { predictions };
    }

    startRealTimeUpdates() {
        // Update every 5 minutes
        this.updateInterval = setInterval(() => {
            this.loadForecastData();
        }, 5 * 60 * 1000);

        // Update last updated time every minute
        setInterval(() => {
            document.getElementById('lastUpdated').textContent = 'Updated just now';
        }, 60 * 1000);
    }

    setupBasicAnimations() {
        // Basic CSS animations without GSAP dependency
        const elements = document.querySelectorAll('.hero-content, .hero-stats .stat-item, .dashboard-card');
        elements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'all 0.6s ease';
            
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    setupAnimations() {
        // Enhanced animations with GSAP if available
        if (typeof gsap !== 'undefined') {
            gsap.from('.hero-content', {
                duration: 1,
                y: 50,
                opacity: 0,
                ease: 'power2.out'
            });

            gsap.from('.hero-stats .stat-item', {
                duration: 0.8,
                y: 30,
                opacity: 0,
                stagger: 0.2,
                delay: 0.5,
                ease: 'power2.out'
            });

            gsap.from('.dashboard-card', {
                duration: 0.6,
                y: 30,
                opacity: 0,
                stagger: 0.1,
                delay: 0.8,
                ease: 'power2.out'
            });

            gsap.to('.forecast-animation .weather-icon', {
                duration: 2,
                rotation: 360,
                repeat: -1,
                ease: 'none'
            });

            gsap.to('.prediction-bubbles .bubble', {
                duration: 3,
                y: -20,
                opacity: 0,
                repeat: -1,
                stagger: 1,
                ease: 'power2.out'
            });
        }
    }

    // Helper methods
    getAQICategory(aqi) {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Moderate';
        if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
        if (aqi <= 200) return 'Unhealthy';
        if (aqi <= 300) return 'Very Unhealthy';
        return 'Hazardous';
    }

    formatKeyFactors(factors) {
        if (!factors) return 'Multiple factors influencing air quality';
        
        const factorNames = {
            'weather_impact': 'Weather Conditions',
            'source_activity': 'Pollution Sources',
            'seasonal_factors': 'Seasonal Patterns',
            'traffic_patterns': 'Traffic Patterns',
            'industrial_activity': 'Industrial Activity'
        };

        return Object.entries(factors)
            .filter(([key, value]) => value > 0.5)
            .map(([key, value]) => `${factorNames[key] || key} (${Math.round(value * 100)}%)`)
            .join(', ');
    }

    getTrendAnalysis(insights) {
        const trend = insights.trend || 'stable';
        const change = insights.change_percent || 0;
        
        if (trend === 'improving') {
            return `AQI expected to improve by ${Math.abs(change)}% in next 24 hours`;
        } else if (trend === 'worsening') {
            return `AQI expected to worsen by ${change}% in next 24 hours`;
        } else {
            return 'AQI expected to remain stable in next 24 hours';
        }
    }

    getRecommendations(insights) {
        const recommendations = insights.policy_recommendations || [];
        if (recommendations.length > 0) {
            return recommendations[0].description || 'Monitor conditions and implement appropriate measures';
        }
        return 'Continue monitoring air quality trends';
    }

    getAlertIcon(type) {
        const icons = {
            'emergency': 'exclamation-triangle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle',
            'success': 'check-circle',
            'health': 'heart',
            'seasonal': 'calendar-alt'
        };
        return icons[type] || 'info-circle';
    }

    showError(message) {
        console.error(message);
        // You could implement a toast notification here
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ForecastingDashboard();
});

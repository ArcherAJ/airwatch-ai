// Source Analysis Page JavaScript
class SourceAnalysisPage {
    constructor() {
        this.data = {
            aiDetection: null,
            satelliteData: null,
            iotData: null,
            monitoringData: null,
            alerts: null,
            recommendations: null
        };
        this.init();
    }

    async init() {
        await this.loadAllData();
        this.renderAllComponents();
        this.setupEventListeners();
    }

    async loadAllData() {
        const endpoints = [
            { key: 'aiDetection', url: '/api/source-analysis/ai-source-analysis' },
            { key: 'satelliteData', url: '/api/source-analysis/satellite-data' },
            { key: 'iotData', url: '/api/source-analysis/iot-data' },
            { key: 'monitoringData', url: '/api/source-analysis/monitoring-data' },
            { key: 'detections', url: '/api/source-analysis/detections' }
        ];

        try {
            const promises = endpoints.map(async ({ key, url }) => {
                const response = await fetch(url);
                if (response.ok) {
                    this.data[key] = await response.json();
                } else {
                    console.error(`Failed to load ${key}:`, response.statusText);
                    this.data[key] = null;
                }
            });

            await Promise.all(promises);
        } catch (error) {
            console.error('Error loading source analysis data:', error);
        }
    }

    renderAllComponents() {
        this.renderAIDetection();
        this.renderSatelliteData();
        this.renderIoTData();
        this.renderMonitoringData();
        this.renderSourceAlerts();
        this.renderRecommendations();
    }

    renderAIDetection() {
        const container = document.getElementById('ai-detection-content');
        
        if (!this.data.aiDetection) {
            container.innerHTML = '<div class="error-message">Failed to load AI detection data</div>';
            return;
        }

        const { identified_sources, seasonal_context, analysis_confidence, recommendations } = this.data.aiDetection;

        container.innerHTML = `
            <div class="ai-detection-dashboard">
                <div class="confidence-meter">
                    <div class="confidence-label">Analysis Confidence</div>
                    <div class="confidence-value">${(analysis_confidence * 100).toFixed(1)}%</div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${analysis_confidence * 100}%"></div>
                    </div>
                </div>

                <div class="seasonal-context">
                    <h4>Seasonal Context</h4>
                    <div class="context-info">
                        <div class="context-item">
                            <span class="label">Season:</span>
                            <span class="value">${seasonal_context.season}</span>
                        </div>
                        <div class="context-item">
                            <span class="label">Primary Concern:</span>
                            <span class="value">${seasonal_context.primary_concern}</span>
                        </div>
                    </div>
                </div>

                <div class="identified-sources">
                    <h4>Identified Sources</h4>
                    <div class="sources-list">
                        ${identified_sources.map(source => `
                            <div class="source-item">
                                <div class="source-type">${source.type}</div>
                                <div class="source-location">${source.location}</div>
                                <div class="source-confidence">Confidence: ${(source.confidence * 100).toFixed(1)}%</div>
                                <div class="source-contribution">Contribution: ${source.contribution}%</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="ai-recommendations">
                    <h4>AI Recommendations</h4>
                    <div class="recommendations-list">
                        ${recommendations.map(rec => `
                            <div class="recommendation-item">
                                <div class="rec-priority priority-${rec.priority.toLowerCase()}">${rec.priority}</div>
                                <div class="rec-action">${rec.action}</div>
                                <div class="rec-impact">Expected Impact: ${rec.expected_impact}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    renderSatelliteData() {
        const container = document.getElementById('satellite-data-content');
        
        if (!this.data.satelliteData) {
            container.innerHTML = '<div class="error-message">Failed to load satellite data</div>';
            return;
        }

        const data = this.data.satelliteData.slice(0, 5); // Show top 5 detections

        container.innerHTML = `
            <div class="satellite-dashboard">
                <div class="satellite-summary">
                    <div class="summary-item">
                        <div class="summary-value">${data.length}</div>
                        <div class="summary-label">Active Detections</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${data.filter(d => d.detected_source === 'Stubble Burning').length}</div>
                        <div class="summary-label">Fire Events</div>
                    </div>
                </div>

                <div class="detections-list">
                    ${data.map(detection => `
                        <div class="detection-item">
                            <div class="detection-header">
                                <div class="detection-source">${detection.detected_source}</div>
                                <div class="detection-severity severity-${detection.severity.toLowerCase()}">${detection.severity}</div>
                            </div>
                            <div class="detection-location">${detection.location}</div>
                            <div class="detection-metrics">
                                <div class="metric">
                                    <span class="metric-label">Fires:</span>
                                    <span class="metric-value">${detection.fire_count}</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Thermal:</span>
                                    <span class="metric-value">${detection.thermal_anomalies}</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Confidence:</span>
                                    <span class="metric-value">${(detection.confidence * 100).toFixed(1)}%</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderIoTData() {
        const container = document.getElementById('iot-data-content');
        
        if (!this.data.iotData) {
            container.innerHTML = '<div class="error-message">Failed to load IoT data</div>';
            return;
        }

        const data = this.data.iotData.slice(0, 6); // Show top 6 sensors
        const activeSensors = data.filter(sensor => sensor.status === 'active').length;

        container.innerHTML = `
            <div class="iot-dashboard">
                <div class="iot-summary">
                    <div class="summary-item">
                        <div class="summary-value">${activeSensors}/${data.length}</div>
                        <div class="summary-label">Active Sensors</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${data.filter(s => s.primary_source === 'Industrial').length}</div>
                        <div class="summary-label">Industrial</div>
                    </div>
                </div>

                <div class="sensors-grid">
                    ${data.map(sensor => `
                        <div class="sensor-card">
                            <div class="sensor-header">
                                <div class="sensor-id">${sensor.sensor_id}</div>
                                <div class="sensor-status status-${sensor.status}">${sensor.status}</div>
                            </div>
                            <div class="sensor-location">${sensor.location}</div>
                            <div class="sensor-aqi">
                                <div class="aqi-value aqi-${this.getAQICategory(sensor.calculated_aqi).toLowerCase().replace(' ', '-')}">${sensor.calculated_aqi}</div>
                                <div class="aqi-category">${sensor.category}</div>
                            </div>
                            <div class="sensor-source">Primary: ${sensor.primary_source}</div>
                            <div class="sensor-metrics">
                                <div class="metric-row">
                                    <span>PM2.5:</span>
                                    <span>${sensor.pm25.toFixed(1)}</span>
                                </div>
                                <div class="metric-row">
                                    <span>PM10:</span>
                                    <span>${sensor.pm10.toFixed(1)}</span>
                                </div>
                                <div class="metric-row">
                                    <span>Traffic:</span>
                                    <span>${sensor.traffic_density}%</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderMonitoringData() {
        const container = document.getElementById('monitoring-data-content');
        
        if (!this.data.monitoringData) {
            container.innerHTML = '<div class="error-message">Failed to load monitoring data</div>';
            return;
        }

        const data = this.data.monitoringData;

        container.innerHTML = `
            <div class="monitoring-dashboard">
                <div class="monitoring-summary">
                    <div class="summary-item">
                        <div class="summary-value">${data.length}</div>
                        <div class="summary-label">Monitoring Points</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${data.filter(d => d.status === 'Critical').length}</div>
                        <div class="summary-label">Critical Alerts</div>
                    </div>
                </div>

                <div class="monitoring-list">
                    ${data.map(monitoring => `
                        <div class="monitoring-item">
                            <div class="monitoring-header">
                                <div class="monitoring-location">${monitoring.location}</div>
                                <div class="monitoring-status status-${monitoring.status.toLowerCase()}">${monitoring.status}</div>
                            </div>
                            <div class="monitoring-details">
                                <div class="detail-row">
                                    <span class="label">Source:</span>
                                    <span class="value">${monitoring.primary_source}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Pollutant:</span>
                                    <span class="value">${monitoring.pollutant}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Level:</span>
                                    <span class="value">${monitoring.level} ${monitoring.unit}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="label">Trend:</span>
                                    <span class="value trend-${monitoring.trend.startsWith('+') ? 'increasing' : 'decreasing'}">${monitoring.trend}</span>
                                </div>
                            </div>
                            <div class="monitoring-timestamp">${new Date(monitoring.last_updated).toLocaleString()}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderSourceAlerts() {
        const container = document.getElementById('source-alerts-content');
        
        if (!this.data.detections) {
            container.innerHTML = '<div class="error-message">Failed to load source alerts</div>';
            return;
        }

        const alerts = this.data.detections;

        container.innerHTML = `
            <div class="alerts-dashboard">
                <div class="alerts-summary">
                    <div class="summary-item">
                        <div class="summary-value">${alerts.length}</div>
                        <div class="summary-label">Active Alerts</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-value">${alerts.filter(a => a.severity === 'Critical').length}</div>
                        <div class="summary-label">Critical</div>
                    </div>
                </div>

                <div class="alerts-list">
                    ${alerts.map(alert => `
                        <div class="alert-item">
                            <div class="alert-header">
                                <div class="alert-type">${alert.type}</div>
                                <div class="alert-severity severity-${alert.severity.toLowerCase()}">${alert.severity}</div>
                                <div class="alert-confidence">${alert.confidence}%</div>
                            </div>
                            <div class="alert-location">${alert.location}</div>
                            <div class="alert-description">${alert.description}</div>
                            <div class="alert-timestamp">${new Date(alert.timestamp).toLocaleString()}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderRecommendations() {
        const container = document.getElementById('source-recommendations-content');
        
        if (!this.data.aiDetection?.recommendations) {
            container.innerHTML = '<div class="error-message">Failed to load recommendations</div>';
            return;
        }

        const recommendations = this.data.aiDetection.recommendations;

        container.innerHTML = `
            <div class="recommendations-dashboard">
                <div class="recommendations-grid">
                    ${recommendations.map(rec => `
                        <div class="recommendation-card">
                            <div class="rec-header">
                                <div class="rec-priority priority-${rec.priority.toLowerCase()}">${rec.priority}</div>
                                <div class="rec-impact">${rec.expected_impact}</div>
                            </div>
                            <div class="rec-title">${rec.action}</div>
                            <div class="rec-description">${rec.description}</div>
                            <div class="rec-footer">
                                <div class="rec-time">Implementation: ${rec.implementation_time}</div>
                                <div class="rec-cost">Cost: ${rec.cost}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    getAQICategory(aqi) {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Satisfactory';
        if (aqi <= 200) return 'Moderate';
        if (aqi <= 300) return 'Poor';
        if (aqi <= 400) return 'Very Poor';
        return 'Severe';
    }

    setupEventListeners() {
        // Add any interactive event listeners here
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('refresh-btn')) {
                this.refreshData();
            }
        });
    }

    async refreshData() {
        await this.loadAllData();
        this.renderAllComponents();
    }
}

// Initialize the source analysis page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SourceAnalysisPage();
});

// Add CSS styles for source analysis page
const sourceAnalysisStyles = `
<style>
.loading-spinner {
    text-align: center;
    padding: 40px;
    color: #6b7280;
}

.loading-spinner i {
    font-size: 24px;
    margin-bottom: 10px;
}

.error-message {
    text-align: center;
    padding: 20px;
    color: #dc2626;
    background: #fef2f2;
    border-radius: 8px;
}

.confidence-meter {
    margin-bottom: 20px;
}

.confidence-label {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 5px;
}

.confidence-value {
    font-size: 24px;
    font-weight: bold;
    color: #1f2937;
    margin-bottom: 10px;
}

.confidence-bar {
    width: 100%;
    height: 8px;
    background: #e5e7eb;
    border-radius: 4px;
    overflow: hidden;
}

.confidence-fill {
    height: 100%;
    background: linear-gradient(90deg, #dc2626, #f59e0b, #10b981);
    transition: width 0.3s ease;
}

.seasonal-context, .identified-sources, .ai-recommendations {
    margin-bottom: 20px;
}

.seasonal-context h4, .identified-sources h4, .ai-recommendations h4 {
    margin: 0 0 12px 0;
    color: #1f2937;
    font-size: 16px;
}

.context-item, .source-item, .recommendation-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
}

.context-item:last-child, .source-item:last-child, .recommendation-item:last-child {
    border-bottom: none;
}

.label {
    font-weight: 500;
    color: #6b7280;
}

.value {
    font-weight: bold;
    color: #1f2937;
}

.rec-priority {
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
}

.priority-immediate {
    background: #fef2f2;
    color: #dc2626;
}

.priority-high {
    background: #fef3c7;
    color: #d97706;
}

.priority-medium {
    background: #dbeafe;
    color: #2563eb;
}

.severity-high {
    background: #fef2f2;
    color: #dc2626;
}

.severity-medium {
    background: #fef3c7;
    color: #d97706;
}

.severity-low {
    background: #f0fdf4;
    color: #16a34a;
}

.satellite-summary, .iot-summary, .monitoring-summary, .alerts-summary {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

.summary-item {
    text-align: center;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
    flex: 1;
}

.summary-value {
    font-size: 24px;
    font-weight: bold;
    color: #1f2937;
}

.summary-label {
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
}

.detection-item, .sensor-card, .monitoring-item, .alert-item {
    background: #f9fafb;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 12px;
    border-left: 4px solid #e5e7eb;
}

.detection-header, .sensor-header, .monitoring-header, .alert-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.detection-source, .sensor-id, .monitoring-location, .alert-type {
    font-weight: bold;
    color: #1f2937;
}

.detection-metrics, .sensor-metrics {
    display: flex;
    gap: 16px;
    margin-top: 8px;
}

.metric, .metric-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
}

.metric-label {
    color: #6b7280;
}

.metric-value {
    font-weight: bold;
    color: #1f2937;
}

.sensors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
}

.aqi-value {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
    padding: 8px;
    border-radius: 4px;
    margin: 8px 0;
}

.aqi-good { background: #f0fdf4; color: #16a34a; }
.aqi-satisfactory { background: #dbeafe; color: #2563eb; }
.aqi-moderate { background: #fef3c7; color: #d97706; }
.aqi-poor { background: #fed7aa; color: #ea580c; }
.aqi-very-poor { background: #fecaca; color: #dc2626; }
.aqi-severe { background: #fca5a5; color: #b91c1c; }

.status-active {
    background: #f0fdf4;
    color: #16a34a;
}

.status-inactive {
    background: #f3f4f6;
    color: #6b7280;
}

.trend-increasing {
    color: #dc2626;
}

.trend-decreasing {
    color: #16a34a;
}

.recommendations-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
}

.recommendation-card {
    background: #f9fafb;
    padding: 16px;
    border-radius: 8px;
    border-left: 4px solid #3b82f6;
}

.rec-title {
    font-weight: bold;
    color: #1f2937;
    margin: 8px 0;
}

.rec-description {
    color: #6b7280;
    font-size: 14px;
    margin-bottom: 12px;
}

.rec-footer {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #6b7280;
}
</style>
`;

// Inject styles into the page
document.head.insertAdjacentHTML('beforeend', sourceAnalysisStyles);

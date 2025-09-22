// Enhanced Charts for AirWatch AI
class EnhancedSourceChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chart = null;
        this.data = null;
        this.config = null;
    }

    async loadData() {
        try {
            const response = await fetch('/api/source-analysis/impact-distribution');
            const result = await response.json();
            this.data = result.sources;
            this.config = result.chart_config;
            this.colorScheme = result.color_scheme;
            this.summary = result.summary;
            return true;
        } catch (error) {
            console.error('Error loading chart data:', error);
            return false;
        }
    }

    async render() {
        if (!await this.loadData()) {
            this.showError();
            return;
        }

        this.container.innerHTML = `
            <div class="chart-header">
                <h3>Source Impact Distribution</h3>
                <div class="chart-controls">
                    <button class="btn-toggle" onclick="sourceChart.toggleView()">Toggle View</button>
                    <button class="btn-refresh" onclick="sourceChart.refresh()">Refresh</button>
                </div>
            </div>
            <div class="chart-container">
                <div class="chart-main">
                    <svg id="source-chart-svg" width="400" height="400"></svg>
                </div>
                <div class="chart-legend">
                    ${this.generateLegend()}
                </div>
            </div>
            <div class="chart-summary">
                ${this.generateSummary()}
            </div>
            <div class="chart-details" id="source-details">
                <h4>Click on a segment for detailed information</h4>
            </div>
        `;

        this.createDonutChart();
        this.addInteractivity();
    }

    generateLegend() {
        return this.data.map(source => `
            <div class="legend-item" data-source="${source.name}">
                <div class="legend-color" style="background-color: ${source.color}"></div>
                <div class="legend-info">
                    <div class="legend-name">${source.name}</div>
                    <div class="legend-value">${source.percentage}%</div>
                    <div class="legend-impact">Impact: ${source.impact_level}</div>
                    <div class="legend-confidence">Confidence: ${source.confidence}%</div>
                </div>
                <div class="legend-trend trend-${source.trend.direction}">
                    <i class="fas fa-arrow-${source.trend.direction === 'increasing' ? 'up' : 
                        source.trend.direction === 'decreasing' ? 'down' : 'right'}"></i>
                    ${source.trend.rate > 0 ? '+' : ''}${source.trend.rate}%
                </div>
            </div>
        `).join('');
    }

    generateSummary() {
        return `
            <div class="summary-stats">
                <div class="stat-item">
                    <div class="stat-value">${this.summary.total_sources}</div>
                    <div class="stat-label">Total Sources</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.summary.dominant_source}</div>
                    <div class="stat-label">Dominant Source</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.summary.average_confidence}%</div>
                    <div class="stat-label">Avg Confidence</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${this.summary.high_impact_sources}</div>
                    <div class="stat-label">High Impact</div>
                </div>
            </div>
        `;
    }

    createDonutChart() {
        const svg = d3.select('#source-chart-svg');
        svg.selectAll('*').remove();

        const width = 400;
        const height = 400;
        const radius = Math.min(width, height) / 2 - 20;
        const innerRadius = radius * 0.6;

        const g = svg.append('g')
            .attr('transform', `translate(${width/2}, ${height/2})`);

        const pie = d3.pie()
            .value(d => d.value)
            .sort(null)
            .padAngle(0.02);

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(radius);

        const labelArc = d3.arc()
            .innerRadius(radius + 10)
            .outerRadius(radius + 10);

        const arcs = g.selectAll('.arc')
            .data(pie(this.data))
            .enter().append('g')
            .attr('class', 'arc');

        // Add segments with animation
        arcs.append('path')
            .attr('d', arc)
            .attr('fill', d => d.data.color)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('class', 'chart-segment')
            .style('cursor', 'pointer')
            .on('mouseover', this.handleMouseOver.bind(this))
            .on('mouseout', this.handleMouseOut.bind(this))
            .on('click', this.handleClick.bind(this))
            .transition()
            .duration(this.config.animation_duration)
            .attrTween('d', function(d) {
                const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
                return function(t) {
                    return arc(interpolate(t));
                };
            });

        // Add labels
        arcs.append('text')
            .attr('transform', d => `translate(${labelArc.centroid(d)})`)
            .attr('text-anchor', 'middle')
            .attr('class', 'chart-label')
            .style('font-size', '12px')
            .style('font-weight', 'bold')
            .style('fill', '#333')
            .text(d => d.data.percentage > 5 ? `${d.data.percentage}%` : '');

        // Add center text
        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('class', 'center-text')
            .style('font-size', '16px')
            .style('font-weight', 'bold')
            .style('fill', '#333')
            .text('Impact Distribution');

        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1.2em')
            .attr('class', 'center-subtext')
            .style('font-size', '12px')
            .style('fill', '#666')
            .text(`${this.summary.total_contribution}% Total`);
    }

    handleMouseOver(event, d) {
        d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr('stroke-width', 4)
            .attr('opacity', 0.8);

        // Show tooltip
        this.showTooltip(event, d);
    }

    handleMouseOut(event, d) {
        d3.select(event.currentTarget)
            .transition()
            .duration(200)
            .attr('stroke-width', 2)
            .attr('opacity', 1);

        this.hideTooltip();
    }

    async handleClick(event, d) {
        const detailsContainer = document.getElementById('source-details');
        detailsContainer.innerHTML = '<div class="loading">Loading details...</div>';

        try {
            const response = await fetch(`/api/source-analysis/source-details/${d.data.name}`);
            const details = await response.json();
            this.showSourceDetails(details);
        } catch (error) {
            console.error('Error loading source details:', error);
            detailsContainer.innerHTML = '<div class="error">Error loading details</div>';
        }
    }

    showTooltip(event, d) {
        const tooltip = d3.select('body').selectAll('.chart-tooltip')
            .data([d]);

        const tooltipEnter = tooltip.enter()
            .append('div')
            .attr('class', 'chart-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', 'white')
            .style('padding', '10px')
            .style('border-radius', '5px')
            .style('pointer-events', 'none')
            .style('z-index', '1000');

        tooltip.merge(tooltipEnter)
            .html(`
                <div><strong>${d.data.name}</strong></div>
                <div>Contribution: ${d.data.percentage}%</div>
                <div>Impact Level: ${d.data.impact_level}</div>
                <div>Confidence: ${d.data.confidence}%</div>
                <div>Health Impact: ${d.data.health_impact}</div>
                <div>Priority Score: ${d.data.priority_score}</div>
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
    }

    hideTooltip() {
        d3.selectAll('.chart-tooltip').remove();
    }

    showSourceDetails(details) {
        const container = document.getElementById('source-details');
        container.innerHTML = `
            <div class="source-details-content">
                <h4>${details.name} - Detailed Analysis</h4>
                <div class="details-grid">
                    <div class="detail-section">
                        <h5>Basic Information</h5>
                        <div class="detail-item">
                            <span class="label">Location:</span>
                            <span class="value">${details.location}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Contribution:</span>
                            <span class="value">${details.contribution}%</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Impact Level:</span>
                            <span class="value impact-${details.impact_level.toLowerCase()}">${details.impact_level}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Confidence:</span>
                            <span class="value">${details.confidence * 100}%</span>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>Pollutants</h5>
                        <div class="pollutants-list">
                            ${details.pollutants.map(p => `<span class="pollutant-tag">${p.trim()}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>Trend Analysis</h5>
                        <div class="trend-info">
                            <div class="trend-direction trend-${details.trend_analysis.direction}">
                                <i class="fas fa-arrow-${details.trend_analysis.direction === 'increasing' ? 'up' : 
                                    details.trend_analysis.direction === 'decreasing' ? 'down' : 'right'}"></i>
                                ${details.trend_analysis.direction} (${details.trend_analysis.rate > 0 ? '+' : ''}${details.trend_analysis.rate}%)
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>Recommendations</h5>
                        <ul class="recommendations-list">
                            ${details.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="detail-section">
                        <h5>Monitoring Data</h5>
                        <div class="monitoring-info">
                            <div class="monitoring-item">
                                <span class="label">IoT Sensors:</span>
                                <span class="value">${details.monitoring_data.iot_sensors}</span>
                            </div>
                            <div class="monitoring-item">
                                <span class="label">Satellite Coverage:</span>
                                <span class="value">${details.monitoring_data.satellite_coverage}</span>
                            </div>
                            <div class="monitoring-item">
                                <span class="label">Monitoring Frequency:</span>
                                <span class="value">${details.monitoring_data.monitoring_frequency}</span>
                            </div>
                            <div class="monitoring-item">
                                <span class="label">Data Quality:</span>
                                <span class="value quality-${details.monitoring_data.data_quality.toLowerCase()}">${details.monitoring_data.data_quality}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="detail-section">
                        <h5>Seasonal Patterns</h5>
                        <div class="seasonal-info">
                            <div class="seasonal-item">
                                <span class="label">Peak Months:</span>
                                <span class="value">${details.seasonal_patterns.peak_months.join(', ')}</span>
                            </div>
                            <div class="seasonal-item">
                                <span class="label">Low Months:</span>
                                <span class="value">${details.seasonal_patterns.low_months.join(', ')}</span>
                            </div>
                            <div class="seasonal-item">
                                <span class="label">Variation:</span>
                                <span class="value">${details.seasonal_patterns.variation}</span>
                            </div>
                            <div class="seasonal-item">
                                <span class="label">Peak Reason:</span>
                                <span class="value">${details.seasonal_patterns.peak_reason}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    toggleView() {
        // Toggle between donut and bar chart
        console.log('Toggle view functionality');
    }

    refresh() {
        this.render();
    }

    showError() {
        this.container.innerHTML = `
            <div class="chart-error">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Unable to load chart data</h3>
                <p>Please check your connection and try again.</p>
                <button onclick="sourceChart.render()">Retry</button>
            </div>
        `;
    }

    addInteractivity() {
        // Add click handlers to legend items
        document.querySelectorAll('.legend-item').forEach(item => {
            item.addEventListener('click', () => {
                const sourceName = item.dataset.source;
                const sourceData = this.data.find(s => s.name === sourceName);
                if (sourceData) {
                    this.handleClick({ currentTarget: null }, sourceData);
                }
            });
        });
    }
}

// Initialize the enhanced chart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('sourceChart')) {
        window.sourceChart = new EnhancedSourceChart('sourceChart');
        sourceChart.render();
    }
});

// Add CSS styles for enhanced chart
const chartStyles = `
<style>
.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.chart-controls {
    display: flex;
    gap: 10px;
}

.btn-toggle, .btn-refresh {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #3b82f6;
    color: white;
    cursor: pointer;
    font-size: 14px;
}

.btn-toggle:hover, .btn-refresh:hover {
    background: #2563eb;
}

.chart-container {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

.chart-main {
    flex: 1;
}

.chart-legend {
    width: 300px;
    max-height: 400px;
    overflow-y: auto;
}

.legend-item {
    display: flex;
    align-items: center;
    padding: 8px;
    margin-bottom: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.legend-item:hover {
    background-color: #f3f4f6;
}

.legend-color {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin-right: 12px;
}

.legend-info {
    flex: 1;
}

.legend-name {
    font-weight: bold;
    font-size: 14px;
}

.legend-value {
    font-size: 16px;
    font-weight: bold;
    color: #1f2937;
}

.legend-impact {
    font-size: 12px;
    color: #6b7280;
}

.legend-confidence {
    font-size: 12px;
    color: #6b7280;
}

.legend-trend {
    font-size: 12px;
    font-weight: bold;
}

.trend-increasing {
    color: #dc2626;
}

.trend-decreasing {
    color: #16a34a;
}

.trend-stable {
    color: #6b7280;
}

.trend-seasonal {
    color: #7c3aed;
}

.chart-summary {
    margin-bottom: 20px;
}

.summary-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
}

.stat-item {
    text-align: center;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
    color: #1f2937;
}

.stat-label {
    font-size: 12px;
    color: #6b7280;
    margin-top: 4px;
}

.chart-segment {
    transition: all 0.2s ease;
}

.chart-label {
    pointer-events: none;
}

.source-details-content {
    background: #f9fafb;
    padding: 20px;
    border-radius: 8px;
    margin-top: 20px;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 16px;
}

.detail-section h5 {
    margin: 0 0 12px 0;
    color: #1f2937;
    font-size: 16px;
}

.detail-item, .monitoring-item, .seasonal-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
    border-bottom: 1px solid #e5e7eb;
}

.detail-item:last-child, .monitoring-item:last-child, .seasonal-item:last-child {
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

.impact-high {
    color: #dc2626;
}

.impact-medium {
    color: #d97706;
}

.impact-low {
    color: #16a34a;
}

.quality-high {
    color: #16a34a;
}

.quality-medium {
    color: #d97706;
}

.pollutants-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.pollutant-tag {
    background: #e5e7eb;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    color: #374151;
}

.recommendations-list {
    margin: 0;
    padding-left: 20px;
}

.recommendations-list li {
    margin-bottom: 8px;
    color: #374151;
}

.chart-error {
    text-align: center;
    padding: 40px;
    color: #6b7280;
}

.chart-error i {
    font-size: 48px;
    color: #fbbf24;
    margin-bottom: 16px;
}

.loading {
    text-align: center;
    padding: 20px;
    color: #6b7280;
}

.error {
    text-align: center;
    padding: 20px;
    color: #dc2626;
}
</style>
`;

// Inject styles into the page
document.head.insertAdjacentHTML('beforeend', chartStyles);

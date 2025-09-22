// Main application functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('AirWatch AI application loaded');
    
    // Initialize any global functionality here
    initializeRealTimeUpdates();
    
    // Load data when page loads
    loadInitialData();
});

// Load initial data for the current page
async function loadInitialData() {
    const activePage = document.querySelector('.page-section.active');
    if (!activePage) return;
    
    const pageId = activePage.id;
    
    try {
        switch(pageId) {
            case 'overview':
                await loadOverviewData();
                break;
            case 'source':
                await loadSourceAnalysisData();
                break;
            case 'forecast':
                await loadForecastingData();
                break;
            case 'citizen':
                await loadCitizenPortalData();
                break;
            case 'policy':
                await loadPolicyDashboardData();
                break;
        }
    } catch (error) {
        console.error('Error loading data:', error);
        showError('Failed to load data. Please check if the server is running.');
    }
}

// Load overview page data
async function loadOverviewData() {
    try {
        const [currentAQI, stationData, sourceBreakdown] = await Promise.all([
            AirWatchAPI.getCurrentAQI(),
            AirWatchAPI.getStationData(),
            AirWatchAPI.getSourceBreakdown()
        ]);
        
        updateOverviewUI(currentAQI, stationData, sourceBreakdown);
    } catch (error) {
        console.error('Error loading overview data:', error);
        showError('Failed to load overview data. Please check if the server is running.');
    }
}

// Render impact distribution chart
async function renderImpactDistributionChart() {
    try {
        const response = await fetch('http://localhost:5000/api/source-analysis/impact-distribution');
        const impactData = await response.json();
        
        const container = document.getElementById('impactChart');
        if (!container) return;
        
        // Clear previous content
        container.innerHTML = '';
        
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 400 300');
        
        // Create group for chart
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', 'translate(200, 150)');
        
        // Calculate total
        const total = impactData.reduce((sum, item) => sum + item.value, 0);
        
        // Draw pie chart
        let currentAngle = 0;
        impactData.forEach(item => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            const innerRadius = 60;
            const outerRadius = 100;
            
            const x0 = innerRadius * Math.sin(currentAngle);
            const y0 = -innerRadius * Math.cos(currentAngle);
            const x1 = outerRadius * Math.sin(currentAngle);
            const y1 = -outerRadius * Math.cos(currentAngle);
            const x2 = outerRadius * Math.sin(currentAngle + sliceAngle);
            const y2 = -outerRadius * Math.cos(currentAngle + sliceAngle);
            const x3 = innerRadius * Math.sin(currentAngle + sliceAngle);
            const y3 = -innerRadius * Math.cos(currentAngle + sliceAngle);
            
            const largeArc = sliceAngle > Math.PI ? 1 : 0;
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M ${x0} ${y0} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x0} ${y0} Z`);
            path.setAttribute('fill', getSourceColor(item.name));
            path.setAttribute('stroke', 'white');
            path.setAttribute('stroke-width', '2');
            
            g.appendChild(path);
            currentAngle += sliceAngle;
        });
        
        // Add center text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dy', '0.35em');
        text.setAttribute('font-size', '14');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', '#374151');
        text.textContent = 'Impact Distribution';
        g.appendChild(text);
        
        svg.appendChild(g);
        container.appendChild(svg);
        
        // Add legend
        const legend = document.createElement('div');
        legend.className = 'flex flex-wrap justify-center mt-4 gap-4';
        
        impactData.forEach(item => {
            const legendItem = document.createElement('div');
            legendItem.className = 'flex items-center text-sm';
            
            const colorBox = document.createElement('div');
            colorBox.className = 'w-4 h-4 rounded mr-2';
            colorBox.style.backgroundColor = getSourceColor(item.name);
            
            const text = document.createElement('span');
            text.innerHTML = `<span class="font-medium">${item.name}</span>: ${item.value}% (${item.impact} Impact)`;
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(text);
            legend.appendChild(legendItem);
        });
        
        container.appendChild(legend);
        
    } catch (error) {
        console.error('Error loading impact distribution data:', error);
    }
}

// Render trend chart
async function renderTrendChart() {
    try {
        const response = await fetch('http://localhost:5000/api/overview/trend-data');
        const trendData = await response.json();
        
        const container = document.getElementById('trendChart');
        if (!container) return;
        
        // Clear previous content
        container.innerHTML = '';
        
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 800 300');
        
        // Calculate dimensions
        const margin = { top: 20, right: 30, bottom: 30, left: 40 };
        const width = 800 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;
        
        // Create group for chart
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
        
        // Find min and max values
        const aqiValues = trendData.map(d => d.aqi);
        const minAqi = Math.min(...aqiValues);
        const maxAqi = Math.max(...aqiValues);
        
        // Create scales
        const xScale = width / (trendData.length - 1);
        const yScale = height / (maxAqi - minAqi);
        
        // Draw grid lines
        for (let i = 0; i <= 5; i++) {
            const y = height - (i * height / 5);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#e5e7eb');
            line.setAttribute('stroke-width', '1');
            g.appendChild(line);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', -5);
            text.setAttribute('y', y);
            text.setAttribute('text-anchor', 'end');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('font-size', '10');
            text.setAttribute('fill', '#6b7280');
            text.textContent = Math.round(minAqi + (maxAqi - minAqi) * (1 - i / 5));
            g.appendChild(text);
        }
        
        // Draw trend line
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        let pathData = '';
        
        trendData.forEach((point, i) => {
            const x = i * xScale;
            const y = height - (point.aqi - minAqi) * yScale;
            
            if (i === 0) {
                pathData += `M ${x} ${y} `;
            } else {
                pathData += `L ${x} ${y} `;
            }
            
            // Add point
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', 4);
            circle.setAttribute('fill', point.type === 'actual' ? '#3b82f6' : '#8b5cf6');
            circle.setAttribute('stroke', 'white');
            circle.setAttribute('stroke-width', '2');
            g.appendChild(circle);
            
            // Add date label
            if (i % 2 === 0) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x);
                text.setAttribute('y', height + 15);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', '10');
                text.setAttribute('fill', '#6b7280');
                text.textContent = point.date.split('-')[2] + ' Oct';
                g.appendChild(text);
            }
        });
        
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', '#3b82f6');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-dasharray', trendData[trendData.length - 1].type === 'forecast' ? '5,5' : '0');
        g.appendChild(path);
        
        svg.appendChild(g);
        container.appendChild(svg);
        
    } catch (error) {
        console.error('Error loading trend data:', error);
    }
}

// Render 48-hour forecast chart
async function render48HourForecastChart() {
    try {
        const response = await fetch('http://localhost:5000/api/forecasting/48hour-forecast');
        const forecastData = await response.json();
        
        const container = document.getElementById('forecastChart');
        if (!container) return;
        
        // Clear previous content
        container.innerHTML = '';
        
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 800 300');
        
        // Calculate dimensions
        const margin = { top: 20, right: 30, bottom: 50, left: 40 };
        const width = 800 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;
        
        // Create group for chart
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
        
        // Find min and max values
        const aqiValues = forecastData.map(d => d.aqi);
        const minAqi = Math.min(...aqiValues);
        const maxAqi = Math.max(...aqiValues);
        
        // Create scales
        const xScale = width / (forecastData.length - 1);
        const yScale = height / (maxAqi - minAqi);
        
        // Draw grid lines
        for (let i = 0; i <= 5; i++) {
            const y = height - (i * height / 5);
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', 0);
            line.setAttribute('y1', y);
            line.setAttribute('x2', width);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#e5e7eb');
            line.setAttribute('stroke-width', '1');
            g.appendChild(line);
            
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', -5);
            text.setAttribute('y', y);
            text.setAttribute('text-anchor', 'end');
            text.setAttribute('dominant-baseline', 'middle');
            text.setAttribute('font-size', '10');
            text.setAttribute('fill', '#6b7280');
            text.textContent = Math.round(minAqi + (maxAqi - minAqi) * (1 - i / 5));
            g.appendChild(text);
        }
        
        // Draw area and line
        const areaPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const linePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        let areaData = '';
        let lineData = '';
        
        forecastData.forEach((point, i) => {
            const x = i * xScale;
            const y = height - (point.aqi - minAqi) * yScale;
            
            if (i === 0) {
                areaData = `M ${x} ${height} L ${x} ${y} `;
                lineData = `M ${x} ${y} `;
            } else {
                areaData += `L ${x} ${y} `;
                lineData += `L ${x} ${y} `;
            }
            
            // Add hour labels for every 6 hours
            if (i % 6 === 0) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x);
                text.setAttribute('y', height + 15);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', '10');
                text.setAttribute('fill', '#6b7280');
                text.textContent = point.hour;
                g.appendChild(text);
            }
        });
        
        // Complete area path
        areaData += `L ${width} ${height} Z`;
        
        // Set path attributes
        areaPath.setAttribute('d', areaData);
        areaPath.setAttribute('fill', 'url(#areaGradient)');
        areaPath.setAttribute('opacity', '0.3');
        
        linePath.setAttribute('d', lineData);
        linePath.setAttribute('fill', 'none');
        linePath.setAttribute('stroke', '#3b82f6');
        linePath.setAttribute('stroke-width', '2');
        
        // Add gradient definition
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'areaGradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '0%');
        gradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#3b82f6');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#3b82f6');
        stop2.setAttribute('stop-opacity', '0');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.appendChild(defs);
        
        g.appendChild(areaPath);
        g.appendChild(linePath);
        
        // Add title
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.setAttribute('x', width / 2);
        title.setAttribute('y', -5);
        title.setAttribute('text-anchor', 'middle');
        title.setAttribute('font-size', '12');
        title.setAttribute('font-weight', 'bold');
        title.setAttribute('fill', '#374151');
        title.textContent = '48-Hour AQI Forecast';
        g.appendChild(title);
        
        svg.appendChild(g);
        container.appendChild(svg);
        
    } catch (error) {
        console.error('Error loading 48-hour forecast data:', error);
    }
}

// Update overview UI with data
function updateOverviewUI(currentAQI, stationData, sourceBreakdown) {
    // Update AQI banner
    const aqiElement = document.querySelector('.aqi-number');
    const categoryElement = document.querySelector('.badge.bg-red-500');
    const advisoryElement = document.querySelector('.flex.items-center.justify-center.gap-2.text-red-600.mt-4 span');
    
    if (aqiElement) aqiElement.textContent = `Current Region AQI: ${currentAQI.current_aqi}`;
    if (categoryElement) categoryElement.textContent = currentAQI.category;
    if (advisoryElement) advisoryElement.textContent = `Health Advisory: ${currentAQI.health_advisory}`;
    
    // Update live metrics
    updateLiveMetrics();
    
    // Update station data
    updateStationList(stationData);
    
    // Update source breakdown
    updateSourceBreakdown(sourceBreakdown);

    //Render source distribution chart
    renderSourceDistributionChart(sourceBreakdown);

    // Render trend chart
    renderTrendChart();
}

// Update live metrics (mock data for now)
function updateLiveMetrics() {
    const metrics = [
        { value: "112.5", unit: "µg/m³", title: "PM2.5" },
        { value: "195.3", unit: "µg/m³", title: "PM10" },
        { value: "28.7", unit: "°C", title: "Temperature" },
        { value: "42", unit: "%", title: "Humidity" },
        { value: "8.3", unit: "km/h", title: "Wind Speed" }
    ];
    
    const metricElements = document.querySelectorAll('.metric-card');
    metricElements.forEach((card, index) => {
        if (metrics[index]) {
            const valueElement = card.querySelector('.metric-value');
            const unitElement = card.querySelector('.metric-unit');
            const titleElement = card.querySelector('.metric-title');
            
            if (valueElement) valueElement.textContent = metrics[index].value;
            if (unitElement) unitElement.textContent = metrics[index].unit;
            if (titleElement) titleElement.textContent = metrics[index].title;
        }
    });
}

// Update station list
function updateStationList(stationData) {
    const container = document.getElementById('station-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    stationData.forEach(station => {
        const colorClass = getAQIColorClass(station.aqi);
        const badgeClass = getAQIBadgeClass(station.aqi);
        
        const stationElement = document.createElement('div');
        stationElement.className = 'flex items-center justify-between p-3 rounded-lg bg-white/50';
        stationElement.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-4 h-4 rounded-full ${colorClass}"></div>
                <div>
                    <p class="font-medium">${station.name}</p>
                    <p class="text-xs text-gray-500">Primary: ${station.primary_source}</p>
                </div>
            </div>
            <div class="badge ${badgeClass}">${station.aqi}</div>
        `;
        
        container.appendChild(stationElement);
    });
}

// Update source breakdown
function updateSourceBreakdown(sourceBreakdown) {
    const container = document.getElementById('source-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    sourceBreakdown.forEach(source => {
        const colorClass = getSourceColorClass(source.name);
        
        const sourceElement = document.createElement('div');
        sourceElement.className = 'flex items-center justify-between p-3 rounded-lg bg-white/50';
        sourceElement.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full ${colorClass.background} flex items-center justify-center">
                    <i class="fas ${getSourceIcon(source.name)} ${colorClass.text}"></i>
                </div>
                <div>
                    <p class="font-medium">${source.name}</p>
                    <p class="text-sm text-gray-500">${source.readings} readings</p>
                </div>
            </div>
            <div class="font-bold ${colorClass.text}">${source.value}%</div>
        `;
        
        container.appendChild(sourceElement);
    });
}

// Load source analysis data
async function loadSourceAnalysisData() {
    try {
        const [sources, detections, monitoringData] = await Promise.all([
            AirWatchAPI.getPollutionSources(),
            AirWatchAPI.getSourceDetections(),
            AirWatchAPI.getMonitoringData()
        ]);
        
        updateSourceAnalysisUI(sources, detections, monitoringData);
    } catch (error) {
        console.error('Error loading source analysis data:', error);
        showError('Failed to load source analysis data. Please check if the server is running.');
    }
}

// Update source analysis UI
function updateSourceAnalysisUI(sources, detections, monitoringData) {
    // Update sources grid
    updateSourcesGrid(sources);
    
    // Update detections list
    updateDetectionsList(detections);
    
    // Update monitoring table
    updateMonitoringTable(monitoringData);

    // Render impact distribution chart
    renderImpactDistributionChart();
}

// Update sources grid
function updateSourcesGrid(sources) {
    const container = document.getElementById('sources-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    sources.forEach(source => {
        const impactClass = source.impact === 'High' ? 'bg-red-500' : 'bg-orange-500';
        
        const sourceElement = document.createElement('div');
        sourceElement.className = 'card';
        sourceElement.innerHTML = `
            <div class="card-content text-center">
                <div class="metric-icon bg-red-50 mx-auto mb-4">
                    <i class="fas ${getSourceIcon(source.type)} text-red-600"></i>
                </div>
                <h3 class="font-bold text-xl mb-2">${source.type}</h3>
                <div class="badge ${impactClass} mb-3">${source.impact} Impact</div>
                <p class="text-sm text-gray-600">${source.description}</p>
            </div>
        `;
        
        container.appendChild(sourceElement);
    });
}

// Update detections list
function updateDetectionsList(detections) {
    const container = document.getElementById('detections-list');
    if (!container) return;
    
    container.innerHTML = '';
    
    detections.forEach(detection => {
        const severityClass = getSeverityClass(detection.severity);
        
        const detectionElement = document.createElement('div');
        detectionElement.className = `p-4 rounded-lg ${severityClass.background} border ${severityClass.border}`;
        detectionElement.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold ${severityClass.text}">${detection.type}</h4>
                <span class="badge ${severityClass.badge}">${detection.severity}</span>
            </div>
            <p class="text-sm ${severityClass.text} mb-2">${detection.location} - ${detection.description}</p>
            <div class="text-xs ${severityClass.text}">
                <i class="fas fa-clock mr-1"></i>
                Detected ${formatRelativeTime(detection.timestamp)} • Confidence: ${detection.confidence}%
            </div>
        `;
        
        container.appendChild(detectionElement);
    });
}

// Update monitoring table
function updateMonitoringTable(monitoringData) {
    const tbody = document.querySelector('#monitoring-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    monitoringData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.location}</td>
            <td>${item.primary_source}</td>
            <td>${item.pollutant}</td>
            <td class="font-bold ${getLevelColorClass(item.level, item.pollutant)}">${item.level} ${item.unit}</td>
            <td><i class="fas ${getTrendIcon(item.trend)} ${getTrendColorClass(item.trend)}"></i> ${item.trend}</td>
            <td><span class="badge ${getStatusBadgeClass(item.status)}">${item.status}</span></td>
            <td>${formatRelativeTime(item.last_updated)}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Load forecasting data
async function loadForecastingData() {
    try {
        const [metrics, weatherImpact, weeklyForecast] = await Promise.all([
            AirWatchAPI.getForecastMetrics(),
            AirWatchAPI.getWeatherImpact(),
            AirWatchAPI.getWeeklyForecast()
        ]);
        
        updateForecastingUI(metrics, weatherImpact, weeklyForecast);
    } catch (error) {
        console.error('Error loading forecasting data:', error);
        showError('Failed to load forecasting data. Please check if the server is running.');
    }
}
// Render policy effectiveness chart
async function renderPolicyEffectivenessChart() {
    try {
        const response = await fetch('http://localhost:5000/api/policy-dashboard/effectiveness-data');
        const effectivenessData = await response.json();
        
        const container = document.getElementById('policyChart');
        if (!container) return;
        
        // Clear previous content
        container.innerHTML = '';
        
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        svg.setAttribute('viewBox', '0 0 600 300');
        
        // Calculate dimensions
        const margin = { top: 20, right: 30, bottom: 50, left: 100 };
        const width = 600 - margin.left - margin.right;
        const height = 300 - margin.top - margin.bottom;
        
        // Create group for chart
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
        
        // Draw grid lines
        for (let i = 0; i <= 10; i++) {
            const x = i * width / 10;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x);
            line.setAttribute('y1', 0);
            line.setAttribute('x2', x);
            line.setAttribute('y2', height);
            line.setAttribute('stroke', '#e5e7eb');
            line.setAttribute('stroke-width', '1');
            g.appendChild(line);
            
            if (i > 0) {
                const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                text.setAttribute('x', x);
                text.setAttribute('y', height + 15);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('font-size', '10');
                text.setAttribute('fill', '#6b7280');
                text.textContent = i;
                g.appendChild(text);
            }
        }
        
        // Draw bars
        const barHeight = height / effectivenessData.length;
        const maxEffectiveness = Math.max(...effectivenessData.map(d => d.effectiveness));
        
        effectivenessData.forEach((policy, i) => {
            const y = i * barHeight + barHeight / 2;
            const barWidth = (policy.effectiveness / maxEffectiveness) * width;
            
            // Draw bar
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', 0);
            rect.setAttribute('y', y - barHeight / 3);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight / 1.5);
            rect.setAttribute('fill', '#3b82f6');
            rect.setAttribute('rx', 3);
            g.appendChild(rect);
            
            // Draw policy name
            const nameText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            nameText.setAttribute('x', -5);
            nameText.setAttribute('y', y);
            nameText.setAttribute('text-anchor', 'end');
            nameText.setAttribute('dominant-baseline', 'middle');
            nameText.setAttribute('font-size', '10');
            nameText.setAttribute('fill', '#374151');
            nameText.textContent = policy.name.length > 20 ? policy.name.substring(0, 20) + '...' : policy.name;
            g.appendChild(nameText);
            
            // Draw effectiveness value
            const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            valueText.setAttribute('x', barWidth + 5);
            valueText.setAttribute('y', y);
            valueText.setAttribute('dominant-baseline', 'middle');
            valueText.setAttribute('font-size', '10');
            valueText.setAttribute('fill', '#374151');
            valueText.setAttribute('font-weight', 'bold');
            valueText.textContent = policy.effectiveness.toFixed(1);
            g.appendChild(valueText);
        });
        
        // Add title and labels
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.setAttribute('x', width / 2);
        title.setAttribute('y', -5);
        title.setAttribute('text-anchor', 'middle');
        title.setAttribute('font-size', '12');
        title.setAttribute('font-weight', 'bold');
        title.setAttribute('fill', '#374151');
        title.textContent = 'Policy Effectiveness (0-10 scale)';
        g.appendChild(title);
        
        const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabel.setAttribute('x', width / 2);
        xLabel.setAttribute('y', height + 35);
        xLabel.setAttribute('text-anchor', 'middle');
        xLabel.setAttribute('font-size', '11');
        xLabel.setAttribute('fill', '#6b7280');
        xLabel.textContent = 'Effectiveness Score';
        g.appendChild(xLabel);
        
        svg.appendChild(g);
        container.appendChild(svg);
        
    } catch (error) {
        console.error('Error loading policy effectiveness data:', error);
    }
}
// Update forecasting UI
function updateForecastingUI(metrics, weatherImpact, weeklyForecast) {
    // Update forecast metrics
    updateForecastMetrics(metrics);
    
    // Update weather impact
    updateWeatherImpact(weatherImpact);
    
    // Update weekly forecast
    updateWeeklyForecast(weeklyForecast);

    // Render 48-hour forecast chart
    render48HourForecastChart();
}

// Update forecast metrics
function updateForecastMetrics(metrics) {
    const container = document.getElementById('forecast-metrics');
    if (!container) return;
    
    container.innerHTML = '';
    
    metrics.forEach(metric => {
        const metricElement = document.createElement('div');
        metricElement.className = 'card';
        metricElement.innerHTML = `
            <div class="card-content text-center">
                <div class="metric-icon bg-blue-50 mx-auto mb-3">
                    <i class="fas fa-${metric.icon} text-blue-600"></i>
                </div>
                <div class="metric-value text-blue-600">${metric.duration}</div>
                <div class="metric-title">${metric.type}</div>
                ${metric.accuracy ? `<div class="badge bg-blue-500 mt-2">${metric.accuracy}% Accuracy</div>` : ''}
                ${metric.version ? `<div class="badge bg-orange-500 mt-2">${metric.version}</div>` : ''}
            </div>
        `;
        
        container.appendChild(metricElement);
    });
}

// Update weather impact
function updateWeatherImpact(weatherImpact) {
    const container = document.getElementById('weather-impact');
    if (!container) return;
    
    container.innerHTML = '';
    
    weatherImpact.forEach(impact => {
        const impactClass = getImpactClass(impact.impact);
        
        const impactElement = document.createElement('div');
        impactElement.className = `flex items-center justify-between p-3 rounded-lg ${impactClass.background}`;
        impactElement.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="fas ${getWeatherIcon(impact.factor)} ${impactClass.text}"></i>
                <div>
                    <p class="font-medium">${impact.factor}</p>
                    <p class="text-sm text-gray-600">${impact.current_value}</p>
                </div>
            </div>
            <div class="${impactClass.text} font-bold">${impact.impact}</div>
        `;
        
        container.appendChild(impactElement);
    });
}

// Update weekly forecast
function updateWeeklyForecast(weeklyForecast) {
    const tbody = document.querySelector('#weekly-forecast-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    weeklyForecast.forEach(forecast => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(forecast.date)}</td>
            <td class="font-bold ${getAQITextColorClass(forecast.aqi)}">${forecast.aqi}</td>
            <td><span class="badge ${forecast.badge_class}">${forecast.category}</span></td>
            <td>${forecast.primary_pollutant}</td>
            <td>${forecast.weather_impact}</td>
            <td>${forecast.confidence}%</td>
            <td>${forecast.health_advisory}</td>
        `;
        
        tbody.appendChild(row);
    });
}

// Load citizen portal data
async function loadCitizenPortalData() {
    try {
        const [reports, alerts, initiatives] = await Promise.all([
            AirWatchAPI.getCitizenReports(),
            AirWatchAPI.getCommunityAlerts(),
            AirWatchAPI.getCommunityInitiatives()
        ]);
        
        updateCitizenPortalUI(reports, alerts, initiatives);
    } catch (error) {
        console.error('Error loading citizen portal data:', error);
        showError('Failed to load citizen portal data. Please check if the server is running.');
    }
}

// Update citizen portal UI
function updateCitizenPortalUI(reports, alerts, initiatives) {
    // Update citizen reports
    updateCitizenReports(reports);
    
    // Update community alerts
    updateCommunityAlerts(alerts);
    
    // Update community initiatives
    updateCommunityInitiatives(initiatives);
}

// Update citizen reports
function updateCitizenReports(reports) {
    const container = document.getElementById('citizen-reports');
    if (!container) return;
    
    container.innerHTML = '';
    
    reports.forEach(report => {
        const statusClass = getReportStatusClass(report.status);
        
        const reportElement = document.createElement('div');
        reportElement.className = `p-4 rounded-lg ${statusClass.background} border ${statusClass.border}`;
        reportElement.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <h4 class="font-semibold ${statusClass.text}">${report.title}</h4>
                <span class="badge ${statusClass.badge}">${report.status}</span>
            </div>
            <p class="text-sm ${statusClass.text} mb-2">${report.description}</p>
            <div class="text-xs ${statusClass.text}">
                <i class="fas fa-user mr-1"></i>${report.reporter} • <i class="fas fa-clock mr-1"></i>${formatRelativeTime(report.timestamp)}
            </div>
        `;
        
        container.appendChild(reportElement);
    });
}

// Update community alerts
function updateCommunityAlerts(alerts) {
    const container = document.getElementById('community-alerts');
    if (!container) return;
    
    container.innerHTML = '';
    
    alerts.forEach(alert => {
        const severityClass = getSeverityClass(alert.severity);
        
        const alertElement = document.createElement('div');
        alertElement.className = `alert-item ${severityClass.alert}`;
        alertElement.innerHTML = `
            <div class="flex items-start gap-3">
                <i class="fas fa-exclamation-triangle ${severityClass.text} mt-1"></i>
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-semibold">${alert.title}</h4>
                        <span class="badge ${severityClass.badge}">${alert.severity}</span>
                    </div>
                    <p class="text-sm mb-2">${alert.description}</p>
                    <p class="text-xs opacity-75">Issued: ${formatDateTime(alert.issued)} • Expires: ${formatDateTime(alert.expires)}</p>
                </div>
            </div>
        `;
        
        container.appendChild(alertElement);
    });
}

// Update community initiatives
function updateCommunityInitiatives(initiatives) {
    const container = document.getElementById('community-initiatives');
    if (!container) return;
    
    container.innerHTML = '';
    
    initiatives.forEach(initiative => {
        const initiativeClass = getInitiativeClass(initiative.icon);
        
        const initiativeElement = document.createElement('div');
        initiativeElement.className = 'text-center p-4 rounded-lg bg-green-50 border border-green-200';
        initiativeElement.innerHTML = `
            <div class="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                <i class="fas fa-${initiative.icon} text-green-600"></i>
            </div>
            <h4 class="font-semibold mb-2">${initiative.name}</h4>
            <p class="text-sm text-gray-600 mb-3">${initiative.description}</p>
            <div class="text-xs text-green-600 mb-3">
                <i class="fas fa-users mr-1"></i>${initiative.participants} participants
            </div>
            <button class="btn btn-success btn-sm">Join Initiative</button>
        `;
        
        container.appendChild(initiativeElement);
    });
}

// Load policy dashboard data
async function loadPolicyDashboardData() {
    try {
        const [metrics, policies, recommendations] = await Promise.all([
            AirWatchAPI.getPolicyMetrics(),
            AirWatchAPI.getPolicies(),
            AirWatchAPI.getRecommendations()
        ]);
        
        updatePolicyDashboardUI(metrics, policies, recommendations);
    } catch (error) {
        console.error('Error loading policy dashboard data:', error);
        showError('Failed to load policy dashboard data. Please check if the server is running.');
    }
}

// Update policy dashboard UI
function updatePolicyDashboardUI(metrics, policies, recommendations) {
    // Update policy metrics
    updatePolicyMetrics(metrics);
    
    // Update policies table
    updatePoliciesTable(policies);
    
    // Update policy recommendations
    updatePolicyRecommendations(recommendations);

    // Render policy effectiveness chart
    renderPolicyEffectivenessChart();

    // Update top interventions
    updateTopInterventions(policies);
}

// Update policy metrics
function updatePolicyMetrics(metrics) {
    const container = document.getElementById('policy-metrics');
    if (!container) return;
    
    container.innerHTML = '';
    
    const metricData = [
        { icon: 'list', value: metrics.active_policies, title: 'Active Policies', color: 'green' },
        { icon: 'chart-line', value: `${metrics.avg_aqi_reduction}%`, title: 'Avg. AQI Reduction', color: 'blue' },
        { icon: 'rupee-sign', value: metrics.funding_allocated, title: 'Funding Allocated', color: 'orange' },
        { icon: 'bullseye', value: `${metrics.target_achievement}%`, title: 'Target Achievement', color: 'purple' }
    ];
    
    metricData.forEach(metric => {
        const metricElement = document.createElement('div');
        metricElement.className = 'card';
        metricElement.innerHTML = `
            <div class="card-content text-center">
                <div class="metric-icon bg-${metric.color}-50 mx-auto mb-3">
                    <i class="fas fa-${metric.icon} text-${metric.color}-600"></i>
                </div>
                <div class="metric-value text-${metric.color}-600">${metric.value}</div>
                <div class="metric-title">${metric.title}</div>
            </div>
        `;
        
        container.appendChild(metricElement);
    });
}

// Update policies table
function updatePoliciesTable(policies) {
    const tbody = document.querySelector('#policy-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    policies.forEach(policy => {
        const statusClass = policy.status === 'Active' ? 'bg-green-500' : 'bg-yellow-500';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${policy.name}</td>
            <td>${policy.type}</td>
            <td>${formatDate(policy.start_date)}</td>
            <td><span class="badge ${statusClass}">${policy.status}</span></td>
            <td>${policy.areas_covered}</td>
            <td>${policy.effectiveness || '-'}</td>
            <td>${policy.aqi_reduction ? `${policy.aqi_reduction}%` : '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary">View Details</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Update policy recommendations
function updatePolicyRecommendations(recommendations) {
    const container = document.getElementById('policy-recommendations');
    if (!container) return;
    
    container.innerHTML = '';
    
    const shortTermElement = document.createElement('div');
    shortTermElement.className = 'p-4 rounded-lg bg-blue-50 border border-blue-200';
    shortTermElement.innerHTML = `
        <h4 class="font-semibold mb-3 text-blue-800">Short-term Recommendations</h4>
        <ul class="space-y-2">
            ${recommendations.short_term.map(rec => `
                <li class="flex items-start gap-2">
                    <i class="fas fa-check-circle text-blue-600 mt-1"></i>
                    <span class="text-sm">${rec}</span>
                </li>
            `).join('')}
        </ul>
        <button class="btn btn-primary mt-4">Generate Action Plan</button>
    `;
    
    const longTermElement = document.createElement('div');
    longTermElement.className = 'p-4 rounded-lg bg-green-50 border border-green-200';
    longTermElement.innerHTML = `
        <h4 class="font-semibold mb-3 text-green-800">Long-term Strategies</h4>
        <ul class="space-y-2">
            ${recommendations.long_term.map(rec => `
                <li class="flex items-start gap-2">
                    <i class="fas fa-seedling text-green-600 mt-1"></i>
                    <span class="text-sm">${rec}</span>
                </li>
            `).join('')}
        </ul>
        <button class="btn btn-success mt-4">View Detailed Roadmap</button>
    `;
    
    container.appendChild(shortTermElement);
    container.appendChild(longTermElement);
}

// Helper functions
function getAQIColorClass(aqi) {
    const value = parseInt(aqi);
    if (value <= 50) return 'bg-green-500';
    if (value <= 100) return 'bg-blue-500';
    if (value <= 200) return 'bg-yellow-500';
    if (value <= 300) return 'bg-orange-500';
    return 'bg-red-500';
}

function getAQIBadgeClass(aqi) {
    const value = parseInt(aqi);
    if (value <= 50) return 'bg-green-500';
    if (value <= 100) return 'bg-blue-500';
    if (value <= 200) return 'bg-yellow-500';
    if (value <= 300) return 'bg-orange-500';
    return 'bg-red-500';
}

function getAQITextColorClass(aqi) {
    const value = parseInt(aqi);
    if (value <= 50) return 'text-green-600';
    if (value <= 100) return 'text-blue-600';
    if (value <= 200) return 'text-yellow-600';
    if (value <= 300) return 'text-orange-600';
    return 'text-red-600';
}

function getSourceColorClass(sourceName) {
    const colors = {
        'Vehicular': { background: 'bg-red-100', text: 'text-red-500' },
        'Industrial': { background: 'bg-orange-100', text: 'text-orange-500' },
        'Construction': { background: 'bg-purple-100', text: 'text-purple-500' },
        'Stubble Burning': { background: 'bg-cyan-100', text: 'text-cyan-500' },
        'Dust': { background: 'bg-green-100', text: 'text-green-500' },
        'Other': { background: 'bg-gray-100', text: 'text-gray-500' }
    };
    
    return colors[sourceName] || colors['Other'];
}

function getSourceIcon(sourceName) {
    const icons = {
        'Vehicular': 'fa-car',
        'Industrial': 'fa-industry',
        'Construction': 'fa-hard-hat',
        'Stubble Burning': 'fa-fire',
        'Dust': 'fa-wind',
        'Other': 'fa-question'
    };
    
    return icons[sourceName] || icons['Other'];
}

function getSeverityClass(severity) {
    const classes = {
        'Critical': { 
            background: 'bg-red-50', 
            border: 'border-red-200', 
            text: 'text-red-800',
            badge: 'bg-red-500',
            alert: 'alert-critical'
        },
        'High': { 
            background: 'bg-orange-50', 
            border: 'border-orange-200', 
            text: 'text-orange-800',
            badge: 'bg-orange-500',
            alert: 'alert-high'
        },
        'Medium': { 
            background: 'bg-blue-50', 
            border: 'border-blue-200', 
            text: 'text-blue-800',
            badge: 'bg-blue-500',
            alert: 'alert-medium'
        },
        'Low': { 
            background: 'bg-green-50', 
            border: 'border-green-200', 
            text: 'text-green-800',
            badge: 'bg-green-500',
            alert: 'alert-low'
        }
    };
    
    return classes[severity] || classes['Medium'];
}

function getReportStatusClass(status) {
    const classes = {
        'Verified': { 
            background: 'bg-red-50', 
            border: 'border-red-200', 
            text: 'text-red-800',
            badge: 'bg-red-500'
        },
        'Under Review': { 
            background: 'bg-orange-50', 
            border: 'border-orange-200', 
            text: 'text-orange-800',
            badge: 'bg-orange-500'
        },
        'New': { 
            background: 'bg-blue-50', 
            border: 'border-blue-200', 
            text: 'text-blue-800',
            badge: 'bg-blue-500'
        }
    };
    
    return classes[status] || classes['New'];
}

function getLevelColorClass(level, pollutant) {
    const numLevel = parseFloat(level);
    
    if (pollutant === 'PM2.5') {
        if (numLevel > 100) return 'text-red-600';
        if (numLevel > 50) return 'text-orange-600';
        return 'text-yellow-600';
    } else if (pollutant === 'PM10') {
        if (numLevel > 150) return 'text-red-600';
        if (numLevel > 100) return 'text-orange-600';
        return 'text-yellow-600';
    } else if (pollutant === 'SO2') {
        if (numLevel > 80) return 'text-red-600';
        if (numLevel > 40) return 'text-orange-600';
        return 'text-yellow-600';
    } else if (pollutant === 'NOx') {
        if (numLevel > 100) return 'text-red-600';
        if (numLevel > 50) return 'text-orange-600';
        return 'text-yellow-600';
    }
    
    return 'text-gray-600';
}

function getTrendIcon(trend) {
    if (trend.startsWith('+')) return 'fa-arrow-up';
    if (trend.startsWith('-')) return 'fa-arrow-down';
    return 'fa-minus';
}

function getTrendColorClass(trend) {
    if (trend.startsWith('+')) return 'text-red-500';
    if (trend.startsWith('-')) return 'text-green-500';
    return 'text-gray-500';
}

function getStatusBadgeClass(status) {
    const classes = {
        'Critical': 'bg-red-500',
        'High': 'bg-orange-500',
        'Medium': 'bg-yellow-500',
        'Low': 'bg-green-500'
    };
    
    return classes[status] || 'bg-gray-500';
}

function getImpactClass(impact) {
    const classes = {
        'Positive': { background: 'bg-green-50', text: 'text-green-600' },
        'Adverse': { background: 'bg-red-50', text: 'text-red-600' },
        'Neutral': { background: 'bg-gray-50', text: 'text-gray-600' },
        'Favorable': { background: 'bg-blue-50', text: 'text-blue-600' },
        'Beneficial': { background: 'bg-green-50', text: 'text-green-600' }
    };
    
    return classes[impact] || classes['Neutral'];
}

function getWeatherIcon(factor) {
    const icons = {
        'Wind Speed': 'fa-wind',
        'Temperature': 'fa-thermometer-half',
        'Precipitation': 'fa-cloud-rain',
        'Humidity': 'fa-tint'
    };
    
    return icons[factor] || 'fa-question';
}

function getInitiativeClass(icon) {
    const classes = {
        'tree': { background: 'bg-green-100', text: 'text-green-600' },
        'car': { background: 'bg-blue-100', text: 'text-blue-600' },
        'school': { background: 'bg-purple-100', text: 'text-purple-600' }
    };
    
    return classes[icon] || { background: 'bg-gray-100', text: 'text-gray-600' };
}

function formatRelativeTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 60) {
        return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
        return `${diffHours} hours ago`;
    } else {
        return `${diffDays} days ago`;
    }
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatDateTime(dateTimeString) {
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Date(dateTimeString).toLocaleDateString(undefined, options);
}

function showError(message) {
    // Create error banner
    const errorBanner = document.createElement('div');
    errorBanner.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4';
    errorBanner.innerHTML = `
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline">${message}</span>
    `;
    
    // Insert at the top of the main content
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.insertBefore(errorBanner, mainContent.firstChild);
    }
}

// Real-time data updates
function initializeRealTimeUpdates() {
    // Update data every 30 seconds
    setInterval(async () => {
        const activePage = document.querySelector('.page-section.active');
        if (!activePage) return;
        
        const pageId = activePage.id;
        
        try {
            switch(pageId) {
                case 'overview':
                    await loadOverviewData();
                    break;
                case 'source':
                    await loadSourceAnalysisData();
                    break;
                case 'forecast':
                    await loadForecastingData();
                    break;
                case 'citizen':
                    await loadCitizenPortalData();
                    break;
                case 'policy':
                    await loadPolicyDashboardData();
                    break;
            }
            
            // Update the sidebar AQI value
            const currentAQI = await AirWatchAPI.getCurrentAQI();
            const aqiElement = document.querySelector('.status-value:first-child');
            if (aqiElement && currentAQI.current_aqi) {
                aqiElement.textContent = currentAQI.current_aqi;
            }
        } catch (error) {
            console.error('Error updating data:', error);
        }
    }, 30000); // Update every 30 seconds
}
// Render source distribution chart
function renderSourceDistributionChart(sourceBreakdown) {
    const container = document.getElementById('sourceChart');
    if (!container) return;
    
    // Create a simple SVG pie chart
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Create SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.style.display = 'block';
    svg.style.margin = '0 auto';
    
    // Create group for pie chart
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${width / 2}, ${height / 2})`);
    
    // Calculate total value
    const total = sourceBreakdown.reduce((sum, item) => sum + item.value, 0);
    
    // Draw pie slices
    let currentAngle = 0;
    sourceBreakdown.forEach((item, index) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        const x1 = radius * Math.sin(currentAngle);
        const y1 = -radius * Math.cos(currentAngle);
        const x2 = radius * Math.sin(currentAngle + sliceAngle);
        const y2 = -radius * Math.cos(currentAngle + sliceAngle);
        
        const largeArc = sliceAngle > Math.PI ? 1 : 0;
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`);
        path.setAttribute('fill', getSourceColor(item.name));
        path.setAttribute('stroke', 'white');
        path.setAttribute('stroke-width', '2');
        
        g.appendChild(path);
        currentAngle += sliceAngle;
    });
    
    // Add center circle
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', 0);
    circle.setAttribute('cy', 0);
    circle.setAttribute('r', radius * 0.4);
    circle.setAttribute('fill', 'white');
    circle.setAttribute('stroke', '#e5e7eb');
    circle.setAttribute('stroke-width', '1');
    g.appendChild(circle);
    
    // Add total text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dy', '0.35em');
    text.setAttribute('font-size', '16');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('fill', '#374151');
    text.textContent = '100%';
    g.appendChild(text);
    
    svg.appendChild(g);
    container.appendChild(svg);
    
    // Add legend
    const legend = document.createElement('div');
    legend.className = 'flex flex-wrap justify-center mt-4 gap-2';
    
    sourceBreakdown.forEach(item => {
        const legendItem = document.createElement('div');
        legendItem.className = 'flex items-center text-xs';
        
        const colorBox = document.createElement('div');
        colorBox.className = 'w-3 h-3 rounded mr-1';
        colorBox.style.backgroundColor = getSourceColor(item.name);
        
        const text = document.createElement('span');
        text.textContent = `${item.name} (${item.value}%)`;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(text);
        legend.appendChild(legendItem);
    });
    
    container.appendChild(legend);
}

function getSourceColor(sourceName) {
    const colors = {
        'Vehicular': '#ef4444',
        'Industrial': '#f97316',
        'Construction': '#8b5cf6',
        'Stubble Burning': '#06b6d4',
        'Dust': '#84cc16',
        'Other': '#ec4899'
    };
    return colors[sourceName] || '#6b7280';
}
// Update top interventions
function updateTopInterventions(policies) {
    const container = document.getElementById('top-interventions');
    if (!container) return;
    
    // Clear previous content
    container.innerHTML = '';
    
    // Sort policies by effectiveness (descending) and take top 3
    const topPolicies = policies
        .filter(policy => policy.effectiveness)
        .sort((a, b) => b.effectiveness - a.effectiveness)
        .slice(0, 3);
    
    topPolicies.forEach(policy => {
        const impactClass = getPolicyImpactClass(policy.aqi_reduction);
        
        const policyElement = document.createElement('div');
        policyElement.className = `flex items-center justify-between p-3 rounded-lg ${impactClass.background}`;
        policyElement.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full ${impactClass.iconBackground} flex items-center justify-center">
                    <i class="fas ${getPolicyIcon(policy.type)} ${impactClass.iconText}"></i>
                </div>
                <div>
                    <p class="font-medium">${policy.name}</p>
                    <p class="text-sm text-gray-600">Implemented: ${formatDate(policy.start_date)}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-bold ${impactClass.text}">${policy.aqi_reduction}% AQI Reduction</p>
                <p class="text-xs text-gray-600">${getImpactLevel(policy.aqi_reduction)} Impact</p>
            </div>
        `;
        
        container.appendChild(policyElement);
    });
}

function getPolicyImpactClass(reduction) {
    if (reduction >= 30) {
        return {
            background: 'bg-green-50',
            text: 'text-green-600',
            iconBackground: 'bg-green-100',
            iconText: 'text-green-600'
        };
    } else if (reduction >= 20) {
        return {
            background: 'bg-blue-50',
            text: 'text-blue-600',
            iconBackground: 'bg-blue-100',
            iconText: 'text-blue-600'
        };
    } else {
        return {
            background: 'bg-purple-50',
            text: 'text-purple-600',
            iconBackground: 'bg-purple-100',
            iconText: 'text-purple-600'
        };
    }
}

function getPolicyIcon(policyType) {
    const icons = {
        'Vehicular Restriction': 'fa-car',
        'Industrial Regulation': 'fa-industry',
        'Dust Management': 'fa-hard-hat',
        'Citizen Engagement': 'fa-users',
        'Infrastructure': 'fa-building'
    };
    return icons[policyType] || 'fa-cog';
}

function getImpactLevel(reduction) {
    if (reduction >= 30) return 'High';
    if (reduction >= 20) return 'Medium';
    return 'Low';
}
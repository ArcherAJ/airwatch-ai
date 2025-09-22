/**
 * New Sections JavaScript for AirWatch AI
 * Handles functionality for hyperlocal, satellite, and policy sections
 */

class HyperlocalManager {
    constructor() {
        this.currentLocation = 'central-delhi';
        this.neighborhoodMap = null;
        this.init();
    }

    init() {
        this.setupLocationSelector();
        this.setupRouteFinder();
        this.setupActivityRecommendations();
        this.generateNeighborhoodMap();
        this.loadHyperlocalData();
    }

    setupLocationSelector() {
        const locationOptions = document.querySelectorAll('.location-option');
        const getCurrentLocationBtn = document.getElementById('getCurrentLocation');

        locationOptions.forEach(option => {
            option.addEventListener('click', () => {
                locationOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.currentLocation = option.dataset.location;
                this.loadHyperlocalData();
            });
        });

        if (getCurrentLocationBtn) {
            getCurrentLocationBtn.addEventListener('click', () => {
                this.getCurrentLocation();
            });
        }
    }

    setupRouteFinder() {
        const findRoutesBtn = document.getElementById('findRoutes');
        
        if (findRoutesBtn) {
            findRoutesBtn.addEventListener('click', () => {
                this.findSafeRoutes();
            });
        }
    }

    setupActivityRecommendations() {
        const activityBtns = document.querySelectorAll('.activity-btn');
        
        activityBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                activityBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const activity = btn.dataset.activity;
                this.getActivityRecommendations(activity);
            });
        });
    }

    generateNeighborhoodMap() {
        const mapContainer = document.getElementById('neighborhoodMap');
        if (!mapContainer) return;

        // Generate 5x5 grid
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.className = 'map-cell';
            
            // Random AQI for demonstration
            const aqi = Math.random() * 300 + 50;
            const category = this.getAQICategory(aqi);
            cell.classList.add(`aqi-${category.toLowerCase().replace(' ', '-')}`);
            cell.textContent = Math.round(aqi);
            
            cell.addEventListener('click', () => {
                this.showCellDetails(aqi, category, i);
            });
            
            mapContainer.appendChild(cell);
        }
    }

    async loadHyperlocalData() {
        try {
            const coords = this.getLocationCoordinates(this.currentLocation);
            const response = await fetch(`/api/advanced/hyperlocal-aqi?lat=${coords.lat}&lon=${coords.lon}&radius=2.0`);
            const data = await response.json();
            
            if (data.status === 'success') {
                this.updateHyperlocalDisplay(data.hyperlocal_aqi);
                this.updateNeighborhoodMap(data.hyperlocal_aqi);
            }
        } catch (error) {
            console.error('Error loading hyperlocal data:', error);
            this.updateHyperlocalDisplay(this.getMockData());
            this.updateNeighborhoodMap(this.getMockData());
        }
    }

    getLocationCoordinates(location) {
        const locations = {
            'central-delhi': { lat: 28.6139, lon: 77.2090 },
            'east-delhi': { lat: 28.6358, lon: 77.3145 },
            'west-delhi': { lat: 28.6139, lon: 77.1025 },
            'south-delhi': { lat: 28.4595, lon: 77.0266 },
            'north-delhi': { lat: 28.7041, lon: 77.1025 }
        };
        return locations[location] || locations['central-delhi'];
    }

    updateNeighborhoodMap(aqiData) {
        const mapContainer = document.getElementById('neighborhoodMap');
        if (!mapContainer) return;

        // Clear existing cells
        mapContainer.innerHTML = '';

        // Generate 5x5 grid with realistic variation
        const baseAQI = aqiData.aqi;
        
        for (let i = 0; i < 25; i++) {
            const cell = document.createElement('div');
            cell.className = 'map-cell';
            
            // Add variation based on position and time
            const variation = (Math.random() - 0.5) * 60; // ±30 AQI variation
            const timeVariation = Math.sin(Date.now() / 10000 + i) * 20; // Time-based variation
            const aqi = Math.max(50, Math.min(500, baseAQI + variation + timeVariation));
            
            const category = this.getAQICategory(aqi);
            cell.classList.add(`aqi-${category.toLowerCase().replace(' ', '-')}`);
            cell.textContent = Math.round(aqi);
            
            // Add hover effect
            cell.title = `Grid Point ${i + 1}: AQI ${Math.round(aqi)} (${category})`;
            
            cell.addEventListener('click', () => {
                this.showCellDetails(aqi, category, i);
            });
            
            mapContainer.appendChild(cell);
        }
    }

    updateHyperlocalDisplay(data) {
        const elements = {
            aqi: document.getElementById('hyperlocalAQI'),
            category: document.getElementById('hyperlocalCategory'),
            confidence: document.getElementById('hyperlocalConfidence'),
            pm25: document.getElementById('hyperlocalPM25'),
            pm10: document.getElementById('hyperlocalPM10'),
            no2: document.getElementById('hyperlocalNO2')
        };

        if (elements.aqi) elements.aqi.textContent = Math.round(data.aqi);
        if (elements.category) elements.category.textContent = data.category;
        if (elements.confidence) elements.confidence.textContent = `${Math.round(data.confidence * 100)}%`;
        if (elements.pm25) elements.pm25.textContent = data.pollutants?.pm25?.toFixed(1) || 'N/A';
        if (elements.pm10) elements.pm10.textContent = data.pollutants?.pm10?.toFixed(1) || 'N/A';
        if (elements.no2) elements.no2.textContent = data.pollutants?.no2?.toFixed(1) || 'N/A';
    }

    async findSafeRoutes() {
        const from = document.getElementById('routeFrom')?.value || 'Home';
        const to = document.getElementById('routeTo')?.value || 'Office';
        
        try {
            const response = await fetch(`/api/advanced/safe-routes?start_lat=28.6139&start_lon=77.2090&end_lat=28.6315&end_lon=77.2167`);
            const data = await response.json();
            
            if (data.status === 'success') {
                this.updateRoutesDisplay(data.routes);
            }
        } catch (error) {
            console.error('Error finding routes:', error);
            this.updateRoutesDisplay(this.getMockRoutes());
        }
    }

    updateRoutesDisplay(routes) {
        const routesList = document.getElementById('routesList');
        if (!routesList) return;

        routesList.innerHTML = '';
        
        routes.slice(0, 3).forEach((route, index) => {
            const routeElement = this.createRouteElement(route, index);
            routesList.appendChild(routeElement);
        });
    }

    createRouteElement(route, index) {
        const div = document.createElement('div');
        div.className = 'route-option';
        
        const routeType = route.route_type || 'mixed';
        const routeTypeClass = routeType === 'metro' ? 'metro' : 
                              routeType === 'cycling' ? 'cycling' : 'walking';
        
        div.innerHTML = `
            <div class="route-info">
                <div class="route-type ${routeTypeClass}">
                    <i class="fas fa-${this.getRouteIcon(routeType)}"></i>
                    <span>${this.getRouteTypeName(routeType)}</span>
                </div>
                <div class="route-stats">
                    <span class="route-duration">${route.total_duration} min</span>
                    <span class="route-aqi">${Math.round(route.avg_aqi)} AQI</span>
                    <span class="route-distance">${route.total_distance.toFixed(1)} km</span>
                </div>
            </div>
            <div class="route-score ${this.getScoreClass(route.route_score)}">${this.getScoreLabel(route.route_score)}</div>
        `;
        
        return div;
    }

    async getActivityRecommendations(activity) {
        try {
            const response = await fetch(`/api/advanced/activity-recommendations?lat=28.6139&lon=77.2090&activity=${activity}&duration=60`);
            const data = await response.json();
            
            if (data.status === 'success') {
                this.updateActivityRecommendations(data.activity_recommendations);
            }
        } catch (error) {
            console.error('Error getting activity recommendations:', error);
            this.updateActivityRecommendations(this.getMockActivityData(activity));
        }
    }

    updateActivityRecommendations(data) {
        const container = document.getElementById('activityRecommendation');
        if (!container) return;

        const status = this.getActivityStatus(data.current_location.aqi);
        const statusClass = status === 'good' ? 'good' : status === 'moderate' ? 'moderate' : 'poor';
        
        container.innerHTML = `
            <div class="recommendation-status ${statusClass}">
                <i class="fas fa-${this.getStatusIcon(status)}"></i>
                <span>${this.getStatusText(status)}</span>
            </div>
            <div class="recommendation-details">
                <p>${data.recommendations[0]?.message || 'Check current air quality before outdoor activities.'}</p>
                <div class="recommendation-tips">
                    <div class="tip-item">
                        <i class="fas fa-clock"></i>
                        <span>Best time: ${data.time_recommendations[0]?.best_time || '6-8 AM'}</span>
                    </div>
                    <div class="tip-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>Try parks and green areas</span>
                    </div>
                </div>
            </div>
        `;
    }

    getCurrentLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('Current location:', position.coords.latitude, position.coords.longitude);
                    // Update location input
                    const locationInput = document.getElementById('locationInput');
                    if (locationInput) {
                        locationInput.value = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                }
            );
        }
    }

    getAQICategory(aqi) {
        if (aqi <= 50) return 'Good';
        if (aqi <= 100) return 'Satisfactory';
        if (aqi <= 200) return 'Moderate';
        if (aqi <= 300) return 'Poor';
        if (aqi <= 400) return 'Very Poor';
        return 'Severe';
    }

    getRouteIcon(type) {
        const icons = {
            metro: 'subway',
            cycling: 'bicycle',
            walking: 'walking',
            road: 'car'
        };
        return icons[type] || 'route';
    }

    getRouteTypeName(type) {
        const names = {
            metro: 'Metro Route',
            cycling: 'Cycling Route',
            walking: 'Walking Route',
            road: 'Direct Route'
        };
        return names[type] || 'Route';
    }

    getScoreClass(score) {
        if (score < 50) return 'excellent';
        if (score < 100) return 'good';
        return 'moderate';
    }

    getScoreLabel(score) {
        if (score < 50) return 'Excellent';
        if (score < 100) return 'Good';
        return 'Moderate';
    }

    getActivityStatus(aqi) {
        if (aqi <= 100) return 'good';
        if (aqi <= 200) return 'moderate';
        return 'poor';
    }

    getStatusIcon(status) {
        const icons = {
            good: 'check-circle',
            moderate: 'exclamation-triangle',
            poor: 'times-circle'
        };
        return icons[status] || 'question-circle';
    }

    getStatusText(status) {
        const texts = {
            good: 'Safe for outdoor activities',
            moderate: 'Moderate air quality - take precautions',
            poor: 'Poor air quality - limit outdoor activities'
        };
        return texts[status] || 'Check air quality';
    }

    showCellDetails(aqi, category, index) {
        // Create a simple tooltip or modal
        const tooltip = document.createElement('div');
        tooltip.className = 'cell-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <h4>Grid Point ${index + 1}</h4>
                <p>AQI: ${Math.round(aqi)}</p>
                <p>Category: ${category}</p>
            </div>
        `;
        
        document.body.appendChild(tooltip);
        
        setTimeout(() => {
            document.body.removeChild(tooltip);
        }, 3000);
    }

    getMockData() {
        return {
            aqi: 287,
            category: 'Poor',
            confidence: 0.87,
            pollutants: {
                pm25: 112.5,
                pm10: 195.3,
                no2: 45.6
            }
        };
    }

    getMockRoutes() {
        return [
            {
                route_type: 'metro',
                total_duration: 45,
                avg_aqi: 180,
                total_distance: 12,
                route_score: 85
            },
            {
                route_type: 'cycling',
                total_duration: 30,
                avg_aqi: 200,
                total_distance: 8,
                route_score: 95
            }
        ];
    }

    getMockActivityData(activity) {
        return {
            current_location: { aqi: 287 },
            recommendations: [
                { message: 'Current air quality is poor. Consider indoor alternatives.' }
            ],
            time_recommendations: [
                { best_time: '6-8 AM' }
            ]
        };
    }
}

class SatelliteManager {
    constructor() {
        this.currentTracking = 'stubble-burning';
        this.currentTimeframe = '3d';
        this.init();
    }

    init() {
        this.setupControls();
        this.loadSatelliteData();
        this.startDataRefresh();
    }

    setupControls() {
        const trackingBtns = document.querySelectorAll('[data-tracking]');
        const timeframeBtns = document.querySelectorAll('[data-timeframe]');

        trackingBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                trackingBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTracking = btn.dataset.tracking;
                this.loadSatelliteData();
            });
        });

        timeframeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                timeframeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTimeframe = btn.dataset.timeframe;
                this.loadSatelliteData();
            });
        });
    }

    async loadSatelliteData() {
        try {
            let response;
            switch (this.currentTracking) {
                case 'stubble-burning':
                    response = await fetch('/api/advanced/satellite/stubble-burning');
                    break;
                case 'industrial':
                    response = await fetch('/api/advanced/satellite/industrial-hotspots');
                    break;
                case 'aerosol':
                    response = await fetch('/api/advanced/satellite/aerosol-depth');
                    break;
            }

            if (response) {
                const data = await response.json();
                if (data.status === 'success') {
                    this.updateSatelliteDisplay(data);
                    this.updateSatelliteVisualizations(data);
                }
            }
        } catch (error) {
            console.error('Error loading satellite data:', error);
            this.updateSatelliteDisplay(this.getMockSatelliteData());
            this.updateSatelliteVisualizations(this.getMockSatelliteData());
        }
    }

    updateSatelliteVisualizations(data) {
        if (this.currentTracking === 'stubble-burning') {
            this.updateFireMap(data.stubble_burning_analysis);
        } else if (this.currentTracking === 'industrial') {
            this.updateIndustrialMap(data.industrial_hotspots);
        } else if (this.currentTracking === 'aerosol') {
            this.updateAerosolMap(data.aerosol_optical_depth);
        }
    }

    updateFireMap(stubbleData) {
        // Update fire detection visualization
        const fireCount = stubbleData?.fire_count || 0;
        const fireElements = document.querySelectorAll('.fire-count, .fire-detection');
        
        fireElements.forEach(element => {
            element.textContent = fireCount;
            
            // Add pulsing animation for high fire count
            if (fireCount > 20) {
                element.classList.add('high-activity');
            } else {
                element.classList.remove('high-activity');
            }
        });

        // Update impact prediction
        this.updateImpactPrediction(stubbleData);
    }

    updateImpactPrediction(stubbleData) {
        const impactElements = {
            aqiIncrease: document.querySelector('.impact-value.critical'),
            timeToImpact: document.querySelector('.impact-item:nth-child(2) .impact-value'),
            windDirection: document.querySelector('.impact-item:nth-child(3) .impact-value'),
            confidence: document.querySelector('.impact-item:nth-child(4) .impact-value')
        };

        if (stubbleData?.impact_prediction) {
            const impact = stubbleData.impact_prediction;
            if (impactElements.aqiIncrease) impactElements.aqiIncrease.textContent = `+${impact.expected_aqi_increase || 85} points`;
            if (impactElements.timeToImpact) impactElements.timeToImpact.textContent = impact.time_to_impact || '4-6 hours';
            if (impactElements.windDirection) impactElements.windDirection.textContent = impact.wind_direction || 'Northwest';
            if (impactElements.confidence) impactElements.confidence.textContent = `${impact.impact_probability || 92}%`;
        }
    }

    updateIndustrialMap(industrialData) {
        // Update industrial hotspots list
        const hotspotsList = document.querySelector('.hotspots-list');
        if (!hotspotsList || !industrialData?.hotspots) return;

        hotspotsList.innerHTML = '';
        
        industrialData.hotspots.forEach((hotspot, index) => {
            const hotspotElement = this.createHotspotElement(hotspot, index);
            hotspotsList.appendChild(hotspotElement);
        });

        // Update emission summary
        this.updateEmissionSummary(industrialData);
    }

    createHotspotElement(hotspot, index) {
        const div = document.createElement('div');
        div.className = 'hotspot-item';
        
        const intensity = hotspot.avg_temperature > 60 ? 'high' : 
                         hotspot.avg_temperature > 50 ? 'medium' : 'low';
        
        div.innerHTML = `
            <div class="hotspot-info">
                <div class="hotspot-name">${hotspot.name || `Industrial Area ${index + 1}`}</div>
                <div class="hotspot-coordinates">${hotspot.latitude?.toFixed(4)}°N, ${hotspot.longitude?.toFixed(4)}°E</div>
            </div>
            <div class="hotspot-metrics">
                <div class="hotspot-temperature">${Math.round(hotspot.avg_temperature || 65)}°C</div>
                <div class="hotspot-intensity ${intensity}">${intensity.charAt(0).toUpperCase() + intensity.slice(1)}</div>
            </div>
        `;
        
        return div;
    }

    updateEmissionSummary(industrialData) {
        const summaryElements = {
            totalHotspots: document.querySelector('.emission-summary .summary-item:nth-child(1) .summary-value'),
            emissionIntensity: document.querySelector('.emission-summary .summary-item:nth-child(2) .summary-value'),
            lastUpdated: document.querySelector('.emission-summary .summary-item:nth-child(3) .summary-value')
        };

        if (summaryElements.totalHotspots) {
            summaryElements.totalHotspots.textContent = `${industrialData.hotspot_count || 8} detected`;
        }
        
        if (summaryElements.emissionIntensity) {
            const intensity = industrialData.emission_intensity > 50 ? 'High' : 
                             industrialData.emission_intensity > 25 ? 'Medium' : 'Low';
            summaryElements.emissionIntensity.textContent = intensity;
            summaryElements.emissionIntensity.className = `summary-value ${intensity.toLowerCase()}`;
        }
        
        if (summaryElements.lastUpdated) {
            summaryElements.lastUpdated.textContent = 'Just now';
        }
    }

    updateAerosolMap(aerosolData) {
        // Update AOD locations
        const aodLocations = document.querySelector('.aod-locations');
        if (!aodLocations || !aerosolData?.aod_data) return;

        aodLocations.innerHTML = '';
        
        Object.entries(aerosolData.aod_data).forEach(([location, aod]) => {
            const locationElement = this.createAODLocationElement(location, aod);
            aodLocations.appendChild(locationElement);
        });

        // Update AOD summary
        this.updateAODSummary(aerosolData);
    }

    createAODLocationElement(location, aod) {
        const div = document.createElement('div');
        div.className = 'aod-location';
        
        const quality = aod > 0.8 ? 'poor' : aod > 0.6 ? 'moderate' : 'good';
        
        div.innerHTML = `
            <div class="location-name">${location.charAt(0).toUpperCase() + location.slice(1)}</div>
            <div class="aod-value">${aod.toFixed(3)}</div>
            <div class="aod-quality ${quality}">${quality.charAt(0).toUpperCase() + quality.slice(1)}</div>
        `;
        
        return div;
    }

    updateAODSummary(aerosolData) {
        const summaryElements = {
            averageAOD: document.querySelector('.aod-summary .summary-item:nth-child(1) .summary-value'),
            dataQuality: document.querySelector('.aod-summary .summary-item:nth-child(2) .summary-value'),
            satellitePass: document.querySelector('.aod-summary .summary-item:nth-child(3) .summary-value')
        };

        if (summaryElements.averageAOD) {
            summaryElements.averageAOD.textContent = aerosolData.average_aod?.toFixed(3) || '0.781';
        }
        
        if (summaryElements.dataQuality) {
            summaryElements.dataQuality.textContent = aerosolData.data_quality || 'High';
        }
        
        if (summaryElements.satellitePass) {
            summaryElements.satellitePass.textContent = 'Terra (10:30 AM)';
        }
    }

    updateSatelliteDisplay(data) {
        if (this.currentTracking === 'stubble-burning') {
            this.updateStubbleBurningDisplay(data.stubble_burning_analysis);
        } else if (this.currentTracking === 'industrial') {
            this.updateIndustrialDisplay(data.industrial_hotspots);
        } else if (this.currentTracking === 'aerosol') {
            this.updateAerosolDisplay(data.aerosol_optical_depth);
        }
    }

    updateStubbleBurningDisplay(data) {
        const elements = {
            fireCount: document.getElementById('fireCount'),
            thermalAnomalies: document.getElementById('thermalAnomalies'),
            smokePlumes: document.getElementById('smokePlumes')
        };

        if (elements.fireCount) elements.fireCount.textContent = data.fire_count || 23;
        if (elements.thermalAnomalies) elements.thermalAnomalies.textContent = data.thermal_anomalies || 15;
        if (elements.smokePlumes) elements.smokePlumes.textContent = data.thermal_anomalies || 8;
    }

    updateIndustrialDisplay(data) {
        // Update industrial hotspots display
        console.log('Updating industrial display:', data);
    }

    updateAerosolDisplay(data) {
        // Update aerosol depth display
        console.log('Updating aerosol display:', data);
    }

    startDataRefresh() {
        // Refresh data every 5 minutes
        setInterval(() => {
            this.loadSatelliteData();
        }, 5 * 60 * 1000);
    }

    getMockSatelliteData() {
        return {
            stubble_burning_analysis: {
                fire_count: Math.floor(Math.random() * 30) + 10,
                thermal_anomalies: Math.floor(Math.random() * 20) + 5,
                smoke_plumes: Math.floor(Math.random() * 15) + 3
            }
        };
    }
}

class PolicyManager {
    constructor() {
        this.activeInterventions = [];
        this.init();
    }

    init() {
        this.setupPolicyControls();
        this.loadPolicyData();
        this.startPolicyMonitoring();
    }


    setupPolicyControls() {
        const startBtn = document.getElementById('startPolicy');
        const predictBtn = document.getElementById('predictPolicy');
        const policyBtns = document.querySelectorAll('.policy-btn');

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.startPolicyIntervention();
            });
        }

        if (predictBtn) {
            predictBtn.addEventListener('click', () => {
                this.predictPolicyEffectiveness();
            });
        }

        policyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                policyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

    }

    async startPolicyIntervention() {
        const activePolicy = document.querySelector('.policy-btn.active');
        if (!activePolicy) return;

        const policyName = activePolicy.dataset.policy;
        
        try {
            const response = await fetch('/api/advanced/policy-effectiveness/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    policy_name: policyName,
                    current_conditions: {
                        aqi: this.getCurrentAQI(),
                        wind_speed: this.getCurrentWindSpeed(),
                        temperature: this.getCurrentTemperature()
                    }
                })
            });

            const data = await response.json();
            if (data.status === 'success') {
                this.addActiveIntervention(data.intervention_started);
                this.showNotification(`Started ${this.getPolicyDisplayName(policyName)} intervention`, 'success');
                this.startInterventionMonitoring(data.intervention_started.intervention_id);
            } else {
                // Create mock intervention for demonstration
                const mockIntervention = this.createMockIntervention(policyName);
                this.addActiveIntervention(mockIntervention);
                this.showNotification(`Started ${this.getPolicyDisplayName(policyName)} intervention`, 'success');
                this.startInterventionMonitoring(mockIntervention.intervention_id);
            }
        } catch (error) {
            console.error('Error starting policy intervention:', error);
            // Create mock intervention for demonstration
            const mockIntervention = this.createMockIntervention(policyName);
            this.addActiveIntervention(mockIntervention);
            this.showNotification(`Started ${this.getPolicyDisplayName(policyName)} intervention (Demo Mode)`, 'success');
            this.startInterventionMonitoring(mockIntervention.intervention_id);
        }
    }

    createMockIntervention(policyName) {
        const interventionId = `intervention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        return {
            intervention_id: interventionId,
            policy_name: policyName,
            start_time: new Date().toISOString(),
            status: 'active',
            initial_conditions: {
                aqi: this.getCurrentAQI(),
                wind_speed: this.getCurrentWindSpeed(),
                temperature: this.getCurrentTemperature()
            },
            created_at: new Date().toISOString()
        };
    }

    getCurrentAQI() {
        const aqiElement = document.getElementById('currentAQI') || document.getElementById('hyperlocalAQI');
        return aqiElement ? parseInt(aqiElement.textContent) : 287;
    }

    getCurrentWindSpeed() {
        const windElement = document.querySelector('.weather-value');
        return windElement ? parseFloat(windElement.textContent) : 8;
    }

    getCurrentTemperature() {
        const tempElements = document.querySelectorAll('.weather-value');
        return tempElements.length > 1 ? parseFloat(tempElements[1].textContent) : 28;
    }

    getPolicyDisplayName(policyName) {
        const names = {
            'odd-even': 'Odd-Even Vehicle Policy',
            'construction-ban': 'Construction Ban',
            'industrial-shutdown': 'Industrial Shutdown',
            'public-transport': 'Public Transport Enhancement'
        };
        return names[policyName] || policyName;
    }

    startInterventionMonitoring(interventionId) {
        // Start monitoring this specific intervention
        const monitoringInterval = setInterval(async () => {
            try {
                const response = await fetch(`/api/advanced/policy-effectiveness/measure/${interventionId}`);
                const data = await response.json();
                
                if (data.status === 'success') {
                    this.updateSpecificInterventionMetrics(interventionId, data.effectiveness_measurement);
                } else {
                    // Use simulated data for demonstration
                    this.updateSpecificInterventionMetrics(interventionId, this.generateMockMeasurement(interventionId));
                }
            } catch (error) {
                console.error('Error monitoring intervention:', error);
                // Use simulated data for demonstration
                this.updateSpecificInterventionMetrics(interventionId, this.generateMockMeasurement(interventionId));
            }
        }, 30000); // Monitor every 30 seconds for more responsive updates

        // Store interval ID for cleanup
        if (!this.monitoringIntervals) {
            this.monitoringIntervals = new Map();
        }
        this.monitoringIntervals.set(interventionId, monitoringInterval);
    }

    generateMockMeasurement(interventionId) {
        const intervention = this.activeInterventions.find(i => i.intervention_id === interventionId);
        const policyName = intervention?.policy_name || 'unknown';
        const startTime = new Date(intervention?.start_time || Date.now());
        const elapsedMinutes = Math.floor((Date.now() - startTime.getTime()) / 60000);
        
        // Generate realistic measurements based on policy type and elapsed time
        let baseEffectiveness = 0;
        let aqiReduction = 0;
        
        switch (policyName) {
            case 'construction-ban':
                baseEffectiveness = 85 + Math.sin(elapsedMinutes / 30) * 10; // High effectiveness, varies
                aqiReduction = Math.min(40, elapsedMinutes * 0.8); // Gradual improvement
                break;
            case 'industrial-shutdown':
                baseEffectiveness = 92 + Math.sin(elapsedMinutes / 20) * 8; // Very high effectiveness
                aqiReduction = Math.min(60, elapsedMinutes * 1.2); // Faster improvement
                break;
            case 'odd-even':
                baseEffectiveness = 78 + Math.sin(elapsedMinutes / 40) * 12; // Moderate effectiveness
                aqiReduction = Math.min(25, elapsedMinutes * 0.5); // Slower improvement
                break;
            case 'public-transport':
                baseEffectiveness = 70 + Math.sin(elapsedMinutes / 50) * 15; // Variable effectiveness
                aqiReduction = Math.min(20, elapsedMinutes * 0.3); // Gradual improvement
                break;
            default:
                baseEffectiveness = 75 + Math.random() * 20;
                aqiReduction = Math.min(30, elapsedMinutes * 0.6);
        }
        
        return {
            intervention_id: interventionId,
            elapsed_minutes: elapsedMinutes,
            aqi_reduction: aqiReduction,
            effectiveness_percentage: Math.max(0, Math.min(100, baseEffectiveness)),
            current_aqi: Math.max(50, 287 - aqiReduction),
            confidence: Math.max(60, 95 - elapsedMinutes * 0.5)
        };
    }

    updateSpecificInterventionMetrics(interventionId, measurement) {
        const interventionElement = document.querySelector(`[data-intervention-id="${interventionId}"]`);
        if (!interventionElement) return;

        const metrics = interventionElement.querySelectorAll('.metric-value');
        if (metrics.length >= 3) {
            // Update duration
            const duration = this.formatDuration(measurement.elapsed_minutes);
            metrics[0].textContent = duration;
            
            // Update AQI reduction with animation
            const aqiReduction = Math.round(measurement.aqi_reduction);
            metrics[1].textContent = `-${aqiReduction} points`;
            metrics[1].className = `metric-value ${aqiReduction > 0 ? 'success' : ''}`;
            
            // Update effectiveness
            const effectiveness = Math.round(measurement.effectiveness_percentage);
            metrics[2].textContent = `${effectiveness}%`;
            
            // Add visual feedback for updates
            metrics.forEach(metric => {
                metric.classList.add('metric-updating');
                setTimeout(() => {
                    metric.classList.remove('metric-updating');
                }, 500);
            });
        }

        // Update the intervention in our tracking list
        const intervention = this.activeInterventions.find(i => i.intervention_id === interventionId);
        if (intervention) {
            intervention.last_measurement = measurement;
            intervention.last_updated = new Date();
        }
        
    }

    updateInterventionMetrics(measurement) {
        // Find the intervention in the UI and update its metrics
        const interventionItems = document.querySelectorAll('.intervention-item');
        
        interventionItems.forEach(item => {
            const interventionName = item.querySelector('.intervention-name').textContent;
            
            // Update metrics based on measurement data
            const metrics = item.querySelectorAll('.metric-value');
            if (metrics.length >= 3) {
                // Update duration (assuming measurement includes elapsed time)
                const duration = this.formatDuration(measurement.elapsed_minutes || 0);
                metrics[0].textContent = duration;
                
                // Update AQI reduction
                const aqiReduction = measurement.aqi_reduction || 0;
                metrics[1].textContent = `-${Math.round(aqiReduction)} points`;
                metrics[1].className = `metric-value ${aqiReduction > 0 ? 'success' : ''}`;
                
                // Update effectiveness
                const effectiveness = measurement.effectiveness_percentage || 0;
                metrics[2].textContent = `${Math.round(effectiveness)}%`;
            }
        });

        // Update analytics chart if available
        this.updateAnalyticsChart(measurement);
    }

    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }











    async predictPolicyEffectiveness() {
        const activePolicy = document.querySelector('.policy-btn.active');
        if (!activePolicy) return;

        const policyName = activePolicy.dataset.policy;
        
        try {
            const response = await fetch('/api/advanced/policy-effectiveness/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    policy_name: policyName,
                    current_conditions: {
                        aqi: this.getCurrentAQI(),
                        wind_speed: this.getCurrentWindSpeed(),
                        temperature: this.getCurrentTemperature(),
                        time_of_day: new Date().getHours(),
                        day_of_week: new Date().getDay()
                    },
                    historical_data: await this.getHistoricalData()
                })
            });

            const data = await response.json();
            if (data.status === 'success') {
                this.showPredictionResults(data.effectiveness_prediction);
                this.updateRecommendations(data.effectiveness_prediction);
            }
        } catch (error) {
            console.error('Error predicting policy effectiveness:', error);
            this.showNotification('Error predicting effectiveness', 'error');
        }
    }

    async getHistoricalData() {
        // Get last 7 days of data for prediction
        try {
            const response = await fetch('/api/advanced/policy-effectiveness/historical?days=7');
            const data = await response.json();
            return data.historical_data || [];
        } catch (error) {
            console.error('Error fetching historical data:', error);
            return [];
        }
    }

    updateRecommendations(prediction) {
        // Update AI recommendations based on prediction
        const recommendationItems = document.querySelectorAll('.recommendation-item');
        
        if (recommendationItems.length > 0 && prediction) {
            const primaryRecommendation = recommendationItems[0];
            
            // Update recommendation content
            const title = primaryRecommendation.querySelector('h5');
            const description = primaryRecommendation.querySelector('p');
            const details = primaryRecommendation.querySelectorAll('.detail-item span');
            const button = primaryRecommendation.querySelector('.btn-recommendation');
            
            if (title) title.textContent = prediction.recommended_action || 'Implement Policy Intervention';
            if (description) description.textContent = prediction.recommendation_reason || 'Current conditions indicate high effectiveness for this intervention.';
            
            if (details.length >= 3) {
                details[0].textContent = `Optimal timing: ${prediction.optimal_timing || 'Next 2 hours'}`;
                details[1].textContent = `Expected reduction: ${Math.round(prediction.predicted_aqi_reduction || 35)} AQI points`;
                details[2].textContent = `Cost category: ${prediction.cost_category || 'Medium'}`;
            }
            
            if (button) {
                button.textContent = prediction.confidence > 80 ? 'Implement Now' : 'Schedule';
                button.className = `btn-recommendation ${prediction.confidence > 80 ? 'high-confidence' : 'medium-confidence'}`;
            }
            
            // Update confidence badge
            const confidenceBadge = primaryRecommendation.querySelector('.recommendation-confidence');
            if (confidenceBadge) {
                confidenceBadge.textContent = `Confidence: ${Math.round(prediction.confidence || 85)}%`;
            }
        }
    }

    async predictPolicyEffectiveness() {
        const activePolicy = document.querySelector('.policy-btn.active');
        if (!activePolicy) return;

        const policyName = activePolicy.dataset.policy;
        
        try {
            const response = await fetch('/api/advanced/policy-effectiveness/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    policy_name: policyName,
                    current_conditions: {
                        aqi: 287,
                        wind_speed: 8,
                        temperature: 28
                    }
                })
            });

            const data = await response.json();
            if (data.status === 'success') {
                this.showPredictionResults(data.effectiveness_prediction);
            }
        } catch (error) {
            console.error('Error predicting policy effectiveness:', error);
            this.showNotification('Error predicting effectiveness', 'error');
        }
    }

    addActiveIntervention(intervention) {
        this.activeInterventions.push(intervention);
        this.updateActiveInterventionsDisplay();
        this.addInterventionToUI(intervention);
    }

    updateActiveInterventionsDisplay() {
        const activeCount = document.getElementById('activeCount');
        if (activeCount) {
            activeCount.textContent = this.activeInterventions.length;
        }
    }

    addInterventionToUI(intervention) {
        const interventionsList = document.querySelector('.intervention-list');
        if (!interventionsList) return;

        // Create new intervention element
        const interventionElement = this.createInterventionElement(intervention);
        
        // Add to the top of the list
        interventionsList.insertBefore(interventionElement, interventionsList.firstChild);
        
        // Add animation
        interventionElement.classList.add('intervention-active');
        setTimeout(() => {
            interventionElement.classList.remove('intervention-active');
        }, 2000);

        // Update the count
        this.updateActiveInterventionsDisplay();
        
    }

    createInterventionElement(intervention) {
        const div = document.createElement('div');
        div.className = 'intervention-item';
        div.dataset.interventionId = intervention.intervention_id || Date.now();
        
        // Ensure we have a valid policy name
        const policyName = intervention.policy_name || 'Unknown Policy';
        const displayName = this.getPolicyDisplayName(policyName);
        const startTime = new Date(intervention.start_time || Date.now());
        
        div.innerHTML = `
            <div class="intervention-info">
                <div class="intervention-name">${displayName}</div>
                <div class="intervention-status active">
                    <div class="status-dot"></div>
                    <span>Active</span>
                </div>
            </div>
            <div class="intervention-metrics">
                <div class="metric">
                    <span class="metric-label">Duration:</span>
                    <span class="metric-value">0m</span>
                </div>
                <div class="metric">
                    <span class="metric-label">AQI Reduction:</span>
                    <span class="metric-value">0 points</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Effectiveness:</span>
                    <span class="metric-value">0%</span>
                </div>
            </div>
            <div class="intervention-actions">
                <button class="btn-small primary" onclick="window.policyManager.monitorIntervention('${div.dataset.interventionId}')">Monitor</button>
                <button class="btn-small secondary" onclick="window.policyManager.endIntervention('${div.dataset.interventionId}')">End</button>
            </div>
        `;
        
        return div;
    }

    endIntervention(interventionId) {
        // Find and remove intervention from UI
        const interventionElement = document.querySelector(`[data-intervention-id="${interventionId}"]`);
        if (interventionElement) {
            interventionElement.style.opacity = '0.5';
            interventionElement.querySelector('.intervention-status span').textContent = 'Ended';
            interventionElement.querySelector('.intervention-status').classList.remove('active');
            interventionElement.querySelector('.intervention-status').classList.add('ended');
            
            // Remove after animation
            setTimeout(() => {
                interventionElement.remove();
                this.removeInterventionFromList(interventionId);
                this.updateActiveInterventionsDisplay();
            }, 1000);
        }

        // Stop monitoring
        if (this.monitoringIntervals && this.monitoringIntervals.has(interventionId)) {
            clearInterval(this.monitoringIntervals.get(interventionId));
            this.monitoringIntervals.delete(interventionId);
        }

        this.showNotification('Intervention ended', 'info');
    }

    removeInterventionFromList(interventionId) {
        this.activeInterventions = this.activeInterventions.filter(
            intervention => intervention.intervention_id !== interventionId
        );
    }

    monitorIntervention(interventionId) {
        // Start detailed monitoring for this intervention
        this.showNotification('Starting detailed monitoring...', 'info');
        
        // This could open a detailed modal or navigate to a monitoring page
        console.log('Monitoring intervention:', interventionId);
    }

    showPredictionResults(prediction) {
        // Create modal or update display with prediction results
        console.log('Policy prediction:', prediction);
        this.showNotification(`Predicted effectiveness: ${prediction.predicted_reduction} AQI reduction`, 'info');
    }

    showNotification(message, type) {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 5000);
    }

    async loadPolicyData() {
        try {
            const response = await fetch('/api/advanced/policy-effectiveness/analytics');
            const data = await response.json();
            
            if (data.status === 'success') {
                this.updatePolicyAnalytics(data.policy_analytics);
            }
        } catch (error) {
            console.error('Error loading policy data:', error);
        }
    }

    updatePolicyAnalytics(data) {
        // Update policy analytics display
        console.log('Policy analytics:', data);
    }

    startPolicyMonitoring() {
        // Monitor active interventions every minute
        setInterval(() => {
            this.activeInterventions.forEach(intervention => {
                this.measureInterventionEffectiveness(intervention.intervention_id);
            });
        }, 60 * 1000);
    }

    async measureInterventionEffectiveness(interventionId) {
        try {
            const response = await fetch(`/api/advanced/policy-effectiveness/measure/${interventionId}`);
            const data = await response.json();
            
            if (data.status === 'success') {
                this.updateInterventionMetrics(data.effectiveness_measurement);
            }
        } catch (error) {
            console.error('Error measuring intervention effectiveness:', error);
        }
    }

    updateInterventionMetrics(measurement) {
        // Update intervention metrics display
        console.log('Intervention measurement:', measurement);
    }
}

// Initialize managers when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hyperlocalManager = new HyperlocalManager();
    window.satelliteManager = new SatelliteManager();
    window.policyManager = new PolicyManager();
});

// Add CSS for tooltips
const tooltipCSS = `
.cell-tooltip {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: 1rem;
    z-index: 1000;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.tooltip-content h4 {
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
}

.tooltip-content p {
    margin: 0.25rem 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: var(--border-radius);
    color: white;
    font-weight: 600;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
}

.notification-success {
    background: #10b981;
}

.notification-error {
    background: #ef4444;
}

.notification-info {
    background: #3b82f6;
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

// Inject CSS
const style = document.createElement('style');
style.textContent = tooltipCSS;
document.head.appendChild(style);

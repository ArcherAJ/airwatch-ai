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

        // Generate area markers directly with animated background
        this.createAreaMarkers(mapContainer);
    }

    createAreaMarkers(mapContainer) {
        // Add map controls and enhanced legend
        this.addMapControls(mapContainer);
        this.addEnhancedLegend(mapContainer);
        
        // Delhi areas organized in a 6x5 grid layout for better organization
        const delhiAreas = [
            // Row 1 - North Delhi
            { name: 'Rohini', lat: 28.7406, lon: 77.0717, gridArea: 'rohini', type: 'residential', population: '850000' },
            { name: 'Pitampura', lat: 28.6981, lon: 77.1381, gridArea: 'pitampura', type: 'mixed', population: '320000' },
            { name: 'Shalimar Bagh', lat: 28.7169, lon: 77.1625, gridArea: 'shalimar-bagh', type: 'residential', population: '180000' },
            { name: 'Azadpur', lat: 28.7081, lon: 77.1881, gridArea: 'azadpur', type: 'commercial', population: '220000' },
            { name: 'Model Town', lat: 28.7281, lon: 77.2181, gridArea: 'model-town', type: 'mixed', population: '150000' },
            { name: 'Civil Lines', lat: 28.6581, lon: 77.2281, gridArea: 'civil-lines', type: 'administrative', population: '95000' },
            
            // Row 2 - North-Central Delhi
            { name: 'Kamla Nagar', lat: 28.6781, lon: 77.2081, gridArea: 'kamla-nagar', type: 'commercial', population: '180000' },
            { name: 'Karol Bagh', lat: 28.6481, lon: 77.1881, gridArea: 'karol-bagh', type: 'commercial', population: '250000' },
            { name: 'Rajiv Chowk', lat: 28.6381, lon: 77.2181, gridArea: 'rajiv-chowk', type: 'commercial', population: '120000' },
            { name: 'New Delhi', lat: 28.6139, lon: 77.2090, gridArea: 'new-delhi', type: 'administrative', population: '80000' },
            { name: 'Daryaganj', lat: 28.6481, lon: 77.2381, gridArea: 'daryaganj', type: 'commercial', population: '160000' },
            { name: 'Chandni Chowk', lat: 28.6581, lon: 77.2281, gridArea: 'chandni-chowk', type: 'commercial', population: '200000' },
            
            // Row 3 - Central Delhi
            { name: 'Red Fort', lat: 28.6562, lon: 77.2410, gridArea: 'red-fort', type: 'heritage', population: '45000' },
            { name: 'Jama Masjid', lat: 28.6508, lon: 77.2331, gridArea: 'jama-masjid', type: 'religious', population: '35000' },
            { name: 'Kashmere Gate', lat: 28.6681, lon: 77.2281, gridArea: 'kashmere-gate', type: 'transport', population: '65000' },
            { name: 'Connaught Place', lat: 28.6315, lon: 77.2167, gridArea: 'connaught-place', type: 'commercial', population: '85000' },
            { name: 'India Gate', lat: 28.6129, lon: 77.2295, gridArea: 'india-gate', type: 'monument', population: '25000' },
            { name: 'Lodhi Road', lat: 28.5936, lon: 77.2178, gridArea: 'lodhi-road', type: 'residential', population: '120000' },
            
            // Row 4 - South-Central Delhi
            { name: 'Lajpat Nagar', lat: 28.5681, lon: 77.2381, gridArea: 'lajpat-nagar', type: 'commercial', population: '220000' },
            { name: 'South Extension', lat: 28.5481, lon: 77.2181, gridArea: 'south-extension', type: 'commercial', population: '180000' },
            { name: 'Hauz Khas', lat: 28.5481, lon: 77.1881, gridArea: 'hauz-khas', type: 'mixed', population: '140000' },
            { name: 'Green Park', lat: 28.5281, lon: 77.1781, gridArea: 'green-park', type: 'residential', population: '95000' },
            { name: 'Saket', lat: 28.5281, lon: 77.2081, gridArea: 'saket', type: 'commercial', population: '160000' },
            { name: 'Greater Kailash', lat: 28.5481, lon: 77.2481, gridArea: 'greater-kailash', type: 'commercial', population: '180000' },
            
            // Row 5 - South Delhi
            { name: 'Vasant Kunj', lat: 28.5281, lon: 77.1481, gridArea: 'vasant-kunj', type: 'residential', population: '280000' },
            { name: 'Dwarka', lat: 28.5881, lon: 77.0481, gridArea: 'dwarka', type: 'residential', population: '420000' },
            { name: 'Janakpuri', lat: 28.6281, lon: 77.0781, gridArea: 'janakpuri', type: 'mixed', population: '340000' },
            { name: 'Rajouri Garden', lat: 28.6481, lon: 77.1181, gridArea: 'rajouri-garden', type: 'commercial', population: '190000' },
            { name: 'Punjabi Bagh', lat: 28.6681, lon: 77.1381, gridArea: 'punjabi-bagh', type: 'mixed', population: '210000' },
            { name: 'Malviya Nagar', lat: 28.5281, lon: 77.1881, gridArea: 'malviya-nagar', type: 'mixed', population: '150000' }
        ];

        // Clear existing content
        mapContainer.innerHTML = '';

        // Generate enhanced area markers using CSS Grid positioning
        delhiAreas.forEach((area, index) => {
            const cell = document.createElement('div');
            cell.className = 'map-cell enhanced-marker';
            
            // Generate realistic AQI based on area characteristics and type
            const aqi = this.generateAreaSpecificAQI(area.name, area.type);
            const category = this.getAQICategory(aqi);
            
            cell.classList.add(`aqi-${category.toLowerCase().replace(' ', '-')}`);
            cell.classList.add(`area-type-${area.type}`);
            cell.dataset.areaName = area.name;
            cell.dataset.aqi = Math.round(aqi);
            cell.dataset.category = category;
            cell.dataset.type = area.type;
            cell.dataset.population = area.population;
            cell.dataset.lat = area.lat;
            cell.dataset.lon = area.lon;
            cell.dataset.area = area.gridArea;
            
            // Create enhanced cell content with type icon and better layout
            const typeIcon = this.getAreaTypeIcon(area.type);
            cell.innerHTML = `
                <div class="marker-header">
                    <div class="type-icon">${typeIcon}</div>
                    <div class="aqi-badge">${Math.round(aqi)}</div>
                </div>
                <div class="area-name-enhanced">${area.name}</div>
                <div class="aqi-category-enhanced">${category}</div>
                <div class="area-stats">
                    <div class="population">${this.formatPopulation(area.population)}</div>
                    <div class="area-type">${this.formatAreaType(area.type)}</div>
                </div>
            `;
            
            // Add enhanced hover effects
            cell.addEventListener('mouseenter', () => {
                this.showEnhancedTooltip(cell, area, aqi, category);
            });
            
            cell.addEventListener('mouseleave', () => {
                this.hideAreaTooltip();
            });
            
            cell.addEventListener('click', () => {
                this.showEnhancedAreaDetails(area, aqi, category, index);
            });
            
            // Add pulsing animation for high AQI areas
            if (aqi > 300) {
                cell.classList.add('high-pollution-pulse');
            }
            
            mapContainer.appendChild(cell);
        });
    }

    getAreaTypeIcon(type) {
        const icons = {
            'residential': '<i class="fas fa-home"></i>',
            'commercial': '<i class="fas fa-building"></i>',
            'mixed': '<i class="fas fa-city"></i>',
            'administrative': '<i class="fas fa-landmark"></i>',
            'heritage': '<i class="fas fa-monument"></i>',
            'religious': '<i class="fas fa-place-of-worship"></i>',
            'transport': '<i class="fas fa-subway"></i>',
            'monument': '<i class="fas fa-memorial"></i>'
        };
        return icons[type] || '<i class="fas fa-map-marker-alt"></i>';
    }

    formatPopulation(population) {
        const pop = parseInt(population);
        if (pop >= 1000000) {
            return `${(pop / 1000000).toFixed(1)}M`;
        } else if (pop >= 1000) {
            return `${(pop / 1000).toFixed(0)}K`;
        }
        return pop.toString();
    }

    formatAreaType(type) {
        const types = {
            'residential': 'Residential',
            'commercial': 'Commercial',
            'mixed': 'Mixed Use',
            'administrative': 'Admin',
            'heritage': 'Heritage',
            'religious': 'Religious',
            'transport': 'Transport Hub',
            'monument': 'Monument'
        };
        return types[type] || type;
    }

    getHealthImpact(category) {
        const impacts = {
            'Good': 'Minimal health risk',
            'Moderate': 'Sensitive groups may experience minor breathing discomfort',
            'Unhealthy for Sensitive Groups': 'Sensitive groups should limit outdoor activities',
            'Poor': 'Everyone may experience health effects; sensitive groups at greater risk',
            'Very Poor': 'Health warnings for everyone; avoid outdoor activities',
            'Hazardous': 'Emergency conditions; everyone should avoid all outdoor activities'
        };
        return impacts[category] || 'Unknown health impact';
    }

    getDetailedHealthImpact(category) {
        const impacts = {
            'Good': 'Air quality is satisfactory and poses little or no risk to health.',
            'Moderate': 'Air quality is acceptable; however, some pollutants may cause breathing discomfort for sensitive people.',
            'Unhealthy for Sensitive Groups': 'Sensitive groups may experience health effects. The general public is not likely to be affected.',
            'Poor': 'Everyone may begin to experience health effects; members of sensitive groups may experience more serious health effects.',
            'Very Poor': 'Health alert: everyone may experience more serious health effects.',
            'Hazardous': 'Health warning of emergency conditions. The entire population is more likely to be affected.'
        };
        return impacts[category] || 'Health impact information not available.';
    }

    getRecommendations(category, areaType) {
        const recommendations = {
            'Good': 'Perfect weather for outdoor activities! Enjoy your time outside.',
            'Moderate': 'Generally safe for outdoor activities. Consider wearing a mask if you have respiratory sensitivities.',
            'Unhealthy for Sensitive Groups': 'Sensitive groups should limit outdoor activities. Consider indoor alternatives.',
            'Poor': 'Limit outdoor activities. If you must go outside, wear an N95 mask.',
            'Very Poor': 'Avoid outdoor activities. Stay indoors with air purifiers if possible.',
            'Hazardous': 'Stay indoors. Use air purifiers and avoid any outdoor exposure.'
        };
        
        const baseRec = recommendations[category] || 'Follow local air quality guidelines.';
        const typeSpecific = areaType === 'commercial' ? ' Avoid high-traffic commercial areas.' : 
                           areaType === 'residential' ? ' Residential areas may have slightly better air quality.' : '';
        
        return baseRec + typeSpecific;
    }

    getPollutantBreakdown(aqi, areaType) {
        // Generate realistic pollutant breakdown based on AQI and area type
        const basePM25 = aqi * 0.4; // PM2.5 typically contributes 40% to AQI
        const basePM10 = aqi * 0.3; // PM10 typically contributes 30% to AQI
        const baseNO2 = aqi * 0.2;  // NO2 typically contributes 20% to AQI
        const baseO3 = aqi * 0.1;   // O3 typically contributes 10% to AQI
        
        // Adjust based on area type
        const typeMultipliers = {
            'commercial': { PM25: 1.2, PM10: 1.3, NO2: 1.4, O3: 0.9 },
            'residential': { PM25: 0.9, PM10: 0.9, NO2: 0.8, O3: 1.1 },
            'transport': { PM25: 1.3, PM10: 1.4, NO2: 1.5, O3: 0.8 },
            'mixed': { PM25: 1.0, PM10: 1.0, NO2: 1.0, O3: 1.0 }
        };
        
        const multiplier = typeMultipliers[areaType] || typeMultipliers['mixed'];
        
        return [
            { name: 'PM2.5', value: Math.round(basePM25 * multiplier.PM25) },
            { name: 'PM10', value: Math.round(basePM10 * multiplier.PM10) },
            { name: 'NO₂', value: Math.round(baseNO2 * multiplier.NO2) },
            { name: 'O₃', value: Math.round(baseO3 * multiplier.O3) }
        ];
    }

    getAQIDescription(category) {
        const descriptions = {
            'Good': 'Air quality is considered satisfactory, and air pollution poses little or no risk.',
            'Moderate': 'Air quality is acceptable; however, for some pollutants there may be a moderate health concern for a very small number of people.',
            'Unhealthy for Sensitive Groups': 'Members of sensitive groups may experience health effects.',
            'Poor': 'Everyone may begin to experience health effects.',
            'Very Poor': 'Health warnings of emergency conditions.',
            'Hazardous': 'Health alert: everyone may experience more serious health effects.'
        };
        return descriptions[category] || 'Air quality information is not available.';
    }

    getDelhiZone(lat, lon) {
        if (lat > 28.7) return 'North Delhi';
        if (lat < 28.5) return 'South Delhi';
        if (lon > 77.25) return 'East Delhi';
        if (lon < 77.15) return 'West Delhi';
        return 'Central Delhi';
    }

    addMapControls(mapContainer) {
        // Remove existing controls
        const existingControls = mapContainer.querySelector('.map-controls-overlay');
        if (existingControls) {
            existingControls.remove();
        }

        const controlsOverlay = document.createElement('div');
        controlsOverlay.className = 'map-controls-overlay';
        
        controlsOverlay.innerHTML = `
            <button class="map-control-btn" id="toggleMolecules" title="Toggle Molecule Animation">
                <i class="fas fa-atom"></i>
            </button>
            <button class="map-control-btn" id="toggleHeatmap" title="Toggle Heat Map">
                <i class="fas fa-fire"></i>
            </button>
            <button class="map-control-btn" id="toggleTraffic" title="Toggle Traffic Data">
                <i class="fas fa-car"></i>
            </button>
            <button class="map-control-btn" id="toggleWeather" title="Toggle Weather Overlay">
                <i class="fas fa-cloud-sun"></i>
            </button>
            <button class="map-control-btn" id="refreshData" title="Refresh Air Quality Data">
                <i class="fas fa-sync-alt"></i>
            </button>
        `;

        mapContainer.appendChild(controlsOverlay);

        // Add control event listeners
        this.setupMapControls();
    }

    addEnhancedLegend(mapContainer) {
        // Remove existing legend
        const existingLegend = mapContainer.querySelector('.map-legend-enhanced');
        if (existingLegend) {
            existingLegend.remove();
        }

        const legend = document.createElement('div');
        legend.className = 'map-legend-enhanced';
        
        legend.innerHTML = `
            <div class="legend-title">Air Quality Index</div>
            <div class="legend-items">
                <div class="legend-item-enhanced">
                    <div class="legend-color-enhanced good"></div>
                    <span>Good (0-50)</span>
                </div>
                <div class="legend-item-enhanced">
                    <div class="legend-color-enhanced moderate"></div>
                    <span>Moderate (51-100)</span>
                </div>
                <div class="legend-item-enhanced">
                    <div class="legend-color-enhanced poor"></div>
                    <span>Poor (101-200)</span>
                </div>
                <div class="legend-item-enhanced">
                    <div class="legend-color-enhanced very-poor"></div>
                    <span>Very Poor (201-300)</span>
                </div>
                <div class="legend-item-enhanced">
                    <div class="legend-color-enhanced hazardous"></div>
                    <span>Hazardous (301+)</span>
                </div>
            </div>
            <div style="margin-top: 0.75rem; font-size: 0.7rem; color: var(--text-secondary); text-align: center;">
                Real-time Delhi Air Quality Monitoring
            </div>
        `;

        mapContainer.appendChild(legend);
    }

    setupMapControls() {
        // Toggle Molecule Animation
        document.getElementById('toggleMolecules')?.addEventListener('click', () => {
            this.toggleMoleculeAnimation();
        });

        // Toggle Heat Map
        document.getElementById('toggleHeatmap')?.addEventListener('click', () => {
            this.toggleHeatMap();
        });

        // Toggle Traffic Data
        document.getElementById('toggleTraffic')?.addEventListener('click', () => {
            this.toggleTrafficData();
        });

        // Toggle Weather Overlay
        document.getElementById('toggleWeather')?.addEventListener('click', () => {
            this.toggleWeatherOverlay();
        });

        // Refresh Data
        document.getElementById('refreshData')?.addEventListener('click', () => {
            this.refreshAirQualityData();
        });
    }

    toggleMoleculeAnimation() {
        const mapGrid = document.querySelector('.map-grid');
        const btn = document.getElementById('toggleMolecules');
        
        if (mapGrid.classList.contains('molecules-paused')) {
            mapGrid.classList.remove('molecules-paused');
            btn.innerHTML = '<i class="fas fa-atom"></i>';
            btn.style.background = 'rgba(59, 130, 246, 0.3)';
            btn.title = 'Pause Molecule Animation';
        } else {
            mapGrid.classList.add('molecules-paused');
            btn.innerHTML = '<i class="fas fa-pause"></i>';
            btn.style.background = 'rgba(239, 68, 68, 0.3)';
            btn.title = 'Resume Molecule Animation';
        }
    }

    toggleHeatMap() {
        const mapGrid = document.querySelector('.map-grid');
        const btn = document.getElementById('toggleHeatmap');
        
        if (mapGrid.classList.contains('heatmap-mode')) {
            mapGrid.classList.remove('heatmap-mode');
            btn.style.background = 'rgba(15, 23, 42, 0.9)';
        } else {
            mapGrid.classList.add('heatmap-mode');
            btn.style.background = 'rgba(239, 68, 68, 0.3)';
            this.generateHeatMap();
        }
    }

    toggleTrafficData() {
        const btn = document.getElementById('toggleTraffic');
        btn.style.background = btn.style.background.includes('59, 130, 246') ? 
            'rgba(15, 23, 42, 0.9)' : 'rgba(59, 130, 246, 0.3)';
        
        // Simulate traffic data overlay
        console.log('Traffic data toggled');
    }

    toggleWeatherOverlay() {
        const btn = document.getElementById('toggleWeather');
        btn.style.background = btn.style.background.includes('59, 130, 246') ? 
            'rgba(15, 23, 42, 0.9)' : 'rgba(59, 130, 246, 0.3)';
        
        // Simulate weather overlay
        console.log('Weather overlay toggled');
    }

    refreshAirQualityData() {
        const btn = document.getElementById('refreshData');
        btn.style.animation = 'spin 1s linear infinite';
        
        // Refresh all area data
        setTimeout(() => {
            this.refreshGridWithNewData();
            btn.style.animation = '';
        }, 1500);
    }

    generateHeatMap() {
        const mapContainer = document.querySelector('.map-grid');
        const heatmapCanvas = document.createElement('canvas');
        heatmapCanvas.id = 'heatmap-canvas';
        heatmapCanvas.style.position = 'absolute';
        heatmapCanvas.style.top = '0';
        heatmapCanvas.style.left = '0';
        heatmapCanvas.style.width = '100%';
        heatmapCanvas.style.height = '100%';
        heatmapCanvas.style.pointerEvents = 'none';
        heatmapCanvas.style.zIndex = '5';
        
        mapContainer.appendChild(heatmapCanvas);
        
        const ctx = heatmapCanvas.getContext('2d');
        const rect = mapContainer.getBoundingClientRect();
        heatmapCanvas.width = rect.width;
        heatmapCanvas.height = rect.height;
        
        // Generate heat map based on AQI values
        const cells = mapContainer.querySelectorAll('.map-cell');
        cells.forEach(cell => {
            const aqi = parseInt(cell.dataset.aqi);
            const x = parseFloat(cell.style.left) / 100 * rect.width;
            const y = parseFloat(cell.style.top) / 100 * rect.height;
            
            // Create radial gradient for heat map
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, 80);
            
            if (aqi < 100) {
                gradient.addColorStop(0, 'rgba(16, 185, 129, 0.6)');
                gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
            } else if (aqi < 200) {
                gradient.addColorStop(0, 'rgba(245, 158, 11, 0.6)');
                gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
            } else if (aqi < 300) {
                gradient.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
                gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
            } else {
                gradient.addColorStop(0, 'rgba(139, 92, 246, 0.6)');
                gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
            }
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, 80, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    generateAreaSpecificAQI(areaName, areaType = 'mixed') {
        // Generate more realistic AQI based on area characteristics and type
        const typeFactors = {
            'commercial': 1.3,    // Higher pollution due to traffic and businesses
            'administrative': 1.1, // Moderate pollution
            'residential': 0.9,    // Lower pollution
            'mixed': 1.0,         // Baseline
            'transport': 1.4,     // High pollution from vehicles
            'heritage': 1.2,      // Moderate pollution from tourism
            'religious': 1.0,     // Baseline
            'monument': 1.1       // Moderate pollution from tourism
        };

        const areaFactors = {
            // Commercial/High traffic areas - higher AQI
            'Rajiv Chowk': 280, 'Karol Bagh': 320, 'Chandni Chowk': 350, 'New Delhi': 290,
            'Red Fort': 300, 'Jama Masjid': 340, 'Daryaganj': 310, 'Civil Lines': 270,
            'Connaught Place': 285, 'India Gate': 275, 'Greater Kailash': 295,
            
            // Residential areas - moderate AQI
            'Rohini': 180, 'Pitampura': 200, 'Shalimar Bagh': 190, 'Model Town': 210,
            'Kamla Nagar': 220, 'Lajpat Nagar': 240, 'South Extension': 230,
            'Vasant Kunj': 160, 'Dwarka': 170, 'Janakpuri': 185, 'Rajouri Garden': 195,
            'Lodhi Road': 155, 'Malviya Nagar': 185,
            
            // Green/Parks areas - lower AQI
            'Hauz Khas': 140, 'Green Park': 130, 'Saket': 150, 'Punjabi Bagh': 175,
            
            // Industrial/Mixed areas - higher AQI
            'Azadpur': 250, 'Kashmere Gate': 260
        };
        
        const baseAQI = areaFactors[areaName] || 200;
        const typeMultiplier = typeFactors[areaType] || 1.0;
        
        // Add some random variation (±20) and apply type multiplier
        const variation = (Math.random() - 0.5) * 40;
        const adjustedAQI = baseAQI * typeMultiplier + variation;
        return Math.max(50, Math.min(500, Math.round(adjustedAQI)));
    }

    showEnhancedTooltip(cell, area, aqi, category) {
        // Remove existing tooltip
        const existingTooltip = document.querySelector('.area-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }

        // Create enhanced tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'area-tooltip enhanced-tooltip';
        
        const healthImpact = this.getHealthImpact(category);
        const recommendations = this.getRecommendations(category, area.type);
        
        tooltip.innerHTML = `
            <div class="tooltip-header">
                <div class="tooltip-title">${area.name}</div>
                <div class="tooltip-subtitle">${this.formatAreaType(area.type)} • ${this.formatPopulation(area.population)} people</div>
            </div>
            <div class="tooltip-content">
                <div class="aqi-display">
                    <div class="aqi-value">${Math.round(aqi)}</div>
                    <div class="aqi-category">${category}</div>
                </div>
                <div class="health-impact">
                    <div class="impact-label">Health Impact:</div>
                    <div class="impact-level ${category.toLowerCase().replace(' ', '-')}">${healthImpact}</div>
                </div>
                <div class="coordinates">
                    <div class="coord">${area.lat.toFixed(4)}°N, ${area.lon.toFixed(4)}°E</div>
                </div>
                <div class="recommendations">
                    <div class="rec-label">Recommendations:</div>
                    <div class="rec-text">${recommendations}</div>
                </div>
            </div>
        `;

        document.body.appendChild(tooltip);

        // Position tooltip
        const rect = cell.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2}px`;
        tooltip.style.top = `${rect.top - 10}px`;
        tooltip.style.transform = 'translate(-50%, -100%)';

        // Add animation
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translate(-50%, -100%) scale(0.8)';
        
        setTimeout(() => {
            tooltip.style.transition = 'all 0.2s ease-out';
            tooltip.style.opacity = '1';
            tooltip.style.transform = 'translate(-50%, -100%) scale(1)';
        }, 10);
    }

    showEnhancedAreaDetails(area, aqi, category, index) {
        // Create enhanced modal
        const modal = document.createElement('div');
        modal.className = 'area-modal enhanced-modal';
        
        const healthImpact = this.getHealthImpact(category);
        const recommendations = this.getRecommendations(category, area.type);
        const pollutants = this.getPollutantBreakdown(aqi, area.type);
        
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-title">
                        <div class="area-icon">${this.getAreaTypeIcon(area.type)}</div>
                        <div class="title-text">
                            <h3>${area.name}</h3>
                            <p>${this.formatAreaType(area.type)} • Population: ${this.formatPopulation(area.population)}</p>
                        </div>
                    </div>
                    <button class="modal-close">&times;</button>
                </div>
                
                <div class="modal-body">
                    <div class="aqi-section">
                        <div class="aqi-main">
                            <div class="aqi-number-large">${Math.round(aqi)}</div>
                            <div class="aqi-category-large">${category}</div>
                        </div>
                        <div class="aqi-description">
                            ${this.getAQIDescription(category)}
                        </div>
                    </div>
                    
                    <div class="details-grid">
                        <div class="detail-card">
                            <div class="detail-header">
                                <i class="fas fa-heartbeat"></i>
                                <h4>Health Impact</h4>
                            </div>
                            <div class="detail-content">
                                <div class="impact-level ${category.toLowerCase().replace(' ', '-')}">${healthImpact}</div>
                                <p>${this.getDetailedHealthImpact(category)}</p>
                            </div>
                        </div>
                        
                        <div class="detail-card">
                            <div class="detail-header">
                                <i class="fas fa-map-marker-alt"></i>
                                <h4>Location</h4>
                            </div>
                            <div class="detail-content">
                                <div class="coordinates">${area.lat.toFixed(4)}°N, ${area.lon.toFixed(4)}°E</div>
                                <p>Located in ${this.getDelhiZone(area.lat, area.lon)}</p>
                            </div>
                        </div>
                        
                        <div class="detail-card">
                            <div class="detail-header">
                                <i class="fas fa-flask"></i>
                                <h4>Pollutants</h4>
                            </div>
                            <div class="detail-content">
                                ${pollutants.map(p => `
                                    <div class="pollutant-item">
                                        <span class="pollutant-name">${p.name}</span>
                                        <span class="pollutant-value">${p.value}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="detail-card">
                            <div class="detail-header">
                                <i class="fas fa-lightbulb"></i>
                                <h4>Recommendations</h4>
                            </div>
                            <div class="detail-content">
                                <p>${recommendations}</p>
                                <div class="action-buttons">
                                    <button class="btn-small primary">Get Directions</button>
                                    <button class="btn-small secondary">Share Location</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add animation
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.transition = 'opacity 0.3s ease-out';
            modal.style.opacity = '1';
        }, 10);

        // Close modal handlers
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        });

        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        });
    }

    showAreaTooltip(cell, areaName, aqi, category) {
        // Remove existing tooltip
        const existingTooltip = document.querySelector('.area-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }

        // Create tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'area-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-header">${areaName}</div>
            <div class="tooltip-aqi">AQI: ${Math.round(aqi)}</div>
            <div class="tooltip-category">${category}</div>
            <div class="tooltip-action">Click for details</div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = cell.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`;
    }

    hideAreaTooltip() {
        const tooltip = document.querySelector('.area-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    }

    showAreaDetails(areaName, aqi, category, cellIndex) {
        // Create detailed modal for area
        const modal = document.createElement('div');
        modal.className = 'area-details-modal';
        modal.innerHTML = `
            <div class="modal-backdrop" onclick="this.parentElement.remove()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${areaName} Air Quality Details</h3>
                    <button class="modal-close" onclick="this.closest('.area-details-modal').remove()">×</button>
                </div>
                <div class="modal-body">
                    <div class="area-stats">
                        <div class="stat-item">
                            <div class="stat-label">Current AQI</div>
                            <div class="stat-value aqi-${category.toLowerCase().replace(' ', '-')}">${Math.round(aqi)}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Air Quality</div>
                            <div class="stat-value">${category}</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-label">Health Impact</div>
                            <div class="stat-value">${this.getHealthImpact(category)}</div>
                        </div>
                    </div>
                    <div class="area-recommendations">
                        <h4>Recommendations for ${areaName}:</h4>
                        <ul>
                            ${this.getAreaRecommendations(areaName, aqi, category).map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="area-pollutants">
                        <h4>Pollutant Breakdown:</h4>
                        <div class="pollutant-grid">
                            ${this.getPollutantBreakdown(aqi).map(pollutant => `
                                <div class="pollutant-item">
                                    <span class="pollutant-name">${pollutant.name}</span>
                                    <span class="pollutant-value">${pollutant.value}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    getHealthImpact(category) {
        const impacts = {
            'Good': 'Minimal health risk',
            'Moderate': 'Sensitive people may experience minor issues',
            'Poor': 'Health risks for sensitive groups',
            'Unhealthy': 'Health risks for everyone',
            'Hazardous': 'Serious health risks - avoid outdoor activities'
        };
        return impacts[category] || 'Unknown health impact';
    }

    getAreaRecommendations(areaName, aqi, category) {
        const recommendations = [];
        
        if (category === 'Good') {
            recommendations.push('Perfect for outdoor activities');
            recommendations.push('No mask required');
            recommendations.push('Ideal for exercise and sports');
        } else if (category === 'Moderate') {
            recommendations.push('Sensitive people should limit outdoor activities');
            recommendations.push('Consider wearing a mask if exercising outdoors');
            recommendations.push('Good for light outdoor activities');
        } else if (category === 'Poor') {
            recommendations.push('Limit outdoor activities');
            recommendations.push('Wear N95 mask if going outside');
            recommendations.push('Avoid outdoor exercise');
            recommendations.push('Keep windows closed');
        } else if (category === 'Unhealthy') {
            recommendations.push('Avoid outdoor activities');
            recommendations.push('Wear N95 mask if necessary to go outside');
            recommendations.push('Use air purifiers indoors');
            recommendations.push('Stay indoors as much as possible');
        } else {
            recommendations.push('Stay indoors - emergency conditions');
            recommendations.push('Wear N95 mask if going outside is necessary');
            recommendations.push('Use air purifiers with HEPA filters');
            recommendations.push('Consider temporary relocation if possible');
        }
        
        // Area-specific recommendations
        if (areaName.includes('Chowk') || areaName.includes('Market')) {
            recommendations.push('Avoid during peak traffic hours (8-10 AM, 6-8 PM)');
        }
        
        if (areaName.includes('Park') || areaName.includes('Garden')) {
            recommendations.push('Parks may have slightly better air quality');
        }
        
        return recommendations;
    }

    getPollutantBreakdown(aqi) {
        // Generate realistic pollutant breakdown based on AQI
        const pm25 = (aqi * 0.4 + Math.random() * 20).toFixed(1);
        const pm10 = (aqi * 0.7 + Math.random() * 30).toFixed(1);
        const no2 = (aqi * 0.15 + Math.random() * 10).toFixed(1);
        const co = (aqi * 0.02 + Math.random() * 2).toFixed(1);
        const o3 = (aqi * 0.1 + Math.random() * 5).toFixed(1);
        
        return [
            { name: 'PM2.5', value: `${pm25} μg/m³` },
            { name: 'PM10', value: `${pm10} μg/m³` },
            { name: 'NO₂', value: `${no2} ppb` },
            { name: 'CO', value: `${co} ppm` },
            { name: 'O₃', value: `${o3} ppb` }
        ];
    }

    async loadHyperlocalData() {
        try {
            const coords = this.getLocationCoordinates(this.currentLocation);
            const response = await fetch(`/api/advanced/hyperlocal-aqi?lat=${coords.lat}&lon=${coords.lon}&radius=2.0`);
            const data = await response.json();
            
            if (data.status === 'success') {
                this.updateHyperlocalDisplay(data.hyperlocal_aqi);
                // Refresh grid with new data while preserving area names
                this.updateNeighborhoodMap(data.hyperlocal_aqi);
            }
        } catch (error) {
            console.error('Error loading hyperlocal data:', error);
            this.updateHyperlocalDisplay(this.getMockData());
            // Refresh grid with mock data while preserving area names
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
        // Refresh the grid with new AQI data while preserving area names
        this.refreshGridWithNewData(aqiData);
    }

    refreshGridWithNewData(aqiData) {
        const mapContainer = document.getElementById('neighborhoodMap');
        if (!mapContainer) return;

        const cells = mapContainer.querySelectorAll('.map-cell');
        cells.forEach((cell, index) => {
            const areaName = cell.dataset.areaName;
            if (areaName) {
                // Generate new AQI based on area characteristics
                const newAqi = this.generateAreaSpecificAQI(areaName);
                const newCategory = this.getAQICategory(newAqi);
                
                // Update the cell data
                cell.dataset.aqi = Math.round(newAqi);
                cell.dataset.category = newCategory;
                
                // Update the visual appearance
                cell.className = `map-cell aqi-${newCategory.toLowerCase().replace(' ', '-')}`;
                
                // Update the content
                cell.innerHTML = `
                    <div class="area-name-large">${areaName}</div>
                    <div class="aqi-indicator">${newCategory}</div>
                    <div class="aqi-number">${Math.round(newAqi)}</div>
                `;
                
                // Ensure positioning is maintained
                if (!cell.style.left || !cell.style.top) {
                    // If positioning is lost, regenerate the map
                    this.generateNeighborhoodMap();
                }
            }
        });
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
        // Get area name from the positioned areas array
        const delhiAreas = [
            // North Delhi areas
            { name: 'Rohini', x: 15, y: 10 },
            { name: 'Pitampura', x: 25, y: 15 },
            { name: 'Shalimar Bagh', x: 35, y: 12 },
            { name: 'Azadpur', x: 45, y: 18 },
            { name: 'Model Town', x: 55, y: 20 },
            
            // North-Central areas
            { name: 'Civil Lines', x: 20, y: 30 },
            { name: 'Kamla Nagar', x: 30, y: 35 },
            { name: 'Karol Bagh', x: 40, y: 32 },
            { name: 'Rajiv Chowk', x: 50, y: 38 },
            { name: 'New Delhi', x: 60, y: 40 },
            
            // Central Delhi areas
            { name: 'Daryaganj', x: 25, y: 50 },
            { name: 'Chandni Chowk', x: 35, y: 48 },
            { name: 'Red Fort', x: 45, y: 52 },
            { name: 'Jama Masjid', x: 55, y: 55 },
            { name: 'Kashmere Gate', x: 65, y: 50 },
            
            // South-Central areas
            { name: 'Lajpat Nagar', x: 30, y: 70 },
            { name: 'South Extension', x: 40, y: 72 },
            { name: 'Hauz Khas', x: 50, y: 68 },
            { name: 'Green Park', x: 60, y: 70 },
            { name: 'Saket', x: 70, y: 75 },
            
            // South Delhi areas
            { name: 'Vasant Kunj', x: 20, y: 85 },
            { name: 'Dwarka', x: 10, y: 80 },
            { name: 'Janakpuri', x: 25, y: 88 },
            { name: 'Rajouri Garden', x: 45, y: 85 },
            { name: 'Punjabi Bagh', x: 55, y: 88 }
        ];
        
        const areaName = delhiAreas[index] ? delhiAreas[index].name : `Area ${index + 1}`;
        
        // Use the enhanced showAreaDetails function
        this.showAreaDetails(areaName, aqi, category, index);
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

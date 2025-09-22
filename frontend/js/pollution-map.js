// Interactive Pollution Map for AirWatch AI

class PollutionMap {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.data = [];
        this.currentLayer = 'aqi';
        this.currentTime = 'current';
        this.mousePosition = { x: 0, y: 0 };
        this.selectedStation = null;
        this.animationId = null;
        this.init();
    }

    init() {
        this.createCanvas();
        this.setupControls();
        this.loadData();
        this.setupEventListeners();
        this.startAnimation();
    }

    createCanvas() {
        this.canvas = document.getElementById('pollutionMapCanvas');
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.canvas) return;
        
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
    }

    setupControls() {
        const layerButtons = document.querySelectorAll('.control-btn[data-layer]');
        const timeButtons = document.querySelectorAll('.control-btn[data-time]');

        layerButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                layerButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentLayer = btn.dataset.layer;
                this.updateVisualization();
            });
        });

        timeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                timeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentTime = btn.dataset.time;
                this.updateVisualization();
            });
        });
    }

    async loadData() {
        try {
            const response = await fetch('/api/overview/current-aqi');
            const data = await response.json();
            this.data = data.stations || this.generateMockData();
        } catch (error) {
            console.log('Using mock data for pollution map');
            this.data = this.generateMockData();
        }
    }

    generateMockData() {
        const stations = [];
        const locations = [
            { name: 'Central Delhi', x: 0.4, y: 0.3, aqi: 287, pm25: 145, pm10: 234 },
            { name: 'East Delhi', x: 0.6, y: 0.4, aqi: 312, pm25: 167, pm10: 289 },
            { name: 'West Delhi', x: 0.3, y: 0.5, aqi: 298, pm25: 152, pm10: 267 },
            { name: 'North Delhi', x: 0.5, y: 0.2, aqi: 275, pm25: 138, pm10: 245 },
            { name: 'South Delhi', x: 0.5, y: 0.7, aqi: 265, pm25: 128, pm10: 223 },
            { name: 'Noida', x: 0.7, y: 0.6, aqi: 334, pm25: 178, pm10: 312 },
            { name: 'Gurgaon', x: 0.2, y: 0.6, aqi: 289, pm25: 148, pm10: 256 },
            { name: 'Faridabad', x: 0.6, y: 0.8, aqi: 301, pm25: 156, pm10: 278 },
            { name: 'Ghaziabad', x: 0.8, y: 0.3, aqi: 345, pm25: 189, pm10: 334 },
            { name: 'Dwarka', x: 0.2, y: 0.4, aqi: 278, pm25: 142, pm10: 251 }
        ];

        locations.forEach(location => {
            stations.push({
                ...location,
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
                status: Math.random() > 0.1 ? 'active' : 'maintenance'
            });
        });

        return stations;
    }

    setupEventListeners() {
        if (!this.canvas) return;

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const clickY = e.clientY - rect.top;
            this.handleClick(clickX, clickY);
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.selectedStation = null;
        });
    }

    startAnimation() {
        const animate = () => {
            this.draw();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    draw() {
        if (!this.canvas || !this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw pollution heatmap
        this.drawHeatmap();
        
        // Draw stations
        this.drawStations();
        
        // Draw connections
        this.drawConnections();
        
        // Draw mouse interaction
        this.drawMouseInteraction();
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0.8)');
        gradient.addColorStop(1, 'rgba(30, 41, 59, 0.8)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawHeatmap() {
        this.data.forEach(station => {
            const x = station.x * this.canvas.width;
            const y = station.y * this.canvas.height;
            const value = this.getStationValue(station);
            const color = this.getValueColor(value);
            
            // Create radial gradient for heatmap effect
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 80);
            gradient.addColorStop(0, color + '40');
            gradient.addColorStop(0.5, color + '20');
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 80, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    drawStations() {
        this.data.forEach(station => {
            const x = station.x * this.canvas.width;
            const y = station.y * this.canvas.height;
            const value = this.getStationValue(station);
            const color = this.getValueColor(value);
            const size = this.getStationSize(value);
            
            // Draw station circle
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw station border
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw pulsing effect for active stations
            if (station.status === 'active') {
                const time = Date.now() * 0.005;
                const pulseSize = size + Math.sin(time + station.x * 10) * 3;
                this.ctx.globalAlpha = 0.3;
                this.ctx.fillStyle = color;
                this.ctx.beginPath();
                this.ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.globalAlpha = 1;
            }
            
            // Draw station label if selected or near mouse
            const distance = Math.sqrt(
                Math.pow(this.mousePosition.x - x, 2) + 
                Math.pow(this.mousePosition.y - y, 2)
            );
            
            if (distance < 50 || this.selectedStation === station) {
                this.drawStationLabel(station, x, y, value);
            }
        });
    }

    drawStationLabel(station, x, y, value) {
        const label = `${station.name}\n${this.currentLayer.toUpperCase()}: ${value}`;
        const lines = label.split('\n');
        const lineHeight = 16;
        const padding = 8;
        
        // Calculate label dimensions
        this.ctx.font = '12px Inter, sans-serif';
        const textWidth = Math.max(...lines.map(line => this.ctx.measureText(line).width));
        const labelWidth = textWidth + padding * 2;
        const labelHeight = lines.length * lineHeight + padding * 2;
        
        // Position label
        let labelX = x + 20;
        let labelY = y - labelHeight / 2;
        
        if (labelX + labelWidth > this.canvas.width) {
            labelX = x - labelWidth - 20;
        }
        if (labelY < 0) {
            labelY = 10;
        }
        if (labelY + labelHeight > this.canvas.height) {
            labelY = this.canvas.height - labelHeight - 10;
        }
        
        // Draw label background
        this.ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        this.ctx.fillRect(labelX, labelY, labelWidth, labelHeight);
        
        // Draw label border
        this.ctx.strokeStyle = this.getValueColor(value);
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(labelX, labelY, labelWidth, labelHeight);
        
        // Draw label text
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        lines.forEach((line, index) => {
            this.ctx.fillText(line, labelX + padding, labelY + padding + index * lineHeight);
        });
    }

    drawConnections() {
        this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.data.length; i++) {
            for (let j = i + 1; j < this.data.length; j++) {
                const dx = this.data[i].x - this.data[j].x;
                const dy = this.data[i].y - this.data[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 0.3) {
                    const x1 = this.data[i].x * this.canvas.width;
                    const y1 = this.data[i].y * this.canvas.height;
                    const x2 = this.data[j].x * this.canvas.width;
                    const y2 = this.data[j].y * this.canvas.height;
                    
                    const opacity = (0.3 - distance) / 0.3 * 0.3;
                    this.ctx.globalAlpha = opacity;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, y1);
                    this.ctx.lineTo(x2, y2);
                    this.ctx.stroke();
                }
            }
        }
        this.ctx.globalAlpha = 1;
    }

    drawMouseInteraction() {
        const distance = Math.sqrt(
            Math.pow(this.mousePosition.x - this.canvas.width / 2, 2) + 
            Math.pow(this.mousePosition.y - this.canvas.height / 2, 2)
        );
        
        if (distance < 300) {
            // Mouse hover glow
            const glowGradient = this.ctx.createRadialGradient(
                this.mousePosition.x, this.mousePosition.y, 0,
                this.mousePosition.x, this.mousePosition.y, 50
            );
            glowGradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
            glowGradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(this.mousePosition.x, this.mousePosition.y, 50, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    getStationValue(station) {
        switch (this.currentLayer) {
            case 'pm25':
                return station.pm25;
            case 'pm10':
                return station.pm10;
            case 'aqi':
            default:
                return station.aqi;
        }
    }

    getValueColor(value) {
        if (this.currentLayer === 'aqi') {
            if (value <= 50) return '#10b981';
            if (value <= 100) return '#3b82f6';
            if (value <= 200) return '#f59e0b';
            if (value <= 300) return '#ef4444';
            if (value <= 400) return '#dc2626';
            return '#7c2d12';
        } else {
            // For PM2.5 and PM10, use similar color scheme
            if (value <= 25) return '#10b981';
            if (value <= 50) return '#3b82f6';
            if (value <= 100) return '#f59e0b';
            if (value <= 150) return '#ef4444';
            if (value <= 200) return '#dc2626';
            return '#7c2d12';
        }
    }

    getStationSize(value) {
        const baseSize = 8;
        const maxSize = 20;
        
        if (this.currentLayer === 'aqi') {
            return baseSize + (value / 500) * (maxSize - baseSize);
        } else {
            return baseSize + (value / 200) * (maxSize - baseSize);
        }
    }

    handleClick(x, y) {
        // Find closest station
        let closestStation = null;
        let minDistance = Infinity;
        
        this.data.forEach(station => {
            const stationX = station.x * this.canvas.width;
            const stationY = station.y * this.canvas.height;
            const distance = Math.sqrt(Math.pow(x - stationX, 2) + Math.pow(y - stationY, 2));
            
            if (distance < minDistance && distance < 30) {
                minDistance = distance;
                closestStation = station;
            }
        });
        
        if (closestStation) {
            this.selectedStation = closestStation;
            this.showStationDetails(closestStation);
        }
    }

    showStationDetails(station) {
        // Create or update station details modal
        let modal = document.getElementById('stationModal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'stationModal';
            modal.className = 'station-modal';
            document.body.appendChild(modal);
        }
        
        const value = this.getStationValue(station);
        const color = this.getValueColor(value);
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${station.name}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="station-status ${station.status}">
                        <i class="fas fa-circle"></i>
                        ${station.status.charAt(0).toUpperCase() + station.status.slice(1)}
                    </div>
                    <div class="station-metrics">
                        <div class="metric">
                            <span class="metric-label">AQI</span>
                            <span class="metric-value" style="color: ${color}">${station.aqi}</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">PM2.5</span>
                            <span class="metric-value">${station.pm25} μg/m³</span>
                        </div>
                        <div class="metric">
                            <span class="metric-label">PM10</span>
                            <span class="metric-value">${station.pm10} μg/m³</span>
                        </div>
                    </div>
                    <div class="station-actions">
                        <button class="btn-action">
                            <i class="fas fa-chart-line"></i>
                            View History
                        </button>
                        <button class="btn-action">
                            <i class="fas fa-bell"></i>
                            Set Alert
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';
        
        // Close modal functionality
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            this.selectedStation = null;
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                this.selectedStation = null;
            }
        });
    }

    updateVisualization() {
        // Update legend colors based on current layer
        this.updateLegend();
    }

    updateLegend() {
        const legend = document.querySelector('.map-legend');
        if (!legend) return;
        
        const title = legend.querySelector('.legend-title');
        title.textContent = this.currentLayer.toUpperCase() + ' Levels';
        
        const items = legend.querySelectorAll('.legend-item');
        items.forEach((item, index) => {
            const colorElement = item.querySelector('.legend-color');
            const ranges = [
                { min: 0, max: 50, color: '#10b981', label: 'Good' },
                { min: 51, max: 100, color: '#3b82f6', label: 'Satisfactory' },
                { min: 101, max: 200, color: '#f59e0b', label: 'Moderate' },
                { min: 201, max: 300, color: '#ef4444', label: 'Poor' },
                { min: 301, max: 400, color: '#dc2626', label: 'Very Poor' },
                { min: 401, max: 500, color: '#7c2d12', label: 'Severe' }
            ];
            
            if (ranges[index]) {
                const range = ranges[index];
                colorElement.style.backgroundColor = range.color;
                
                if (this.currentLayer === 'aqi') {
                    item.querySelector('span').textContent = `${range.label} (${range.min}-${range.max})`;
                } else {
                    const pmRanges = [
                        { min: 0, max: 25 },
                        { min: 26, max: 50 },
                        { min: 51, max: 100 },
                        { min: 101, max: 150 },
                        { min: 151, max: 200 },
                        { min: 201, max: 300 }
                    ];
                    const pmRange = pmRanges[index];
                    item.querySelector('span').textContent = `${range.label} (${pmRange.min}-${pmRange.max} μg/m³)`;
                }
            }
        });
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize pollution map when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PollutionMap();
});

// Add modal styles
const modalStyles = `
<style>
.station-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(10px);
}

.modal-content {
    background: rgba(15, 23, 42, 0.95);
    border: 1px solid rgba(59, 130, 246, 0.3);
    border-radius: 20px;
    padding: 2rem;
    max-width: 400px;
    width: 90%;
    backdrop-filter: blur(20px);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.3);
    animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h3 {
    color: #ffffff;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
}

.close-modal {
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

.close-modal:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
}

.station-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    padding: 0.75rem;
    border-radius: 10px;
    font-weight: 600;
}

.station-status.active {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
}

.station-status.maintenance {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
}

.station-metrics {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.metric {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.metric-label {
    color: #94a3b8;
    font-weight: 500;
}

.metric-value {
    color: #ffffff;
    font-weight: 600;
    font-size: 1.125rem;
}

.station-actions {
    display: flex;
    gap: 1rem;
}

.btn-action {
    flex: 1;
    padding: 0.75rem 1rem;
    background: rgba(59, 130, 246, 0.2);
    border: 1px solid rgba(59, 130, 246, 0.5);
    border-radius: 10px;
    color: #ffffff;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 500;
}

.btn-action:hover {
    background: rgba(59, 130, 246, 0.3);
    transform: translateY(-2px);
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', modalStyles);

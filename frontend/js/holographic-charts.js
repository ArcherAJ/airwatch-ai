// Holographic 3D Charts for AirWatch AI
class HolographicSourceChart {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.chart = null;
        this.data = null;
        this.config = null;
        this.mousePosition = { x: 0, y: 0 };
        this.isHolographic = true;
        this.particles = [];
        this.animationId = null;
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.createCanvas();
        this.setupEventListeners();
        this.startAnimation();
    }

    async loadData() {
        try {
            const response = await fetch('/api/source-analysis/impact-distribution');
            const result = await response.json();
            this.data = result.sources;
            this.config = result.chart_config;
            this.colorScheme = result.color_scheme;
            this.summary = result.summary;
            
            // Initialize particles for each data point
            this.initializeParticles();
            return true;
        } catch (error) {
            console.error('Error loading chart data:', error);
            return false;
        }
    }

    createCanvas() {
        this.container.innerHTML = `
            <div class="holographic-chart-container">
                <div class="chart-header">
                    <h3>Source Impact Distribution</h3>
                    <div class="chart-controls">
                        <button class="btn-holographic" onclick="holographicChart.toggleHolographic()">
                            <i class="fas fa-magic"></i> Toggle Holographic
                        </button>
                        <button class="btn-3d" onclick="holographicChart.toggle3D()">
                            <i class="fas fa-cube"></i> Toggle 3D
                        </button>
                        <button class="btn-refresh" onclick="holographicChart.refresh()">
                            <i class="fas fa-sync-alt"></i> Refresh
                        </button>
                    </div>
                </div>
                
                <div class="chart-wrapper">
                    <canvas id="holographic-chart-canvas" width="600" height="600"></canvas>
                    <div class="chart-overlay">
                        <div class="center-info">
                            <div class="center-title">Impact Distribution</div>
                            <div class="center-value">${this.summary.total_contribution}%</div>
                            <div class="center-subtitle">Total Pollution</div>
                        </div>
                    </div>
                </div>
                
                <div class="chart-legend holographic-legend">
                    ${this.generateHolographicLegend()}
                </div>
                
                <div class="chart-summary holographic-summary">
                    ${this.generateHolographicSummary()}
                </div>
                
                <div class="chart-details holographic-details" id="holographic-source-details">
                    <h4>Click on a segment for detailed information</h4>
                </div>
            </div>
        `;

        this.canvas = document.getElementById('holographic-chart-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = Math.min(this.centerX, this.centerY) - 60;
        this.innerRadius = this.radius * 0.6;
    }

    initializeParticles() {
        this.particles = [];
        this.data.forEach((source, index) => {
            const angle = (index / this.data.length) * Math.PI * 2;
            const particleCount = Math.floor(source.value / 2) + 5;
            
            for (let i = 0; i < particleCount; i++) {
                this.particles.push({
                    x: this.centerX + Math.cos(angle) * (this.innerRadius + (this.radius - this.innerRadius) * Math.random()),
                    y: this.centerY + Math.sin(angle) * (this.innerRadius + (this.radius - this.innerRadius) * Math.random()),
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 3 + 1,
                    color: source.color,
                    alpha: Math.random() * 0.5 + 0.3,
                    sourceIndex: index,
                    angle: angle
                });
            }
        });
    }

    setupEventListeners() {
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
            this.mousePosition.x = this.centerX;
            this.mousePosition.y = this.centerY;
        });
    }

    startAnimation() {
        const animate = () => {
            this.updateParticles();
            this.draw();
            this.animationId = requestAnimationFrame(animate);
        };
        animate();
    }

    updateParticles() {
        const mouseInfluence = 0.02;
        const holographicEffect = this.isHolographic ? 0.1 : 0.02;

        this.particles.forEach(particle => {
            // Mouse interaction
            const dx = this.mousePosition.x - particle.x;
            const dy = this.mousePosition.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100;
                particle.vx += (dx / distance) * force * mouseInfluence;
                particle.vy += (dy / distance) * force * mouseInfluence;
            }

            // Holographic floating effect
            if (this.isHolographic) {
                particle.vx += (Math.random() - 0.5) * holographicEffect;
                particle.vy += (Math.random() - 0.5) * holographicEffect;
                
                // Keep particles within bounds
                const targetAngle = particle.angle + (Math.sin(Date.now() * 0.001 + particle.sourceIndex) * 0.1);
                const targetX = this.centerX + Math.cos(targetAngle) * (this.innerRadius + (this.radius - this.innerRadius) * 0.7);
                const targetY = this.centerY + Math.sin(targetAngle) * (this.innerRadius + (this.radius - this.innerRadius) * 0.7);
                
                particle.vx += (targetX - particle.x) * 0.01;
                particle.vy += (targetY - particle.y) * 0.01;
            }

            // Apply velocity
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Damping
            particle.vx *= 0.98;
            particle.vy *= 0.98;

            // Pulsing effect
            particle.alpha = 0.3 + Math.sin(Date.now() * 0.005 + particle.sourceIndex) * 0.2;
        });
    }

    draw() {
        // Clear canvas with gradient background
        this.createGradientBackground();
        
        // Draw holographic particles
        if (this.isHolographic) {
            this.drawParticles();
        }
        
        // Draw main chart
        this.drawHolographicChart();
        
        // Draw mouse interaction effects
        this.drawMouseEffects();
        
        // Draw center information
        this.drawCenterInfo();
    }

    createGradientBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.radius + 100
        );
        
        if (this.isHolographic) {
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)');
            gradient.addColorStop(0.5, 'rgba(147, 51, 234, 0.05)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.02)');
        } else {
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.02)');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            
            // Glow effect
            const glowGradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 3
            );
            glowGradient.addColorStop(0, particle.color);
            glowGradient.addColorStop(0.5, particle.color + '80');
            glowGradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Particle core
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }

    drawHolographicChart() {
        let currentAngle = -Math.PI / 2;
        
        this.data.forEach((source, index) => {
            const sliceAngle = (source.value / 100) * Math.PI * 2;
            
            // Create holographic gradient
            const gradient = this.ctx.createLinearGradient(
                this.centerX - Math.cos(currentAngle + sliceAngle / 2) * this.radius,
                this.centerY - Math.sin(currentAngle + sliceAngle / 2) * this.radius,
                this.centerX + Math.cos(currentAngle + sliceAngle / 2) * this.radius,
                this.centerY + Math.sin(currentAngle + sliceAngle / 2) * this.radius
            );
            
            if (this.isHolographic) {
                gradient.addColorStop(0, this.addAlpha(source.color, 0.8));
                gradient.addColorStop(0.5, this.addAlpha(source.color, 0.6));
                gradient.addColorStop(1, this.addAlpha(source.color, 0.4));
            } else {
                gradient.addColorStop(0, source.color);
                gradient.addColorStop(1, this.darkenColor(source.color, 0.2));
            }
            
            // Draw outer arc with 3D effect
            this.ctx.save();
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, this.radius, currentAngle, currentAngle + sliceAngle);
            this.ctx.arc(this.centerX, this.centerY, this.innerRadius, currentAngle + sliceAngle, currentAngle, true);
            this.ctx.closePath();
            
            // Apply gradient
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            
            // Add 3D border effect
            this.ctx.strokeStyle = this.isHolographic ? 
                this.addAlpha(source.color, 0.8) : 
                this.darkenColor(source.color, 0.3);
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Add holographic glow
            if (this.isHolographic) {
                this.ctx.shadowColor = source.color;
                this.ctx.shadowBlur = 20;
                this.ctx.strokeStyle = this.addAlpha(source.color, 0.3);
                this.ctx.lineWidth = 4;
                this.ctx.stroke();
                this.ctx.shadowBlur = 0;
            }
            
            this.ctx.restore();
            
            // Draw labels with holographic effect
            this.drawHolographicLabel(source, currentAngle, sliceAngle);
            
            currentAngle += sliceAngle;
        });
    }

    drawHolographicLabel(source, startAngle, sliceAngle) {
        if (source.value < 3) return; // Skip labels for small segments
        
        const labelAngle = startAngle + sliceAngle / 2;
        const labelRadius = this.radius + 30;
        const labelX = this.centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = this.centerY + Math.sin(labelAngle) * labelRadius;
        
        this.ctx.save();
        
        // Holographic text effect
        if (this.isHolographic) {
            this.ctx.shadowColor = source.color;
            this.ctx.shadowBlur = 10;
        }
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Text outline for better visibility
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(`${source.percentage}%`, labelX, labelY);
        this.ctx.fillText(`${source.percentage}%`, labelX, labelY);
        
        this.ctx.restore();
    }

    drawMouseEffects() {
        if (this.mousePosition.x === this.centerX && this.mousePosition.y === this.centerY) return;
        
        const distance = Math.sqrt(
            Math.pow(this.mousePosition.x - this.centerX, 2) + 
            Math.pow(this.mousePosition.y - this.centerY, 2)
        );
        
        if (distance < this.radius + 50) {
            // Mouse hover glow
            this.ctx.save();
            const glowGradient = this.ctx.createRadialGradient(
                this.mousePosition.x, this.mousePosition.y, 0,
                this.mousePosition.x, this.mousePosition.y, 50
            );
            glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
            glowGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.1)');
            glowGradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = glowGradient;
            this.ctx.beginPath();
            this.ctx.arc(this.mousePosition.x, this.mousePosition.y, 50, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        }
    }

    drawCenterInfo() {
        this.ctx.save();
        
        // Center circle with holographic effect
        const centerGradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.innerRadius
        );
        
        if (this.isHolographic) {
            centerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
            centerGradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.05)');
            centerGradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
        } else {
            centerGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            centerGradient.addColorStop(1, 'rgba(240, 240, 240, 0.8)');
        }
        
        this.ctx.fillStyle = centerGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.innerRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Center border
        this.ctx.strokeStyle = this.isHolographic ? 
            'rgba(255, 255, 255, 0.3)' : 
            'rgba(200, 200, 200, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    }

    handleClick(x, y) {
        const distance = Math.sqrt(
            Math.pow(x - this.centerX, 2) + 
            Math.pow(y - this.centerY, 2)
        );
        
        if (distance > this.innerRadius && distance < this.radius) {
            const angle = Math.atan2(y - this.centerY, x - this.centerX) + Math.PI / 2;
            const normalizedAngle = angle < 0 ? angle + Math.PI * 2 : angle;
            
            let currentAngle = 0;
            for (const source of this.data) {
                const sliceAngle = (source.value / 100) * Math.PI * 2;
                if (normalizedAngle >= currentAngle && normalizedAngle < currentAngle + sliceAngle) {
                    this.showSourceDetails(source);
                    break;
                }
                currentAngle += sliceAngle;
            }
        }
    }

    async showSourceDetails(source) {
        const detailsContainer = document.getElementById('holographic-source-details');
        detailsContainer.innerHTML = '<div class="loading">Loading details...</div>';

        try {
            const response = await fetch(`/api/source-analysis/source-details/${source.name}`);
            const details = await response.json();
            this.renderHolographicDetails(details);
        } catch (error) {
            console.error('Error loading source details:', error);
            detailsContainer.innerHTML = '<div class="error">Error loading details</div>';
        }
    }

    renderHolographicDetails(details) {
        const container = document.getElementById('holographic-source-details');
        container.innerHTML = `
            <div class="holographic-details-content">
                <div class="details-header">
                    <h4>${details.name} - Holographic Analysis</h4>
                    <div class="priority-badge priority-${details.impact_level.toLowerCase()}">${details.impact_level} Priority</div>
                </div>
                
                <div class="details-grid">
                    <div class="detail-card holographic-card">
                        <div class="card-icon">📊</div>
                        <div class="card-title">Contribution</div>
                        <div class="card-value">${details.contribution}%</div>
                        <div class="card-subtitle">of total pollution</div>
                    </div>
                    
                    <div class="detail-card holographic-card">
                        <div class="card-icon">🎯</div>
                        <div class="card-title">Confidence</div>
                        <div class="card-value">${(details.confidence * 100).toFixed(1)}%</div>
                        <div class="card-subtitle">detection accuracy</div>
                    </div>
                    
                    <div class="detail-card holographic-card">
                        <div class="card-icon">📈</div>
                        <div class="card-title">Trend</div>
                        <div class="card-value trend-${details.trend_analysis.direction}">${details.trend_analysis.direction}</div>
                        <div class="card-subtitle">${details.trend_analysis.rate > 0 ? '+' : ''}${details.trend_analysis.rate}%</div>
                    </div>
                    
                    <div class="detail-card holographic-card">
                        <div class="card-icon">🏥</div>
                        <div class="card-title">Health Impact</div>
                        <div class="card-value health-${details.health_impact.toLowerCase()}">${details.health_impact}</div>
                        <div class="card-subtitle">severity level</div>
                    </div>
                </div>
                
                <div class="recommendations-section">
                    <h5>AI Recommendations</h5>
                    <div class="recommendations-list">
                        ${details.recommendations.map(rec => `
                            <div class="recommendation-item holographic-item">
                                <div class="rec-icon">💡</div>
                                <div class="rec-text">${rec}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    generateHolographicLegend() {
        return this.data.map(source => `
            <div class="legend-item holographic-legend-item" data-source="${source.name}">
                <div class="legend-glow" style="background: linear-gradient(45deg, ${source.color}, transparent);"></div>
                <div class="legend-content">
                    <div class="legend-color" style="background-color: ${source.color}; box-shadow: 0 0 20px ${source.color}40;"></div>
                    <div class="legend-info">
                        <div class="legend-name">${source.name}</div>
                        <div class="legend-value">${source.percentage}%</div>
                        <div class="legend-trend trend-${source.trend.direction}">
                            <i class="fas fa-arrow-${source.trend.direction === 'increasing' ? 'up' : 
                                source.trend.direction === 'decreasing' ? 'down' : 'right'}"></i>
                            ${source.trend.rate > 0 ? '+' : ''}${source.trend.rate}%
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    generateHolographicSummary() {
        return `
            <div class="summary-grid">
                <div class="summary-card holographic-summary-card">
                    <div class="summary-icon">🔍</div>
                    <div class="summary-value">${this.summary.total_sources}</div>
                    <div class="summary-label">Sources Detected</div>
                </div>
                <div class="summary-card holographic-summary-card">
                    <div class="summary-icon">⭐</div>
                    <div class="summary-value">${this.summary.dominant_source}</div>
                    <div class="summary-label">Dominant Source</div>
                </div>
                <div class="summary-card holographic-summary-card">
                    <div class="summary-icon">🎯</div>
                    <div class="summary-value">${this.summary.average_confidence}%</div>
                    <div class="summary-label">Avg Confidence</div>
                </div>
                <div class="summary-card holographic-summary-card">
                    <div class="summary-icon">⚠️</div>
                    <div class="summary-value">${this.summary.high_impact_sources}</div>
                    <div class="summary-label">High Impact</div>
                </div>
            </div>
        `;
    }

    toggleHolographic() {
        this.isHolographic = !this.isHolographic;
        const button = document.querySelector('.btn-holographic');
        button.innerHTML = this.isHolographic ? 
            '<i class="fas fa-magic"></i> Holographic ON' : 
            '<i class="fas fa-magic"></i> Holographic OFF';
        button.style.background = this.isHolographic ? '#8b5cf6' : '#6b7280';
    }

    toggle3D() {
        // Toggle 3D effects
        console.log('3D effects toggled');
    }

    refresh() {
        this.loadData();
    }

    addAlpha(color, alpha) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - factor));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - factor));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - factor));
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
}

// Initialize the holographic chart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('sourceChart')) {
        window.holographicChart = new HolographicSourceChart('sourceChart');
    }
});

// Add holographic CSS styles
const holographicStyles = `
<style>
.holographic-chart-container {
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
    border-radius: 20px;
    padding: 30px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
}

.holographic-chart-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.05), transparent);
    animation: holographic-shimmer 3s infinite;
    pointer-events: none;
}

@keyframes holographic-shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    position: relative;
    z-index: 2;
}

.chart-header h3 {
    color: #ffffff;
    font-size: 24px;
    font-weight: bold;
    text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    margin: 0;
}

.chart-controls {
    display: flex;
    gap: 15px;
}

.btn-holographic, .btn-3d, .btn-refresh {
    padding: 12px 20px;
    border: none;
    border-radius: 25px;
    background: linear-gradient(45deg, #3b82f6, #8b5cf6);
    color: white;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: all 0.3s ease;
    box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
    position: relative;
    overflow: hidden;
}

.btn-holographic:hover, .btn-3d:hover, .btn-refresh:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
}

.btn-holographic::before, .btn-3d::before, .btn-refresh::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
}

.btn-holographic:hover::before, .btn-3d:hover::before, .btn-refresh:hover::before {
    left: 100%;
}

.chart-wrapper {
    position: relative;
    display: flex;
    justify-content: center;
    margin-bottom: 30px;
}

#holographic-chart-canvas {
    border-radius: 50%;
    box-shadow: 0 0 50px rgba(59, 130, 246, 0.3);
    background: radial-gradient(circle, rgba(59, 130, 246, 0.1), rgba(0, 0, 0, 0.1));
}

.chart-overlay {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    pointer-events: none;
    z-index: 10;
}

.center-info {
    background: rgba(0, 0, 0, 0.7);
    padding: 20px;
    border-radius: 50%;
    backdrop-filter: blur(10px);
    border: 2px solid rgba(255, 255, 255, 0.2);
    min-width: 120px;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.center-title {
    color: #ffffff;
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 5px;
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

.center-value {
    color: #3b82f6;
    font-size: 24px;
    font-weight: bold;
    text-shadow: 0 0 15px rgba(59, 130, 246, 0.8);
}

.center-subtitle {
    color: #94a3b8;
    font-size: 12px;
    margin-top: 5px;
}

.holographic-legend {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    margin-bottom: 30px;
}

.holographic-legend-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 15px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.holographic-legend-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
}

.legend-glow {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.1;
    border-radius: 15px;
}

.legend-content {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 2;
}

.legend-color {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-right: 15px;
    border: 2px solid rgba(255, 255, 255, 0.3);
}

.legend-info {
    flex: 1;
}

.legend-name {
    color: #ffffff;
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 5px;
}

.legend-value {
    color: #3b82f6;
    font-size: 18px;
    font-weight: bold;
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

.legend-trend {
    font-size: 12px;
    font-weight: bold;
    margin-top: 5px;
}

.trend-increasing {
    color: #ef4444;
}

.trend-decreasing {
    color: #10b981;
}

.trend-stable {
    color: #6b7280;
}

.holographic-summary {
    margin-bottom: 30px;
}

.summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
}

.holographic-summary-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 25px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.holographic-summary-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.holographic-summary-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.holographic-summary-card:hover::before {
    opacity: 1;
}

.summary-icon {
    font-size: 32px;
    margin-bottom: 15px;
    filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
}

.summary-value {
    color: #ffffff;
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 10px;
    text-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
}

.summary-label {
    color: #94a3b8;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.holographic-details {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 30px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
}

.holographic-details-content {
    color: #ffffff;
}

.details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.details-header h4 {
    color: #ffffff;
    font-size: 20px;
    margin: 0;
    text-shadow: 0 0 15px rgba(59, 130, 246, 0.5);
}

.priority-badge {
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
}

.priority-high {
    background: linear-gradient(45deg, #ef4444, #dc2626);
    color: white;
    box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}

.priority-medium {
    background: linear-gradient(45deg, #f59e0b, #d97706);
    color: white;
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
}

.priority-low {
    background: linear-gradient(45deg, #10b981, #059669);
    color: white;
    box-shadow: 0 0 20px rgba(16, 185, 129, 0.3);
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 25px;
}

.holographic-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    padding: 20px;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
}

.holographic-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.card-icon {
    font-size: 24px;
    margin-bottom: 10px;
    filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.5));
}

.card-title {
    color: #94a3b8;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 8px;
}

.card-value {
    color: #ffffff;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 5px;
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

.card-subtitle {
    color: #64748b;
    font-size: 11px;
}

.trend-increasing {
    color: #ef4444;
}

.trend-decreasing {
    color: #10b981;
}

.health-severe, .health-high {
    color: #ef4444;
}

.health-medium {
    color: #f59e0b;
}

.health-low {
    color: #10b981;
}

.recommendations-section h5 {
    color: #ffffff;
    font-size: 18px;
    margin-bottom: 15px;
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}

.recommendations-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.holographic-item {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 15px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    gap: 15px;
    transition: all 0.3s ease;
}

.holographic-item:hover {
    transform: translateX(10px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.rec-icon {
    font-size: 20px;
    filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.5));
}

.rec-text {
    color: #e2e8f0;
    font-size: 14px;
    line-height: 1.5;
}

.loading {
    text-align: center;
    padding: 40px;
    color: #94a3b8;
    font-style: italic;
}

.error {
    text-align: center;
    padding: 20px;
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 10px;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

/* Responsive design */
@media (max-width: 768px) {
    .holographic-chart-container {
        padding: 20px;
    }
    
    .chart-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }
    
    .chart-controls {
        justify-content: center;
    }
    
    .holographic-legend {
        grid-template-columns: 1fr;
    }
    
    .summary-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .details-grid {
        grid-template-columns: 1fr;
    }
}
</style>
`;

// Inject holographic styles
document.head.insertAdjacentHTML('beforeend', holographicStyles);

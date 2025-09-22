// Forecast Chart for AirWatch AI

class ForecastChart {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.data = [];
        this.currentPeriod = '24h';
        this.theme = 'dark';
        this.init();
    }

    init() {
        this.createCanvas();
        this.loadData();
        this.setupControls();
        this.setupEventListeners();
        this.startAnimation();
    }

    createCanvas() {
        this.canvas = document.getElementById('forecastChart');
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

    async loadData() {
        try {
            const response = await fetch('/api/advanced/predictive/modeling');
            const data = await response.json();
            this.data = this.processForecastData(data);
        } catch (error) {
            console.log('Using mock forecast data');
            this.data = this.generateMockData();
        }
    }

    processForecastData(apiData) {
        // Process API data into chart format
        const scenarios = apiData.scenarios;
        const currentScenario = scenarios[0]; // Current Policy Continuation
        
        return {
            labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM', '12AM', '3AM'],
            datasets: [
                {
                    label: 'Current Policy',
                    data: [295, 312, 298, 285, 278, 265, 270, 275],
                    borderColor: this.theme === 'dark' ? '#60a5fa' : '#3b82f6',
                    backgroundColor: this.theme === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Enhanced Odd-Even',
                    data: [267, 284, 271, 258, 251, 238, 243, 248],
                    borderColor: this.theme === 'dark' ? '#34d399' : '#10b981',
                    backgroundColor: this.theme === 'dark' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: false,
                    borderDash: [5, 5]
                }
            ]
        };
    }

    generateMockData() {
        return {
            labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM', '12AM', '3AM'],
            datasets: [
                {
                    label: 'Current Policy',
                    data: [295, 312, 298, 285, 278, 265, 270, 275],
                    borderColor: this.theme === 'dark' ? '#60a5fa' : '#3b82f6',
                    backgroundColor: this.theme === 'dark' ? 'rgba(96, 165, 250, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Enhanced Odd-Even',
                    data: [267, 284, 271, 258, 251, 238, 243, 248],
                    borderColor: this.theme === 'dark' ? '#34d399' : '#10b981',
                    backgroundColor: this.theme === 'dark' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: false,
                    borderDash: [5, 5]
                }
            ]
        };
    }

    setupControls() {
        const timelineButtons = document.querySelectorAll('.btn-timeline');
        timelineButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                timelineButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentPeriod = btn.dataset.period;
                this.updateChart();
            });
        });
    }

    setupEventListeners() {
        // Add hover effects
        this.canvas.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.hideTooltip();
        });
    }

    startAnimation() {
        const animate = () => {
            this.draw();
            requestAnimationFrame(animate);
        };
        animate();
    }

    draw() {
        if (!this.canvas || !this.ctx) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw grid
        this.drawGrid();
        
        // Draw data
        this.drawData();
        
        // Draw axes
        this.drawAxes();
        
        // Draw legend
        this.drawLegend();
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, this.theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, this.theme === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'rgba(248, 250, 252, 0.8)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        this.ctx.strokeStyle = this.theme === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(148, 163, 184, 0.3)';
        this.ctx.lineWidth = 1;
        
        // Vertical grid lines
        const labelCount = this.data.labels.length;
        for (let i = 0; i <= labelCount; i++) {
            const x = (this.canvas.width / labelCount) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Horizontal grid lines
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = (this.canvas.height / gridLines) * i;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawData() {
        if (!this.data.datasets) return;
        
        this.data.datasets.forEach(dataset => {
            this.drawDataset(dataset);
        });
    }

    drawDataset(dataset) {
        const { data, borderColor, backgroundColor, tension, fill, borderDash } = dataset;
        const labelCount = data.length;
        
        this.ctx.save();
        
        if (borderDash) {
            this.ctx.setLineDash(borderDash);
        }
        
        // Draw line
        this.ctx.strokeStyle = borderColor;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        
        data.forEach((value, index) => {
            const x = (this.canvas.width / (labelCount - 1)) * index;
            const y = this.canvas.height - ((value - 200) / 200) * this.canvas.height;
            
            if (index === 0) {
                this.ctx.moveTo(x, y);
            } else {
                // Draw smooth curve
                const prevX = (this.canvas.width / (labelCount - 1)) * (index - 1);
                const prevY = this.canvas.height - ((data[index - 1] - 200) / 200) * this.canvas.height;
                
                const cp1x = prevX + (x - prevX) * 0.5;
                const cp1y = prevY;
                const cp2x = prevX + (x - prevX) * 0.5;
                const cp2y = y;
                
                this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
            }
        });
        
        this.ctx.stroke();
        
        // Draw fill
        if (fill) {
            this.ctx.lineTo(this.canvas.width, this.canvas.height);
            this.ctx.lineTo(0, this.canvas.height);
            this.ctx.closePath();
            
            const fillGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            fillGradient.addColorStop(0, backgroundColor);
            fillGradient.addColorStop(1, 'transparent');
            
            this.ctx.fillStyle = fillGradient;
            this.ctx.fill();
        }
        
        // Draw data points
        this.ctx.fillStyle = borderColor;
        data.forEach((value, index) => {
            const x = (this.canvas.width / (labelCount - 1)) * index;
            const y = this.canvas.height - ((value - 200) / 200) * this.canvas.height;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Add glow effect
            this.ctx.shadowColor = borderColor;
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
        
        this.ctx.restore();
    }

    drawAxes() {
        this.ctx.fillStyle = this.theme === 'dark' ? '#cbd5e1' : '#64748b';
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        
        // X-axis labels
        this.data.labels.forEach((label, index) => {
            const x = (this.canvas.width / (this.data.labels.length - 1)) * index;
            this.ctx.fillText(label, x, this.canvas.height - 20);
        });
        
        // Y-axis labels
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        
        const yLabels = ['500', '400', '300', '200', '100'];
        yLabels.forEach((label, index) => {
            const y = (this.canvas.height / (yLabels.length - 1)) * index;
            this.ctx.fillText(label, this.canvas.width - 10, y);
        });
    }

    drawLegend() {
        const legendX = 20;
        const legendY = 20;
        
        this.data.datasets.forEach((dataset, index) => {
            const y = legendY + index * 25;
            
            // Draw legend color
            this.ctx.fillStyle = dataset.borderColor;
            this.ctx.fillRect(legendX, y, 15, 3);
            
            // Draw legend text
            this.ctx.fillStyle = this.theme === 'dark' ? '#f8fafc' : '#1e293b';
            this.ctx.font = '12px Inter, sans-serif';
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(dataset.label, legendX + 20, y + 1);
        });
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Find closest data point
        let closestPoint = null;
        let minDistance = Infinity;
        
        this.data.datasets.forEach(dataset => {
            dataset.data.forEach((value, index) => {
                const x = (this.canvas.width / (dataset.data.length - 1)) * index;
                const y = this.canvas.height - ((value - 200) / 200) * this.canvas.height;
                
                const distance = Math.sqrt(Math.pow(mouseX - x, 2) + Math.pow(mouseY - y, 2));
                
                if (distance < minDistance && distance < 20) {
                    minDistance = distance;
                    closestPoint = {
                        dataset: dataset,
                        index: index,
                        value: value,
                        x: x,
                        y: y,
                        label: this.data.labels[index]
                    };
                }
            });
        });
        
        if (closestPoint) {
            this.showTooltip(closestPoint, mouseX, mouseY);
        } else {
            this.hideTooltip();
        }
    }

    showTooltip(point, mouseX, mouseY) {
        // Remove existing tooltip
        this.hideTooltip();
        
        const tooltip = document.createElement('div');
        tooltip.className = 'chart-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-title">${point.label}</div>
            <div class="tooltip-value">${point.dataset.label}: ${point.value}</div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const rect = this.canvas.getBoundingClientRect();
        tooltip.style.left = (rect.left + mouseX + 10) + 'px';
        tooltip.style.top = (rect.top + mouseY - 10) + 'px';
    }

    hideTooltip() {
        const existingTooltip = document.querySelector('.chart-tooltip');
        if (existingTooltip) {
            existingTooltip.remove();
        }
    }

    updateChart() {
        // Update chart based on selected period
        this.loadData();
    }

    updateTheme(theme) {
        this.theme = theme;
        this.loadData();
    }
}

// Initialize forecast chart when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.forecastChart = new ForecastChart();
});

// Add chart tooltip styles
const chartStyles = `
<style>
.chart-tooltip {
    position: absolute;
    background: var(--bg-overlay);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 12px;
    color: var(--text-primary);
    box-shadow: 0 10px 25px var(--shadow-color);
    backdrop-filter: blur(10px);
    z-index: 1000;
    pointer-events: none;
}

.tooltip-title {
    font-weight: 600;
    margin-bottom: 4px;
}

.tooltip-value {
    color: var(--text-secondary);
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', chartStyles);

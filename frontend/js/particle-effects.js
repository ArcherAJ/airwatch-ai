// Particle Effects for Holographic Charts
class ParticleSystem {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.mousePosition = { x: 0, y: 0 };
        this.isActive = true;
        
        this.init();
    }

    init() {
        this.createParticleCanvas();
        this.createParticles();
        this.setupEventListeners();
        this.startAnimation();
    }

    createParticleCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        this.canvas.style.opacity = '0.8';
        
        // Set canvas size to match container
        const resizeCanvas = () => {
            const rect = this.container.getBoundingClientRect();
            this.canvas.width = rect.width;
            this.canvas.height = rect.height;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
    }

    createParticles() {
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                color: this.getRandomHolographicColor(),
                alpha: Math.random() * 0.5 + 0.3,
                life: 1.0,
                maxLife: 1.0,
                type: Math.random() > 0.5 ? 'glow' : 'sparkle'
            });
        }
    }

    getRandomHolographicColor() {
        const colors = [
            '#3b82f6', // Blue
            '#8b5cf6', // Purple
            '#06b6d4', // Cyan
            '#10b981', // Emerald
            '#f59e0b', // Amber
            '#ef4444'  // Red
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePosition.x = e.clientX - rect.left;
            this.mousePosition.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mousePosition.x = this.canvas.width / 2;
            this.mousePosition.y = this.canvas.height / 2;
        });
    }

    startAnimation() {
        const animate = () => {
            if (this.isActive) {
                this.updateParticles();
                this.drawParticles();
                this.animationId = requestAnimationFrame(animate);
            }
        };
        animate();
    }

    updateParticles() {
        this.particles.forEach((particle, index) => {
            // Mouse interaction
            const dx = this.mousePosition.x - particle.x;
            const dy = this.mousePosition.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
                const force = (100 - distance) / 100 * 0.01;
                particle.vx += (dx / distance) * force;
                particle.vy += (dy / distance) * force;
            }

            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Boundary wrapping
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;

            // Damping
            particle.vx *= 0.99;
            particle.vy *= 0.99;

            // Life cycle
            particle.life -= 0.005;
            if (particle.life <= 0) {
                this.resetParticle(particle);
            }

            // Pulsing effect
            particle.alpha = (particle.life / particle.maxLife) * 0.8;
        });
    }

    resetParticle(particle) {
        particle.x = Math.random() * this.canvas.width;
        particle.y = Math.random() * this.canvas.height;
        particle.vx = (Math.random() - 0.5) * 0.5;
        particle.vy = (Math.random() - 0.5) * 0.5;
        particle.life = 1.0;
        particle.color = this.getRandomHolographicColor();
    }

    drawParticles() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            
            if (particle.type === 'glow') {
                this.drawGlowParticle(particle);
            } else {
                this.drawSparkleParticle(particle);
            }
            
            this.ctx.restore();
        });
    }

    drawGlowParticle(particle) {
        // Outer glow
        const glowGradient = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 4
        );
        glowGradient.addColorStop(0, particle.color);
        glowGradient.addColorStop(0.5, particle.color + '80');
        glowGradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = glowGradient;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Core particle
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawSparkleParticle(particle) {
        const time = Date.now() * 0.005;
        const sparkleSize = particle.size + Math.sin(time + particle.x * 0.01) * 0.5;
        
        // Draw sparkle cross
        this.ctx.strokeStyle = particle.color;
        this.ctx.lineWidth = 1;
        this.ctx.lineCap = 'round';
        
        // Horizontal line
        this.ctx.beginPath();
        this.ctx.moveTo(particle.x - sparkleSize, particle.y);
        this.ctx.lineTo(particle.x + sparkleSize, particle.y);
        this.ctx.stroke();
        
        // Vertical line
        this.ctx.beginPath();
        this.ctx.moveTo(particle.x, particle.y - sparkleSize);
        this.ctx.lineTo(particle.x, particle.y + sparkleSize);
        this.ctx.stroke();
        
        // Center dot
        this.ctx.fillStyle = particle.color;
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, 1, 0, Math.PI * 2);
        this.ctx.fill();
    }

    pause() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    resume() {
        this.isActive = true;
        this.startAnimation();
    }

    destroy() {
        this.pause();
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }
}

// Enhanced holographic chart with particle effects
class EnhancedHolographicChart extends HolographicSourceChart {
    constructor(containerId) {
        super(containerId);
        this.particleSystem = null;
    }

    async init() {
        await this.loadData();
        this.createCanvas();
        this.setupEventListeners();
        this.startAnimation();
        this.initParticleSystem();
    }

    initParticleSystem() {
        // Add particle system to the chart wrapper
        const chartWrapper = this.container.querySelector('.chart-wrapper');
        if (chartWrapper) {
            this.particleSystem = new ParticleSystem('sourceChart');
        }
    }

    toggleHolographic() {
        super.toggleHolographic();
        
        // Toggle particle effects
        if (this.particleSystem) {
            if (this.isHolographic) {
                this.particleSystem.resume();
            } else {
                this.particleSystem.pause();
            }
        }
    }

    destroy() {
        if (this.particleSystem) {
            this.particleSystem.destroy();
        }
        super.destroy();
    }
}

// Initialize enhanced holographic chart
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('sourceChart')) {
        window.holographicChart = new EnhancedHolographicChart('sourceChart');
    }
});

// Add particle system styles
const particleStyles = `
<style>
.particle-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    opacity: 0.8;
}

.chart-wrapper {
    position: relative;
    overflow: hidden;
}

.holographic-particles-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 2;
    background: 
        radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.05) 0%, transparent 50%),
        radial-gradient(circle at 40% 60%, rgba(16, 185, 129, 0.03) 0%, transparent 50%);
    animation: particle-ambient 10s ease-in-out infinite;
}

@keyframes particle-ambient {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(1.05); }
}

/* Particle interaction effects */
.particle-interaction {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent);
    pointer-events: none;
    z-index: 3;
    animation: particle-interaction-pulse 2s ease-in-out infinite;
}

@keyframes particle-interaction-pulse {
    0%, 100% { 
        transform: scale(0.8); 
        opacity: 0.3; 
    }
    50% { 
        transform: scale(1.2); 
        opacity: 0.1; 
    }
}

/* Enhanced holographic effects for particle integration */
.holographic-chart-container.with-particles {
    background: linear-gradient(135deg, 
        rgba(15, 23, 42, 0.98), 
        rgba(30, 41, 59, 0.98), 
        rgba(51, 65, 85, 0.98));
    box-shadow: 
        0 0 100px rgba(59, 130, 246, 0.2),
        inset 0 0 100px rgba(255, 255, 255, 0.05);
}

.holographic-chart-container.with-particles::before {
    background: 
        radial-gradient(circle at 10% 10%, rgba(59, 130, 246, 0.1) 0%, transparent 30%),
        radial-gradient(circle at 90% 90%, rgba(147, 51, 234, 0.1) 0%, transparent 30%),
        radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 40%);
    animation: holographic-particles-shimmer 5s ease-in-out infinite;
}

@keyframes holographic-particles-shimmer {
    0%, 100% { opacity: 0.2; }
    50% { opacity: 0.4; }
}
</style>
`;

// Inject particle styles
document.head.insertAdjacentHTML('beforeend', particleStyles);

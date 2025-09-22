// Community Page JavaScript - Optimized
class CommunityDashboard {
    constructor() {
        this.currentUser = null;
        this.communityData = null;
        this.impactChart = null;
        this.updateInterval = null;
        this.isInitialized = false;
        
        // Initialize immediately with fallback data
        this.initWithFallback();
    }

    async initWithFallback() {
        // Show loading state
        this.showLoadingState();
        
        // Setup basic UI first
        this.setupEventListeners();
        this.setupBasicAnimations();
        
        // Load data in background
        try {
            await this.loadCommunityData();
        } catch (error) {
            console.warn('Using fallback data:', error);
            this.loadFallbackData();
        }
        
        // Initialize charts after data is ready
        this.initializeCharts();
        this.startRealTimeUpdates();
        this.isInitialized = true;
    }

    showLoadingState() {
        // Add loading indicators to key elements
        const elements = [
            '.challenges-list',
            '.leaderboard-list', 
            '.discussions-list',
            '.achievements-grid',
            '.impact-metrics'
        ];
        
        elements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.innerHTML = '<div class="loading-skeleton"></div>';
            }
        });
    }

    loadFallbackData() {
        // Fallback data for immediate display
        this.communityData = {
            gamification_stats: {
                user_level: "Air Quality Expert",
                user_points: 8750,
                user_badges: 7,
                next_level_points: 1250,
                contribution_streak: 12
            },
            challenges: [
                {
                    id: "clean_air_week",
                    title: "Clean Air Week Challenge",
                    description: "Report air quality issues in your area",
                    progress: 75,
                    target: 100,
                    reward: "Clean Air Champion Badge"
                }
            ],
            leaderboard: [
                { rank: 1, username: "EcoWarrior7", points: 12345, badges: 12, location: "South Delhi" },
                { rank: 2, username: "GreenCitizen", points: 11200, badges: 10, location: "Central Delhi" }
            ],
            discussions: [
                {
                    id: "disc_1",
                    title: "Best air purifiers for Delhi homes",
                    author: "CleanAirLover",
                    replies: 23,
                    views: 456,
                    last_activity: new Date().toISOString(),
                    tags: ["air-purifier", "home"]
                }
            ],
            user_achievements: [
                {
                    badge: "First Report",
                    description: "Submitted your first pollution report",
                    earned_date: "2024-01-10",
                    icon: "fas fa-flag"
                }
            ],
            community_impact: {
                total_reports_submitted: 25000,
                issues_resolved: 18500,
                active_contributors: 1250,
                total_points_earned: 456789
            }
        };
        
        this.updateDashboard(this.communityData);
    }

    async loadCommunityData() {
        try {
            // Set timeout for API call
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
            
            const response = await fetch('/api/citizen-portal/community-engagement', {
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

            this.communityData = data;
            this.currentUser = data.gamification_stats;
            this.updateDashboard(data);
            
        } catch (error) {
            console.error('Error loading community data:', error);
            throw error; // Re-throw to trigger fallback
        }
    }

    updateDashboard(data) {
        // Update user profile
        this.updateUserProfile(data.gamification_stats);
        
        // Update challenges
        this.updateChallenges(data.challenges);
        
        // Update leaderboard
        this.updateLeaderboard(data.leaderboard);
        
        // Update discussions
        this.updateDiscussions(data.discussions);
        
        // Update achievements
        this.updateAchievements(data.user_achievements);
        
        // Update community impact
        this.updateCommunityImpact(data.community_impact);
        
        // Update activity feed
        this.updateActivityFeed();
    }

    updateUserProfile(userStats) {
        document.getElementById('userName').textContent = 'EcoWarrior7'; // Mock username
        document.getElementById('userLevel').textContent = userStats.user_level;
        document.getElementById('userPoints').textContent = userStats.user_points.toLocaleString();
        document.getElementById('userBadges').textContent = userStats.user_badges;
        document.getElementById('userStreak').textContent = userStats.contribution_streak;
        
        // Update level progress
        const progressFill = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        const progressPercent = (userStats.user_points / (userStats.user_points + userStats.next_level_points)) * 100;
        
        progressFill.style.width = `${progressPercent}%`;
        progressText.textContent = `${userStats.next_level_points.toLocaleString()} points to go`;
    }

    updateChallenges(challenges) {
        const challengesList = document.getElementById('challengesList');
        const challengeCount = document.getElementById('challengeCount');
        
        challengeCount.textContent = `${challenges.length} Active`;
        
        challengesList.innerHTML = challenges.map(challenge => `
            <div class="challenge-item">
                <div class="challenge-icon">
                    <i class="fas fa-${this.getChallengeIcon(challenge.id)}"></i>
                </div>
                <div class="challenge-content">
                    <h4>${challenge.title}</h4>
                    <p>${challenge.description}</p>
                    <div class="challenge-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(challenge.progress / challenge.target) * 100}%"></div>
                        </div>
                        <span class="progress-text">${challenge.progress}/${challenge.target}</span>
                    </div>
                    <div class="challenge-reward">
                        <i class="fas fa-gift"></i>
                        <span>${challenge.reward}</span>
                    </div>
                </div>
                <div class="challenge-actions">
                    <button class="btn-primary btn-sm" onclick="this.continueChallenge('${challenge.id}')">Continue</button>
                </div>
            </div>
        `).join('');
    }

    updateLeaderboard(leaderboard) {
        const leaderboardList = document.getElementById('leaderboardList');
        
        leaderboardList.innerHTML = leaderboard.map((user, index) => `
            <div class="leaderboard-item rank-${index + 1}">
                <div class="rank">${user.rank}</div>
                <div class="user-info">
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="user-details">
                        <h4>${user.username}</h4>
                        <p>${user.location}</p>
                    </div>
                </div>
                <div class="user-score">
                    <span class="points">${user.points.toLocaleString()}</span>
                    <span class="badges">${user.badges} badges</span>
                </div>
            </div>
        `).join('');
    }

    updateDiscussions(discussions) {
        const discussionsList = document.getElementById('discussionsList');
        
        discussionsList.innerHTML = discussions.map(discussion => `
            <div class="discussion-item" onclick="this.openDiscussion('${discussion.id}')">
                <div class="discussion-header">
                    <h4>${discussion.title}</h4>
                    <span class="discussion-stats">
                        <i class="fas fa-comment"></i> ${discussion.replies} replies
                        <i class="fas fa-eye"></i> ${discussion.views} views
                    </span>
                </div>
                <div class="discussion-meta">
                    <span class="author">${discussion.author}</span>
                    <span class="time">${this.formatTimeAgo(discussion.last_activity)}</span>
                    <div class="tags">
                        ${discussion.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateAchievements(achievements) {
        const achievementsGrid = document.getElementById('achievementsGrid');
        const achievementCount = document.getElementById('achievementCount');
        
        achievementCount.textContent = `${achievements.length} Badges`;
        
        achievementsGrid.innerHTML = achievements.map(achievement => `
            <div class="achievement-item earned">
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-content">
                    <h4>${achievement.badge}</h4>
                    <p>${achievement.description}</p>
                    <span class="achievement-date">${this.formatDate(achievement.earned_date)}</span>
                </div>
            </div>
        `).join('');
    }

    updateCommunityImpact(impact) {
        // Update impact metrics
        document.getElementById('totalReports').textContent = impact.total_reports_submitted.toLocaleString();
        document.getElementById('issuesResolved').textContent = impact.issues_resolved.toLocaleString();
        document.getElementById('activeContributors').textContent = impact.active_contributors.toLocaleString();
        document.getElementById('totalPoints').textContent = impact.total_points_earned.toLocaleString();
        
        // Update impact chart
        this.updateImpactChart(impact);
    }

    updateImpactChart(impact) {
        if (!this.impactChart) return;

        const data = {
            labels: ['Reports', 'Resolved', 'Contributors', 'Points'],
            datasets: [{
                data: [
                    impact.total_reports_submitted,
                    impact.issues_resolved,
                    impact.active_contributors,
                    impact.total_points_earned / 1000 // Scale down for chart
                ],
                backgroundColor: [
                    '#3b82f6',
                    '#10b981',
                    '#f59e0b',
                    '#8b5cf6'
                ],
                borderWidth: 0
            }]
        };

        this.impactChart.data = data;
        this.impactChart.update();
    }

    updateActivityFeed() {
        // Mock activity feed data
        const activities = [
            {
                type: 'report',
                user: 'You',
                action: 'submitted a pollution report for',
                location: 'Central Delhi',
                time: '2 hours ago',
                icon: 'fas fa-file-alt'
            },
            {
                type: 'challenge',
                user: 'EcoWarrior7',
                action: 'completed the',
                challenge: 'Clean Air Week Challenge',
                time: '4 hours ago',
                icon: 'fas fa-trophy'
            },
            {
                type: 'discussion',
                user: 'GreenCitizen',
                action: 'replied to',
                discussion: 'Best air purifiers for Delhi homes',
                time: '6 hours ago',
                icon: 'fas fa-comment'
            },
            {
                type: 'achievement',
                user: 'AirGuardian',
                action: 'earned the',
                badge: 'Data Contributor badge',
                time: '8 hours ago',
                icon: 'fas fa-medal'
            }
        ];

        const activityFeed = document.getElementById('activityFeed');
        activityFeed.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <p><strong>${activity.user}</strong> ${activity.action} <strong>${activity.location || activity.challenge || activity.discussion || activity.badge}</strong></p>
                    <span class="activity-time">${activity.time}</span>
                </div>
            </div>
        `).join('');
    }

    initializeCharts() {
        // Lazy load charts only when Chart.js is available
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded, skipping chart initialization');
            return;
        }

        // Impact chart
        const ctx = document.getElementById('impactChart');
        if (ctx) {
            try {
                this.impactChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Reports', 'Resolved', 'Contributors', 'Points'],
                        datasets: [{
                            data: [25000, 18500, 1250, 456],
                            backgroundColor: [
                                '#3b82f6',
                                '#10b981',
                                '#f59e0b',
                                '#8b5cf6'
                            ],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: {
                            duration: 1000,
                            easing: 'easeInOutQuart'
                        },
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
            } catch (error) {
                console.error('Error initializing chart:', error);
            }
        }
    }

    setupEventListeners() {
        // New discussion button
        document.getElementById('newDiscussionBtn').addEventListener('click', () => {
            this.showNewDiscussionModal();
        });

        // Activity filter
        document.getElementById('activityFilter').addEventListener('change', (e) => {
            this.filterActivity(e.target.value);
        });

        // Challenge continue buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-primary') && e.target.textContent.includes('Continue')) {
                this.continueChallenge(e.target.dataset.challengeId);
            }
        });
    }

    startRealTimeUpdates() {
        // Update every 2 minutes
        this.updateInterval = setInterval(() => {
            this.loadCommunityData();
        }, 2 * 60 * 1000);
    }

    setupBasicAnimations() {
        // Basic CSS animations without GSAP dependency
        const elements = document.querySelectorAll('.hero-content, .hero-stats .stat-item, .profile-card, .dashboard-card');
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

            gsap.from('.profile-card', {
                duration: 0.6,
                y: 30,
                opacity: 0,
                delay: 0.8,
                ease: 'power2.out'
            });

            gsap.from('.dashboard-card', {
                duration: 0.6,
                y: 30,
                opacity: 0,
                stagger: 0.1,
                delay: 1.0,
                ease: 'power2.out'
            });

            gsap.to('.community-animation .avatar', {
                duration: 2,
                y: -10,
                repeat: -1,
                yoyo: true,
                stagger: 0.5,
                ease: 'power2.inOut'
            });

            gsap.to('.connection-lines .line', {
                duration: 1.5,
                scaleX: 1,
                repeat: -1,
                yoyo: true,
                stagger: 0.3,
                ease: 'power2.inOut'
            });
        }
    }

    // Helper methods
    getChallengeIcon(challengeId) {
        const icons = {
            'clean_air_week': 'leaf',
            'eco_warrior': 'recycle',
            'health_advocate': 'heart'
        };
        return icons[challengeId] || 'trophy';
    }

    formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hours ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    }

    showNewDiscussionModal() {
        // Implement new discussion modal
        console.log('Opening new discussion modal');
    }

    filterActivity(filter) {
        // Implement activity filtering
        console.log('Filtering activity by:', filter);
    }

    continueChallenge(challengeId) {
        // Implement challenge continuation
        console.log('Continuing challenge:', challengeId);
    }

    openDiscussion(discussionId) {
        // Implement discussion opening
        console.log('Opening discussion:', discussionId);
    }

    showError(message) {
        console.error(message);
        // You could implement a toast notification here
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CommunityDashboard();
});

// Simple Navigation Functions for AirWatch AI

// Global navigation state
let currentPage = 'index.html';
let navigationHistory = [];

// Scroll to section function
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Update URL hash
        window.history.pushState({}, '', `#${sectionId}`);
        
        // Add to navigation history
        navigationHistory.push(sectionId);
        
        console.log(`Scrolled to section: ${sectionId}`);
    } else {
        console.warn(`Section with id '${sectionId}' not found`);
    }
}

// Navigate to specific page
function navigateToPage(page) {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    
    // Add current page to history
    if (currentPath !== page) {
        navigationHistory.push(currentPath);
    }
    
    switch(page) {
        case 'overview':
            window.location.href = 'index.html';
            break;
        case 'source-analysis':
            window.location.href = 'source_analysis.html';
            break;
        case 'forecasting':
            window.location.href = 'forecasting.html';
            break;
        case 'community':
            window.location.href = 'citizen_portal.html';
            break;
        case 'policy-dashboard':
            window.location.href = 'policy_dashboard.html';
            break;
        default:
            console.warn(`Unknown page: ${page}`);
    }
}

// Go back to previous page/section
function goBack() {
    if (navigationHistory.length > 0) {
        const previousPage = navigationHistory.pop();
        console.log(`Going back to: ${previousPage}`);
        
        if (previousPage.includes('#')) {
            // It's a section, scroll to it
            const sectionId = previousPage.split('#')[1];
            scrollToSection(sectionId);
        } else {
            // It's a page, navigate to it
            navigateToPage(previousPage);
        }
    } else {
        // No history, go to home
        window.location.href = 'index.html';
    }
}

// Update navigation active state
function updateActiveNav(currentPage) {
    // Remove active class from all nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current page
    const activeLink = document.querySelector(`[href="${currentPage}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Also check for data-section attributes
    document.querySelectorAll('[data-section]').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === currentPage.replace('.html', '')) {
            link.classList.add('active');
        }
    });
}

// Handle dashboard section buttons
function handleDashboardNavigation(action) {
    console.log(`Dashboard action: ${action}`);
    
    switch(action) {
        case 'view-source-analysis':
            navigateToPage('source-analysis');
            break;
        case 'view-forecasting':
            navigateToPage('forecasting');
            break;
        case 'view-community':
            navigateToPage('community');
            break;
        case 'view-policy-dashboard':
            navigateToPage('policy-dashboard');
            break;
        case 'scroll-to-dashboard':
            scrollToSection('dashboard');
            break;
        case 'scroll-to-alerts':
            scrollToSection('alerts');
            break;
        case 'scroll-to-forecast':
            scrollToSection('forecast');
            break;
        case 'scroll-to-community':
            scrollToSection('community');
            break;
        case 'go-back':
            goBack();
            break;
        default:
            console.warn(`Unknown dashboard action: ${action}`);
    }
}

// Reinitialize dashboard functionality
function reinitializeDashboard() {
    console.log('Reinitializing dashboard functionality...');
    
    // Re-setup all event listeners
    setupEventListeners();
    
    // Reinitialize charts if they exist
    if (typeof window.forecastChart !== 'undefined') {
        try {
            window.forecastChart.init();
        } catch (e) {
            console.log('Forecast chart not available');
        }
    }
    
    // Reinitialize pollution map if it exists
    if (typeof window.pollutionMap !== 'undefined') {
        try {
            window.pollutionMap.init();
        } catch (e) {
            console.log('Pollution map not available');
        }
    }
    
    // Reinitialize real-time data
    if (typeof window.realtimeDataFetcher !== 'undefined') {
        try {
            window.realtimeDataFetcher.init();
        } catch (e) {
            console.log('Real-time data fetcher not available');
        }
    }
    
    // Reinitialize theme toggle
    if (typeof window.themeToggle !== 'undefined') {
        try {
            window.themeToggle.init();
        } catch (e) {
            console.log('Theme toggle not available');
        }
    }
    
    // Reinitialize notifications
    if (typeof window.notifications !== 'undefined') {
        try {
            window.notifications.init();
        } catch (e) {
            console.log('Notifications not available');
        }
    }
    
    // Reinitialize hero animations
    if (typeof window.heroAnimations !== 'undefined') {
        try {
            window.heroAnimations.init();
        } catch (e) {
            console.log('Hero animations not available');
        }
    }
    
    // Force re-render of any charts or visualizations
    setTimeout(() => {
        // Trigger resize events for charts
        window.dispatchEvent(new Event('resize'));
        
        // Re-trigger any lazy-loaded components
        const lazyElements = document.querySelectorAll('[data-lazy]');
        lazyElements.forEach(element => {
            if (element.dataset.lazy === 'chart') {
                // Reinitialize chart
                const chartId = element.id;
                if (chartId && window[chartId]) {
                    try {
                        window[chartId].update();
                    } catch (e) {
                        console.log(`Chart ${chartId} not available for update`);
                    }
                }
            }
        });
    }, 100);
}

// Setup event listeners
function setupEventListeners() {
    // Remove existing listeners to prevent duplicates
    document.removeEventListener('click', handleClick);
    
    // Add new listeners
    document.addEventListener('click', handleClick);
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', handlePopState);
}

// Handle click events
function handleClick(e) {
    // Handle navigation links
    if (e.target.closest('.nav-link')) {
        const navLink = e.target.closest('.nav-link');
        const href = navLink.getAttribute('href');
        
        if (href && href !== '#') {
            e.preventDefault();
            const page = href.replace('.html', '');
            console.log(`Navigating to page: ${page}`);
            navigateToPage(page);
        }
    }
    
    // Handle dashboard buttons
    if (e.target.closest('[onclick*="scrollToSection"]')) {
        const button = e.target.closest('[onclick*="scrollToSection"]');
        const onclick = button.getAttribute('onclick');
        
        if (onclick.includes('dashboard')) {
            e.preventDefault();
            handleDashboardNavigation('scroll-to-dashboard');
        } else if (onclick.includes('alerts')) {
            e.preventDefault();
            handleDashboardNavigation('scroll-to-alerts');
        } else if (onclick.includes('forecast')) {
            e.preventDefault();
            handleDashboardNavigation('scroll-to-forecast');
        } else if (onclick.includes('community')) {
            e.preventDefault();
            handleDashboardNavigation('scroll-to-community');
        }
    }
    
    // Handle feature buttons
    if (e.target.closest('.btn-feature')) {
        const button = e.target.closest('.btn-feature');
        const text = button.textContent.toLowerCase();
        
        e.preventDefault();
        
        if (text.includes('report') || text.includes('challenge') || text.includes('forum')) {
            handleDashboardNavigation('view-community');
        }
    }
    
    // Handle back button
    if (e.target.closest('.btn-back')) {
        e.preventDefault();
        console.log('Back button clicked');
        goBack();
    }
}

// Handle browser back/forward
function handlePopState(e) {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        scrollToSection(hash);
    }
}

// Handle page visibility changes
function handleVisibilityChange() {
    if (!document.hidden) {
        console.log('Page became visible, reinitializing dashboard...');
        setTimeout(reinitializeDashboard, 100);
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing navigation system...');
    
    // Hide loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) {
        setTimeout(() => {
            loadingIndicator.classList.add('hidden');
            setTimeout(() => {
                loadingIndicator.style.display = 'none';
            }, 500);
        }, 1000);
    }
    
    // Update current page
    currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    // Update active navigation based on current page
    updateActiveNav(currentPage);
    
    // Setup event listeners
    setupEventListeners();
    
    // Handle hash navigation
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        setTimeout(() => scrollToSection(hash), 100);
    }
    
    // Reinitialize dashboard functionality
    setTimeout(reinitializeDashboard, 500);
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for focus events (when user returns to tab)
    window.addEventListener('focus', () => {
        console.log('Window focused, checking dashboard state...');
        setTimeout(reinitializeDashboard, 100);
    });
    
    console.log('Navigation system initialized successfully');
});

// Also initialize when window loads (fallback for defer scripts)
window.addEventListener('load', function() {
    console.log('Window loaded, ensuring navigation is initialized...');
    
    // Double-check that event listeners are set up
    if (!document.hasAttribute('data-navigation-initialized')) {
        console.log('Re-initializing navigation system...');
        setupEventListeners();
        document.setAttribute('data-navigation-initialized', 'true');
    }
});

// Debug function to check navigation state
function debugNavigation() {
    console.log('=== Navigation Debug Info ===');
    console.log('Current page:', currentPage);
    console.log('Navigation history:', navigationHistory);
    console.log('Navigation links found:', document.querySelectorAll('.nav-link').length);
    console.log('Event listeners attached:', document.hasAttribute('data-navigation-initialized'));
    console.log('Back button found:', document.querySelector('.btn-back') ? 'Yes' : 'No');
    console.log('================================');
}

// Make debug function globally available
window.debugNavigation = debugNavigation;

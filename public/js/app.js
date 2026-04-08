// Main Router / Orchestrator
async function initApp() {
    console.log('App Initializing...');
    
    // Check if logged in
    if (!AppState.isLoggedIn() && AppState.currentView !== 'landing' && AppState.currentView !== 'login') {
        AppState.currentView = 'landing';
    } else if (AppState.isLoggedIn() && (AppState.currentView === 'landing' || AppState.currentView === 'login')) {
        AppState.currentView = AppState.isAdmin() ? 'adminDashboard' : 'studentDashboard';
    }

    renderCurrentView();

    // Hide loader
    setTimeout(() => {
        const loader = document.getElementById('loading');
        if (loader) loader.classList.add('hidden');
    }, 1000);
}

function renderCurrentView() {
    const appContainer = document.getElementById('app');
    const view = AppState.currentView;

    // Clear previous view
    appContainer.innerHTML = '';

    // Routes that don't have sidebar/navbar
    const publicRoutes = ['landing', 'login'];
    
    if (publicRoutes.includes(view)) {
        const container = document.createElement('div');
        container.className = 'w-full min-h-screen bg-white';
        container.id = 'view-container';
        appContainer.appendChild(container);
        
        if (view === 'landing') renderLanding();
        if (view === 'login') renderLogin();
    } else {
        // Dashboard Layout
        appContainer.innerHTML = `
            ${UI.sidebar(AppState.isAdmin(), view)}
            <main class="flex-1 min-w-0 bg-[#f9fafb] min-h-screen flex flex-col">
                ${UI.navbar(AppState.user)}
                <div id="view-container" class="p-6 lg:p-10 flex-1 overflow-y-auto animate-fadeIn"></div>
            </main>
        `;
        
        // Render specific dashboard view
        if (view === 'adminDashboard') renderAdminDashboard();
        if (view === 'studentManagement') renderStudentManagement();
        if (view === 'assessments') renderAssessments();
        if (view === 'reports') renderReports();
        if (view === 'studentDashboard') renderStudentDashboard();
        if (view === 'performance') renderPerformance();
        if (view === 'profile') renderProfile();

        // Handle mobile toggle
        document.getElementById('mobile-toggle')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('hidden-mobile');
        });
    }

    lucide.createIcons();
}

// Global Nav listener
window.addEventListener('navigated', () => {
    renderCurrentView();
});

// Logout helper
function logout() {
    AppState.setUser(null);
    AppState.navigate('landing');
    Toast.success('Logged out successfully');
}

// Start the app
document.addEventListener('DOMContentLoaded', initApp);

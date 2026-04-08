const AppState = {
    user: JSON.parse(localStorage.getItem('sloms_user')) || null,
    currentView: 'landing',
    theme: {
        title: 'SLOMS',
        tagline: 'Empowering Education through Data',
        colors: {
            primary: '#667eea',
            secondary: '#764ba2',
            success: '#22c55e',
            warning: '#eab308',
            error: '#ef4444'
        }
    },
    
    // Auth helpers
    setUser(user) {
        this.user = user;
        if (user) {
            localStorage.setItem('sloms_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('sloms_user');
        }
    },
    
    isLoggedIn() {
        return !!this.user;
    },
    
    isAdmin() {
        return this.user && this.user.role === 'admin';
    },

    navigate(view) {
        this.currentView = view;
        // Trigger UI update
        window.dispatchEvent(new CustomEvent('navigated', { detail: view }));
    }
};

// Initial theme setup from variables
function applyTheme() {
    const root = document.documentElement;
    const colors = AppState.theme.colors;
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--success', colors.success);
    root.style.setProperty('--warning', colors.warning);
    root.style.setProperty('--error', colors.error);
}

applyTheme();

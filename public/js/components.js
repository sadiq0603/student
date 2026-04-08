// Toast System
const Toast = {
    show(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        const icons = {
            success: 'check-circle',
            error: 'alert-circle',
            info: 'info',
            warning: 'alert-triangle'
        };
        const colors = {
            success: 'border-green-500 text-green-700 bg-green-50',
            error: 'border-red-500 text-red-700 bg-red-50',
            info: 'border-blue-500 text-blue-700 bg-blue-50',
            warning: 'border-yellow-500 text-yellow-700 bg-yellow-50'
        };

        toast.className = `flex items-center p-4 rounded-xl border-l-4 shadow-lg animate-fadeIn bg-white min-w-[300px] ${colors[type]}`;
        toast.innerHTML = `
            <i data-lucide="${icons[type]}" class="w-5 h-5 mr-3"></i>
            <span class="font-medium">${message}</span>
        `;
        
        container.appendChild(toast);
        lucide.createIcons();

        setTimeout(() => {
            toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    },
    success(msg) { this.show(msg, 'success'); },
    error(msg) { this.show(msg, 'error'); },
    info(msg) { this.show(msg, 'info'); },
    warning(msg) { this.show(msg, 'warning'); }
};

// Modal System
const Modal = {
    show(contentHtml) {
        const container = document.getElementById('modal-container');
        const content = document.getElementById('modal-content');
        content.innerHTML = contentHtml;
        container.classList.remove('hidden');
        container.classList.add('flex');
        lucide.createIcons();
    },
    hide() {
        const container = document.getElementById('modal-container');
        container.classList.add('hidden');
        container.classList.remove('flex');
    }
};

// UI Builders
const UI = {
    card(title, value, icon, colorClass, subtitle = '') {
        return `
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow animate-fadeIn">
                <div>
                    <p class="text-slate-500 text-sm font-medium mb-1">${title}</p>
                    <h3 class="text-2xl font-bold text-slate-800">${value}</h3>
                    ${subtitle ? `<p class="text-xs text-slate-400 mt-1">${subtitle}</p>` : ''}
                </div>
                <div class="p-3 rounded-xl ${colorClass} bg-opacity-10">
                    <i data-lucide="${icon}" class="w-6 h-6 ${colorClass.replace('bg-', 'text-')}"></i>
                </div>
            </div>
        `;
    },

    progressBar(label, percentage, colorClass) {
        return `
            <div class="mb-4">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-sm font-medium text-slate-700">${label}</span>
                    <span class="text-sm font-bold text-slate-900">${Math.round(percentage)}%</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2.5">
                    <div class="h-2.5 rounded-full ${colorClass}" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    },

    badge(text, type) {
        const colors = {
            success: 'bg-green-100 text-green-700',
            warning: 'bg-yellow-100 text-yellow-700',
            error: 'bg-red-100 text-red-700',
            info: 'bg-blue-100 text-blue-700'
        };
        return `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[type] || colors.info}">${text}</span>`;
    },

    sidebar(isAdmin, activeView) {
        const menuItems = isAdmin ? [
            { id: 'adminDashboard', icon: 'layout-dashboard', label: 'Dashboard' },
            { id: 'studentManagement', icon: 'users', label: 'Students' },
            { id: 'assessments', icon: 'clipboard-list', label: 'Assessments' },
            { id: 'reports', icon: 'bar-chart-3', label: 'Reports' },
            { id: 'profile', icon: 'user', label: 'Profile' }
        ] : [
            { id: 'studentDashboard', icon: 'layout-dashboard', label: 'My Dashboard' },
            { id: 'performance', icon: 'trending-up', label: 'My Performance' },
            { id: 'profile', icon: 'user', label: 'My Profile' }
        ];

        return `
            <aside id="sidebar" class="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 flex flex-col hidden-mobile lg:flex">
                <div class="p-6">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 gradient-bg rounded-xl flex items-center justify-center text-white shadow-lg">
                            <i data-lucide="graduation-cap"></i>
                        </div>
                        <h1 class="font-poppins font-bold text-xl tracking-tight text-slate-800">${AppState.theme.title}</h1>
                    </div>
                </div>
                
                <nav class="flex-1 px-4 space-y-1 overflow-y-auto">
                    ${menuItems.map(item => `
                        <button onclick="AppState.navigate('${item.id}')" 
                           class="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeView === item.id ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}">
                            <i data-lucide="${item.icon}" class="w-5 h-5 ${activeView === item.id ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}"></i>
                            <span class="font-medium">${item.label}</span>
                            ${activeView === item.id ? '<div class="w-1.5 h-1.5 rounded-full bg-primary ml-auto"></div>' : ''}
                        </button>
                    `).join('')}
                </nav>

                <div class="p-4 border-t border-slate-100">
                    <button onclick="logout()" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors">
                        <i data-lucide="log-out" class="w-5 h-5"></i>
                        <span class="font-medium">Logout</span>
                    </button>
                </div>
            </aside>
        `;
    },

    navbar(user) {
        return `
            <header class="glass-nav h-16 px-6 flex items-center justify-between sticky top-0 z-40">
                <div class="flex items-center gap-4">
                    <button id="mobile-toggle" class="lg:hidden p-2 rounded-lg hover:bg-slate-100">
                        <i data-lucide="menu" class="w-6 h-6"></i>
                    </button>
                    <h2 class="text-lg font-poppins font-semibold text-slate-800 capitalize">${AppState.currentView.replace(/([A-Z])/g, ' $1')}</h2>
                </div>
                
                <div class="flex items-center gap-4">
                    <div class="hidden sm:flex flex-col items-end">
                        <span class="text-sm font-bold text-slate-800">${user.name}</span>
                        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400">${user.role}</span>
                    </div>
                    <div class="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
                         <i data-lucide="user" class="text-slate-400"></i>
                    </div>
                </div>
            </header>
        `;
    }
};

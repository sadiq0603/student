async function renderProfile() {
    const container = document.getElementById('view-container');
    const user = AppState.user;

    container.innerHTML = `
        <div class="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            <!-- Profile Header Card -->
            <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-12 translate-x-12"></div>
                
                <div class="relative">
                    <div class="w-32 h-32 rounded-3xl gradient-bg p-1 shadow-xl">
                        <div class="w-full h-full bg-slate-100 rounded-[22px] flex items-center justify-center overflow-hidden">
                             <i data-lucide="user" class="w-16 h-16 text-slate-300"></i>
                        </div>
                    </div>
                    <button class="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg text-primary border border-slate-100 hover:scale-110 transition-transform">
                        <i data-lucide="camera" class="w-4 h-4"></i>
                    </button>
                </div>

                <div class="text-center md:text-left flex-1">
                    <h2 class="text-3xl font-poppins font-bold text-slate-800">${user.name}</h2>
                    <p class="text-slate-500 font-medium">${user.email}</p>
                    <div class="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                        ${UI.badge(user.role.toUpperCase(), 'info')}
                        ${user.grade ? UI.badge(user.grade, 'info') : ''}
                    </div>
                </div>
            </div>

            <!-- Edit Form -->
            <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <div class="mb-8">
                    <h3 class="text-xl font-bold text-slate-800">Account Settings</h3>
                    <p class="text-slate-500 text-sm">Update your personal information and security.</p>
                </div>

                <form id="profile-form" class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                            <input type="text" id="p-name" value="${user.name}" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                            <input type="email" id="p-email" value="${user.email}" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-slate-700 mb-2">New Password (Leave blank to keep current)</label>
                        <input type="password" id="p-password" placeholder="••••••••" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none">
                    </div>

                    ${AppState.isAdmin() ? `
                        <div class="pt-6 border-t border-slate-100">
                             <h4 class="font-bold text-slate-800 mb-4">System Branding (Admin Only)</h4>
                             <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-2">System Title</label>
                                    <input type="text" id="theme-title" value="${AppState.theme.title}" class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-2">Primary Color</label>
                                    <div class="flex gap-2">
                                        <input type="color" id="theme-color" value="${AppState.theme.colors.primary}" class="w-12 h-12 p-1 bg-white border border-slate-200 rounded-xl cursor-pointer">
                                        <input type="text" value="${AppState.theme.colors.primary}" readonly class="flex-1 px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono text-sm">
                                    </div>
                                </div>
                             </div>
                        </div>
                    ` : ''}

                    <div class="pt-8 flex justify-end">
                        <button type="submit" class="px-10 py-4 gradient-bg text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;

    lucide.createIcons();

    // Form Event
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('p-name').value,
            email: document.getElementById('p-email').value,
        };
        const pass = document.getElementById('p-password').value;
        if (pass) data.password = pass;

        try {
            if (AppState.isAdmin()) {
                // Update Admin Profile & Theme
                AppState.theme.title = document.getElementById('theme-title').value;
                AppState.theme.colors.primary = document.getElementById('theme-color').value;
                
                await API.updateAdmin(data);
                applyTheme(); // defined in state.js
                Toast.success('Profile and system branding updated');
            } else {
                // Update Student Profile
                await API.updateStudent(AppState.user.id, data);
                Toast.success('Profile updated');
            }
            
            // Refresh local state
            const updatedUser = { ...AppState.user, ...data };
            AppState.setUser(updatedUser);
            renderCurrentView();
        } catch (err) {}
    });
}

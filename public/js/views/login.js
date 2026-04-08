function renderLogin() {
    const container = document.getElementById('view-container');
    container.innerHTML = `
        <div class="min-h-screen flex">
            <!-- Left Side: Form -->
            <div class="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-24 bg-white relative">
                <button onclick="AppState.navigate('landing')" class="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-medium">
                    <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Home
                </button>
                
                <div class="max-w-md w-full mx-auto">
                    <div class="mb-10">
                        <div class="w-12 h-12 gradient-bg rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
                            <i data-lucide="graduation-cap"></i>
                        </div>
                        <h2 class="text-3xl font-poppins font-bold text-slate-800">Welcome Back</h2>
                        <p class="text-slate-500 mt-2">Sign in to access your dashboard and records.</p>
                    </div>

                    <form id="login-form" class="space-y-6">
                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                            <div class="relative">
                                <i data-lucide="mail" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                                <input type="email" id="login-email" required placeholder="name@example.com"
                                    class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                            </div>
                        </div>

                        <div>
                            <label class="block text-sm font-bold text-slate-700 mb-2">Password</label>
                            <div class="relative">
                                <i data-lucide="lock" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"></i>
                                <input type="password" id="login-password" required placeholder="••••••••"
                                    class="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                            </div>
                        </div>

                        <div class="flex items-center justify-between">
                            <label class="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" class="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary">
                                <span class="text-sm text-slate-600">Remember me</span>
                            </label>
                            <a href="#" class="text-sm font-bold text-primary hover:underline">Forgot password?</a>
                        </div>

                        <button type="submit" id="login-btn" class="w-full py-4 gradient-bg text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                             <span>Sign In</span>
                             <i data-lucide="arrow-right" class="w-5 h-5"></i>
                        </button>
                    </form>

                    <p class="mt-8 text-center text-slate-500 text-sm">
                        Don't have an account? <span class="text-primary font-bold cursor-pointer hover:underline">Contact Administrator</span>
                    </p>
                </div>
            </div>

            <!-- Right Side: Graphic -->
            <div class="hidden lg:flex flex-1 gradient-bg items-center justify-center p-12 relative overflow-hidden">
                 <div class="absolute inset-0 opacity-10">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" stroke-width="1"/></pattern></defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                 </div>
                 <div class="bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-3xl max-w-lg text-white relative z-10 animate-fadeIn">
                     <i data-lucide="quote" class="w-12 h-12 text-white/50 mb-6 font-primary"></i>
                     <h3 class="text-3xl font-poppins font-bold mb-6">"Education is the most powerful weapon which you can use to change the world."</h3>
                     <p class="text-xl text-white/70">— Nelson Mandela</p>
                 </div>
            </div>
        </div>
    `;

    lucide.createIcons();

    // Event listener
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = document.getElementById('login-btn');

        btn.disabled = true;
        btn.innerHTML = '<div class="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>';

        try {
            const response = await API.login({ email, password });
            if (response.success) {
                AppState.setUser(response.user);
                Toast.success('Login Successful! Redirecting...');
                setTimeout(() => {
                    AppState.navigate(AppState.isAdmin() ? 'adminDashboard' : 'studentDashboard');
                }, 1000);
            }
        } catch (err) {
            Toast.error(err.message || 'Login failed');
            btn.disabled = false;
            btn.innerHTML = '<span>Sign In</span><i data-lucide="arrow-right" class="w-5 h-5"></i>';
            lucide.createIcons();
        }
    });
}

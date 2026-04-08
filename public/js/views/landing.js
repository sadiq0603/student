function renderLanding() {
    const container = document.getElementById('view-container');
    container.innerHTML = `
        <div class="relative overflow-hidden bg-white">
            <!-- Hero Section -->
            <div class="gradient-bg py-24 sm:py-32 flex items-center justify-center text-white relative">
                <div class="absolute inset-0 bg-black/10"></div>
                <div class="container mx-auto px-6 relative z-10 text-center">
                    <div class="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-8 animate-fadeIn">
                        <i data-lucide="sparkles" class="w-4 h-4"></i>
                        <span class="text-sm font-semibold uppercase tracking-wider">New Standard in Education</span>
                    </div>
                    <h1 class="text-5xl md:text-7xl font-poppins font-bold mb-6 drop-shadow-sm">${AppState.theme.title}</h1>
                    <p class="text-xl md:text-2xl font-light mb-10 text-white/90 max-w-3xl mx-auto">${AppState.theme.tagline}</p>
                    <div class="flex flex-wrap justify-center gap-4">
                        <button onclick="AppState.navigate('login')" class="px-8 py-4 bg-white text-primary rounded-2xl font-bold shadow-xl hover:scale-105 transition-transform">Get Started Now</button>
                        <button onclick="Toast.info('Demo video coming soon!')" class="px-8 py-4 bg-transparent border-2 border-white/50 text-white rounded-2xl font-bold hover:bg-white/10 transition-colors">Watch Demo</button>
                    </div>
                </div>
                <!-- Wave SVG decor -->
                <div class="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
                    <svg class="relative block w-full h-[150px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C58.47,105,123.61,105.54,183.08,92.83,246.69,79.28,261.21,67.59,321.39,56.44Z" fill="#f9fafb"></path>
                    </svg>
                </div>
            </div>

            <!-- Features -->
            <div class="py-24 bg-[#f9fafb]">
                <div class="container mx-auto px-6">
                    <div class="text-center mb-16">
                         <h2 class="text-3xl md:text-4xl font-poppins font-bold text-slate-800 mb-4">Comprehensive Education Management</h2>
                         <p class="text-slate-500 max-w-2xl mx-auto">Everything you need to track student performance and improve learning outcomes in one professional suite.</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                        ${[
                            { icon: 'users', title: 'Student Management', desc: 'Maintain detailed student records, tracking progress and grades with ease.' },
                            { icon: 'trending-up', title: 'Performance Analytics', desc: 'Visualize academic trends with beautiful Charts and data-driven insights.' },
                            { icon: 'award', title: 'Learning Outcomes', desc: 'Map assessments to specific learning goals and track proficiency levels.' }
                        ].map(f => `
                            <div class="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group">
                                <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                    <i data-lucide="${f.icon}" class="w-7 h-7"></i>
                                </div>
                                <h3 class="text-xl font-bold text-slate-800 mb-3">${f.title}</h3>
                                <p class="text-slate-500 leading-relaxed">${f.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>

            <!-- Demo Credentials -->
            <div class="py-12 bg-white flex justify-center">
                <div class="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 flex flex-col md:flex-row items-center gap-6">
                    <div>
                        <p class="text-indigo-900 font-bold mb-1 flex items-center gap-2">
                             <i data-lucide="info" class="w-4 h-4"></i> Demo Access
                        </p>
                        <p class="text-indigo-700 text-sm">Experience the platform with our pre-populated admin account.</p>
                    </div>
                    <div class="flex gap-4">
                        <div class="bg-white px-4 py-2 rounded-xl text-xs font-mono border border-indigo-200 shadow-sm">
                            <span class="text-indigo-400">Email:</span> sadiq123@gmail.com
                        </div>
                        <div class="bg-white px-4 py-2 rounded-xl text-xs font-mono border border-indigo-200 shadow-sm">
                            <span class="text-indigo-400">Pass:</span> sadiq@2007
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer -->
            <footer class="py-12 border-t border-slate-100 text-center text-slate-400 text-sm">
                &copy; 2026 ${AppState.theme.title} Management System. All rights reserved.
            </footer>
        </div>
    `;
    lucide.createIcons();
}

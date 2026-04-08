async function renderAdminDashboard() {
    const container = document.getElementById('view-container');
    container.innerHTML = '<div class="flex items-center justify-center p-20"><div class="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>';

    try {
        const reports = await API.getReports();
        const students = await API.getStudents();
        const recentStudents = students.slice(-5).reverse();

        container.innerHTML = `
            <div class="space-y-8">
                <!-- Overview Stats -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${UI.card('Total Students', reports.totalStudents, 'users', 'bg-blue-500')}
                    ${UI.card('Total Assessments', reports.totalAssessments, 'clipboard-list', 'bg-purple-500')}
                    ${UI.card('Average Performance', `${Math.round(reports.overallAverage)}%`, 'trending-up', 'bg-green-500', 'Across all subjects')}
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <!-- Charts Section -->
                    <div class="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <div class="flex items-center justify-between mb-6">
                            <h3 class="text-xl font-bold text-slate-800">Performance Distribution</h3>
                            <button class="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                                View Detailed Report <i data-lucide="chevron-right" class="w-4 h-4"></i>
                            </button>
                        </div>
                        <div class="h-[400px] relative">
                            <canvas id="performanceChart"></canvas>
                        </div>
                    </div>

                    <!-- Recent Students -->
                    <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h3 class="text-xl font-bold text-slate-800 mb-6">Recent Students</h3>
                        <div class="space-y-4">
                            ${recentStudents.length > 0 ? recentStudents.map(s => `
                                <div class="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                                    <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold">
                                        ${s.name.charAt(0)}
                                    </div>
                                    <div class="flex-1">
                                        <p class="text-sm font-bold text-slate-800">${s.name}</p>
                                        <p class="text-[10px] text-slate-400 uppercase font-bold tracking-wider">${s.grade}</p>
                                    </div>
                                    <button onclick="AppState.navigate('studentManagement')" class="p-2 text-slate-400 hover:text-primary transition-colors">
                                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                                    </button>
                                </div>
                            `).join('') : '<p class="text-slate-400 text-sm italic py-10 text-center">No students registered yet.</p>'}
                        </div>
                        <button onclick="AppState.navigate('studentManagement')" class="w-full mt-6 py-3 border-2 border-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all">View All Students</button>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();
        initPerformanceChart(reports.subjects);

    } catch (err) {
        container.innerHTML = `<div class="p-10 text-center text-red-500">Error loading dashboard: ${err.message}</div>`;
    }
}

function initPerformanceChart(subjects) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    // Fallback if no data
    const labels = subjects.length > 0 ? subjects.map(s => s.name) : ['Math', 'Science', 'English', 'History'];
    const data = subjects.length > 0 ? subjects.map(s => s.average) : [0, 0, 0, 0];

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Subject Performance',
                data: data,
                backgroundColor: [
                    'rgba(102, 126, 234, 0.8)',
                    'rgba(118, 75, 162, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(234, 179, 8, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ],
                borderWidth: 0,
                borderRadius: 5,
                spacing: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 12, family: 'Inter', weight: '500' }
                    }
                }
            }
        }
    });
}

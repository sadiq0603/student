async function renderStudentDashboard() {
    const container = document.getElementById('view-container');
    container.innerHTML = '<div class="space-y-6">Loading your dashboard...</div>';

    try {
        const studentId = AppState.user.id;
        const reports = await API.getReports(studentId);
        const assessments = await API.getAssessments(studentId);
        const recentAssessments = assessments.slice(-5).reverse();

        container.innerHTML = `
            <div class="space-y-8">
                <!-- Welcome -->
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 class="text-3xl font-poppins font-bold text-slate-800">Welcome, ${AppState.user.name.split(' ')[0]}! 👋</h2>
                        <p class="text-slate-500 mt-1">Here is a quick look at your academic progress.</p>
                    </div>
                    <div class="hidden md:block w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                        <i data-lucide="sparkles" class="w-10 h-10"></i>
                    </div>
                </div>

                <!-- Stats -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    ${UI.card('Overall Average', `${Math.round(reports.overallAverage)}%`, 'trending-up', 'bg-green-500')}
                    ${UI.card('Total Assessments', reports.totalAssessments, 'clipboard-list', 'bg-blue-500')}
                    ${UI.card('Subjects Count', reports.subjects.length, 'book-open', 'bg-purple-500')}
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Subject Performance -->
                    <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                        <h3 class="text-xl font-bold text-slate-800 mb-8">Subject Progress</h3>
                        <div class="space-y-6 flex-1">
                            ${reports.subjects.length > 0 ? reports.subjects.map(s => {
                                let color = 'bg-red-500';
                                if (s.average >= 70) color = 'bg-green-500';
                                else if (s.average >= 50) color = 'bg-yellow-500';
                                return UI.progressBar(s.name, s.average, color);
                            }).join('') : '<p class="text-slate-400 text-center py-10 italic">No assessments yet.</p>'}
                        </div>
                    </div>

                    <!-- Performance Chart -->
                    <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h3 class="text-xl font-bold text-slate-800 mb-8">Score History</h3>
                        <div class="h-[300px]">
                            <canvas id="studentBarChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Recent Assessments -->
                <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                    <div class="p-6 border-b border-slate-100">
                        <h3 class="text-xl font-bold text-slate-800">Recent Assessments</h3>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="w-full text-left">
                            <thead class="bg-slate-50">
                                <tr>
                                    <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Subject</th>
                                    <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Type</th>
                                    <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Score</th>
                                    <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-100">
                                ${recentAssessments.map(a => {
                                    const status = a.score >= 70 ? 'Excellent' : (a.score >= 50 ? 'Average' : 'Needs Work');
                                    const type = a.score >= 70 ? 'success' : (a.score >= 50 ? 'warning' : 'error');
                                    return `
                                        <tr class="hover:bg-slate-50 transition-colors">
                                            <td class="px-6 py-4 font-bold text-slate-700">${a.subject}</td>
                                            <td class="px-6 py-4 text-slate-500">${a.type}</td>
                                            <td class="px-6 py-4 font-black text-slate-800">${a.score}%</td>
                                            <td class="px-6 py-4">${UI.badge(status, type)}</td>
                                        </tr>
                                    `;
                                }).join('')}
                                ${recentAssessments.length === 0 ? '<tr><td colspan="4" class="p-10 text-center text-slate-400 italic">No recent assessments.</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();
        if (reports.subjects.length > 0) {
            initStudentBarChart(reports.subjects);
        }

    } catch (err) {
        Toast.error('Failed to load dashboard');
    }
}

function initStudentBarChart(subjects) {
    const ctx = document.getElementById('studentBarChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: subjects.map(s => s.name),
            datasets: [{
                label: 'Your Average Score',
                data: subjects.map(s => s.average),
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: 'rgba(59, 130, 246, 1)',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { min: 0, max: 100, ticks: { font: { weight: 'bold' } } },
                x: { grid: { display: false }, ticks: { font: { weight: 'bold' } } }
            }
        }
    });
}

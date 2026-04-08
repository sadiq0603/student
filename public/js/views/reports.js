async function renderReports() {
    const container = document.getElementById('view-container');
    container.innerHTML = '<div class="space-y-6">Generating reports...</div>';

    try {
        const reports = await API.getReports();
        const students = await API.getStudents();
        const assessments = await API.getAssessments();

        // Calculate student-wise performance and group by grade
        const groupedSummary = students.reduce((acc, s) => {
            const sAssessments = assessments.filter(a => a.studentId === s.id);
            const avg = sAssessments.length > 0 ? sAssessments.reduce((sum, a) => sum + a.score, 0) / sAssessments.length : 0;
            let status = 'Needs Improvement';
            let statusType = 'error';
            if (avg >= 70) { status = 'Excellent'; statusType = 'success'; }
            else if (avg >= 50) { status = 'Average'; statusType = 'warning'; }
            
            const summary = { ...s, average: avg, status, statusType, count: sAssessments.length };
            if (!acc[s.grade]) acc[s.grade] = [];
            acc[s.grade].push(summary);
            return acc;
        }, {});

        const grades = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

        container.innerHTML = `
            <div class="space-y-8 pb-10">
                <!-- Overview Stats -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    ${UI.card('Total Students', reports.totalStudents, 'users', 'bg-blue-500')}
                    ${UI.card('Total Assessments', reports.totalAssessments, 'clipboard-list', 'bg-purple-500')}
                    ${UI.card('Overall Average', `${Math.round(reports.overallAverage)}%`, 'trending-up', 'bg-green-500')}
                    ${UI.card('Active Subjects', reports.subjects.length, 'book-open', 'bg-orange-500')}
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <!-- Subject Performance -->
                    <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
                        <h3 class="text-xl font-bold text-slate-800 mb-8">Subject Proficiency</h3>
                        <div class="space-y-6 flex-1">
                            ${reports.subjects.length > 0 ? reports.subjects.map(s => {
                                let color = 'bg-red-500';
                                if (s.average >= 70) color = 'bg-green-500';
                                else if (s.average >= 50) color = 'bg-yellow-500';
                                return UI.progressBar(s.name, s.average, color);
                            }).join('') : '<p class="text-slate-400 text-center py-20">No subject data available.</p>'}
                        </div>
                    </div>

                    <!-- Performance Chart -->
                    <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h3 class="text-xl font-bold text-slate-800 mb-8">Score Distribution</h3>
                        <div class="h-[350px]">
                            <canvas id="distributionChart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Grouped Student Performance Table -->
                <div class="space-y-6">
                    <div class="flex items-center justify-between">
                         <h3 class="text-xl font-bold text-slate-800">Student Performance Summary</h3>
                         <div class="flex gap-2">
                             <div class="flex items-center gap-2 text-xs font-bold px-3 py-1 bg-green-50 text-green-600 rounded-lg">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Excellent
                            </div>
                            <div class="flex items-center gap-2 text-xs font-bold px-3 py-1 bg-yellow-50 text-yellow-600 rounded-lg">
                                <span class="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Average
                            </div>
                        </div>
                    </div>

                    ${grades.map(grade => {
                        const classSummary = groupedSummary[grade] || [];
                        if (classSummary.length === 0) return '';
                        return `
                            <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                                <div class="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                    <h4 class="font-bold text-slate-700">${grade}</h4>
                                    <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">${classSummary.length} Students</span>
                                </div>
                                <div class="overflow-x-auto">
                                    <table class="w-full text-left">
                                        <thead class="bg-slate-50/30">
                                            <tr>
                                                <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Student</th>
                                                <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Assessments</th>
                                                <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Average Score</th>
                                                <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody class="divide-y divide-slate-100">
                                            ${classSummary.map(s => `
                                                <tr class="hover:bg-slate-50 transition-colors">
                                                    <td class="px-6 py-4 font-bold text-slate-700">${s.name}</td>
                                                    <td class="px-6 py-4 text-slate-500">${s.count}</td>
                                                    <td class="px-6 py-4">
                                                        <div class="flex items-center gap-2">
                                                            <div class="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                                <div class="h-full bg-primary" style="width: ${s.average}%"></div>
                                                            </div>
                                                            <span class="text-sm font-bold text-slate-800">${Math.round(s.average)}%</span>
                                                        </div>
                                                    </td>
                                                    <td class="px-6 py-4">
                                                        ${UI.badge(s.status, s.statusType)}
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        `;
                    }).join('')}
                    ${Object.keys(groupedSummary).length === 0 ? '<div class="p-20 text-center text-slate-400 bg-white rounded-3xl border border-slate-100 border-dashed">No student records found.</div>' : ''}
                </div>
            </div>
        `;

        lucide.createIcons();
        initDistributionChart(reports.subjects);
    } catch (err) {
        Toast.error('Error generating reports');
    }
}

function initDistributionChart(subjects) {
    const ctx = document.getElementById('distributionChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: subjects.map(s => s.name),
            datasets: [{
                label: 'Average Score (%)',
                data: subjects.map(s => s.average),
                backgroundColor: 'rgba(102, 126, 234, 0.6)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 2,
                borderRadius: 8,
                barThickness: 32
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    grid: { display: false },
                    ticks: { font: { weight: 'bold' } }
                },
                y: {
                    grid: { display: false },
                    ticks: { font: { weight: 'bold' } }
                }
            }
        }
    });
}

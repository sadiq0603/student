async function renderPerformance() {
    const container = document.getElementById('view-container');
    container.innerHTML = '<div class="space-y-6">Analyzing your performance...</div>';

    try {
        const studentId = AppState.user.id;
        const reports = await API.getReports(studentId);
        
        const subjects = reports.subjects;
        const sortedSubjects = [...subjects].sort((a, b) => b.average - a.average);
        
        const bestSubject = sortedSubjects.length > 0 ? sortedSubjects[0] : null;
        const weakSubject = sortedSubjects.length > 1 ? sortedSubjects[sortedSubjects.length - 1] : null;

        container.innerHTML = `
            <div class="space-y-8 pb-10">
                <!-- Top Overview -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-green-50 p-6 rounded-3xl border border-green-100 flex items-center gap-5">
                        <div class="p-4 bg-green-500 rounded-2xl text-white shadow-lg shadow-green-200">
                             <i data-lucide="award" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <p class="text-green-800 font-bold mb-1">Strongest Area</p>
                            <h3 class="text-xl font-bold text-green-900">${bestSubject ? bestSubject.name : 'N/A'}</h3>
                        </div>
                    </div>
                    
                    <div class="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-center gap-5">
                        <div class="p-4 bg-red-500 rounded-2xl text-white shadow-lg shadow-red-200">
                             <i data-lucide="trending-down" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <p class="text-red-800 font-bold mb-1">Needs Focus</p>
                            <h3 class="text-xl font-bold text-red-900">${weakSubject ? weakSubject.name : 'N/A'}</h3>
                        </div>
                    </div>

                    <div class="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-center gap-5">
                        <div class="p-4 bg-blue-500 rounded-2xl text-white shadow-lg shadow-blue-200">
                             <i data-lucide="target" class="w-6 h-6"></i>
                        </div>
                        <div>
                            <p class="text-blue-800 font-bold mb-1">Overall Progress</p>
                            <h3 class="text-xl font-bold text-blue-900">${Math.round(reports.overallAverage)}% Proficiency</h3>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                     <!-- Detailed Progress Bars -->
                    <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <h3 class="text-xl font-bold text-slate-800 mb-8">Detailed Outcome Mastery</h3>
                        <div class="space-y-6">
                             ${subjects.map(s => {
                                let label = 'Excellent';
                                let color = 'bg-green-500';
                                if (s.average < 50) { label = 'Developing'; color = 'bg-red-500'; }
                                else if (s.average < 70) { label = 'Proficient'; color = 'bg-yellow-500'; }
                                
                                return `
                                    <div class="space-y-2">
                                        <div class="flex justify-between items-end">
                                            <div>
                                                <h4 class="font-bold text-slate-700">${s.name}</h4>
                                                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">${label}</p>
                                            </div>
                                            <span class="text-lg font-black text-slate-800">${Math.round(s.average)}%</span>
                                        </div>
                                        <div class="w-full bg-slate-50 border border-slate-100 rounded-full h-3 overflow-hidden">
                                            <div class="h-full ${color} rounded-full" style="width: ${s.average}%"></div>
                                        </div>
                                    </div>
                                `;
                             }).join('')}
                             ${subjects.length === 0 ? '<p class="text-slate-400 text-center py-20 italic">No data yet.</p>' : ''}
                        </div>
                    </div>

                    <!-- Radar Chart -->
                    <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center">
                        <h3 class="text-xl font-bold text-slate-800 mb-8 w-full text-left">Subject-wise Comparison</h3>
                        <div class="w-full h-full min-h-[400px]">
                            <canvas id="performanceRadar"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();
        if (subjects.length >= 3) {
            initRadarChart(subjects);
        }

    } catch (err) {
        Toast.error('Failed to analyze performance');
    }
}

function initRadarChart(subjects) {
    const ctx = document.getElementById('performanceRadar').getContext('2d');
    
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: subjects.map(s => s.name),
            datasets: [{
                label: 'Score by Subject',
                data: subjects.map(s => s.average),
                fill: true,
                backgroundColor: 'rgba(102, 126, 234, 0.2)',
                borderColor: 'rgba(102, 126, 234, 1)',
                pointBackgroundColor: 'rgba(102, 126, 234, 1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: { display: false }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

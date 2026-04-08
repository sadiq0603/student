async function renderAssessments() {
    const container = document.getElementById('view-container');
    container.innerHTML = '<div class="space-y-6">Loading data...</div>';

    try {
        const students = await API.getStudents();
        const assessments = await API.getAssessments();
        const recentAssessments = assessments.slice(-10).reverse();

        container.innerHTML = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                <!-- Left: Add Form -->
                <div class="space-y-6">
                    <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 h-full">
                        <div class="mb-8">
                            <h2 class="text-2xl font-poppins font-bold text-slate-800 mb-2">New Assessment</h2>
                            <p class="text-slate-500 text-sm">Record a new student performance outcome.</p>
                        </div>
                        
                        <form id="assessment-form" class="space-y-6">
                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Student</label>
                                <select id="a-student" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                    <option value="" disabled selected>Select a student</option>
                                    ${students.map(s => `<option value="${s.id}">${s.name} (${s.grade})</option>`).join('')}
                                </select>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                                    <select id="a-subject" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                        <option value="Mathematics">Mathematics</option>
                                        <option value="Science">Science</option>
                                        <option value="English">English</option>
                                        <option value="History">History</option>
                                        <option value="Geography">Geography</option>
                                        <option value="Computer Science">Computer Science</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-slate-700 mb-2">Type</label>
                                    <select id="a-type" required class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                        <option value="Quiz">Quiz</option>
                                        <option value="Test">Test</option>
                                        <option value="Exam">Exam</option>
                                        <option value="Assignment">Assignment</option>
                                        <option value="Project">Project</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-bold text-slate-700 mb-2">Score (0-100)</label>
                                <div class="relative">
                                     <input type="number" id="a-score" required min="0" max="100" placeholder="e.g. 85"
                                        class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                                     <span class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                </div>
                            </div>

                            <div class="pt-6">
                                <button type="submit" class="w-full py-4 gradient-bg text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                                    <i data-lucide="plus-circle" class="w-5 h-5"></i>
                                    <span>Add Assessment Record</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Right: Recent List -->
                <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div class="mb-8 flex items-center justify-between">
                         <div>
                            <h2 class="text-2xl font-poppins font-bold text-slate-800 mb-2">Recent Records</h2>
                            <p class="text-slate-500 text-sm">Last 10 assessment entries.</p>
                         </div>
                         <i data-lucide="history" class="text-slate-200 w-10 h-10"></i>
                    </div>

                    <div class="flex-1 overflow-y-auto space-y-4">
                        ${recentAssessments.length > 0 ? recentAssessments.map(a => {
                            const student = students.find(s => s.id === a.studentId) || { name: 'Unknown' };
                            const status = a.score >= 70 ? 'success' : (a.score >= 50 ? 'warning' : 'error');
                            return `
                                <div class="flex items-center gap-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-all flex-shrink-0">
                                    <div class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg
                                        ${status === 'success' ? 'bg-green-100 text-green-600' : (status === 'warning' ? 'bg-yellow-100 text-yellow-600' : 'bg-red-100 text-red-600')}">
                                        ${a.score}
                                    </div>
                                    <div class="flex-1">
                                        <div class="flex items-center justify-between">
                                            <p class="font-bold text-slate-800">${student.name}</p>
                                            <span class="text-[10px] text-slate-400 font-bold uppercase">${new Date(a.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div class="flex items-center gap-2 mt-1">
                                            <span class="text-xs font-semibold text-slate-500">${a.subject}</span>
                                            <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                                            <span class="text-xs text-slate-400">${a.type}</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('') : `
                            <div class="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
                                <i data-lucide="inbox" class="w-16 h-16 mb-4"></i>
                                <p class="font-medium">No assessment history found.</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;

        lucide.createIcons();

        // Form handling
        document.getElementById('assessment-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                studentId: document.getElementById('a-student').value,
                subject: document.getElementById('a-subject').value,
                type: document.getElementById('a-type').value,
                score: document.getElementById('a-score').value
            };

            try {
                await API.createAssessment(data);
                Toast.success('Assessment record added');
                renderAssessments(); // Refresh
            } catch (err) {}
        });

    } catch (err) {
        Toast.error('Failed to load data');
    }
}

async function renderStudentManagement() {
    const container = document.getElementById('view-container');
    container.innerHTML = '<div class="space-y-6 animate-pulse">Loading students...</div>';

    try {
        const students = await API.getStudents();
        
        const groupedStudents = students.reduce((acc, s) => {
            if (!acc[s.grade]) acc[s.grade] = [];
            acc[s.grade].push(s);
            return acc;
        }, {});

        const grades = ['Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];

        container.innerHTML = `
            <div class="space-y-8">
                <!-- Header -->
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <div>
                        <h2 class="text-2xl font-poppins font-bold text-slate-800">Student Directory</h2>
                        <p class="text-slate-500">Manage student records grouped by their respective classes.</p>
                    </div>
                    <button onclick="showAddStudentModal()" class="flex items-center gap-2 px-6 py-3 gradient-bg text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20">
                        <i data-lucide="user-plus" class="w-5 h-5"></i>
                        <span>Add New Student</span>
                    </button>
                </div>

                <!-- Grouped Tables -->
                <div class="space-y-10">
                    ${grades.map(grade => {
                        const classStudents = groupedStudents[grade] || [];
                        return `
                            <div class="space-y-4">
                                <div class="flex items-center gap-4 px-2">
                                    <h3 class="text-xl font-bold text-slate-700">${grade}</h3>
                                    <div class="h-px flex-1 bg-slate-100"></div>
                                    <span class="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold">${classStudents.length} Students</span>
                                </div>
                                <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                    <div class="overflow-x-auto">
                                        <table class="w-full text-left">
                                            <thead class="bg-slate-50 border-b border-slate-100">
                                                <tr>
                                                    <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Student</th>
                                                    <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                                                    <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Joined</th>
                                                    <th class="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody class="divide-y divide-slate-100">
                                                ${classStudents.length > 0 ? classStudents.map(s => `
                                                    <tr class="hover:bg-slate-50 transition-colors group">
                                                        <td class="px-6 py-4">
                                                            <div class="flex items-center gap-3">
                                                                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                                    ${s.name.charAt(0)}
                                                                </div>
                                                                <span class="font-bold text-slate-700">${s.name}</span>
                                                            </div>
                                                        </td>
                                                        <td class="px-6 py-4 text-slate-500 text-sm font-medium">${s.email}</td>
                                                        <td class="px-6 py-4 text-slate-400 text-xs font-medium">${new Date(s.createdAt).toLocaleDateString()}</td>
                                                        <td class="px-6 py-4 text-right">
                                                            <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <button onclick="showEditStudentModal('${s.id}')" class="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Edit">
                                                                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                                                                </button>
                                                                <button onclick="confirmDeleteStudent('${s.id}', '${s.name}')" class="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                                                                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                `).join('') : `
                                                    <tr>
                                                        <td colspan="4" class="px-6 py-8 text-center text-slate-400 text-sm italic">
                                                            No students enrolled in ${grade}.
                                                        </td>
                                                    </tr>
                                                `}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        lucide.createIcons();
    } catch (err) {
        Toast.error('Failed to load students');
    }
}

function showAddStudentModal() {
    const modalHtml = `
        <div class="mb-6">
            <h3 class="text-xl font-bold text-slate-800">Add New Student</h3>
            <p class="text-slate-500 text-sm">Create a new student account.</p>
        </div>
        <form id="student-form" class="space-y-4">
            <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                <input type="text" id="s-name" required class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none">
            </div>
            <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                <input type="email" id="s-email" required class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none">
            </div>
             <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <input type="password" id="s-password" required class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none">
            </div>
            <div>
                <label class="block text-sm font-bold text-slate-700 mb-1">Grade Level</label>
                <select id="s-grade" required class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none">
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                </select>
            </div>
            <div class="flex gap-3 mt-8">
                <button type="button" onclick="Modal.hide()" class="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" class="flex-1 py-3 gradient-bg text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">Save Student</button>
            </div>
        </form>
    `;
    Modal.show(modalHtml);
    
    document.getElementById('student-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('s-name').value,
            email: document.getElementById('s-email').value,
            password: document.getElementById('s-password').value,
            grade: document.getElementById('s-grade').value
        };
        try {
            await API.createStudent(data);
            Toast.success('Student added successfully');
            Modal.hide();
            renderStudentManagement();
        } catch (err) {
            // Error handled by API helper Toast
        }
    });
}

async function showEditStudentModal(id) {
    try {
        const students = await API.getStudents();
        const s = students.find(x => x.id === id);
        
        const modalHtml = `
            <div class="mb-6">
                <h3 class="text-xl font-bold text-slate-800">Edit Student</h3>
                <p class="text-slate-500 text-sm">Update ${s.name}'s information.</p>
            </div>
            <form id="student-edit-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                    <input type="text" id="e-name" value="${s.name}" required class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                    <input type="email" id="e-email" value="${s.email}" required class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none">
                </div>
                <div>
                    <label class="block text-sm font-bold text-slate-700 mb-1">Grade Level</label>
                    <select id="e-grade" class="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none">
                        <option value="Grade 9" ${s.grade === 'Grade 9' ? 'selected' : ''}>Grade 9</option>
                        <option value="Grade 10" ${s.grade === 'Grade 10' ? 'selected' : ''}>Grade 10</option>
                        <option value="Grade 11" ${s.grade === 'Grade 11' ? 'selected' : ''}>Grade 11</option>
                        <option value="Grade 12" ${s.grade === 'Grade 12' ? 'selected' : ''}>Grade 12</option>
                    </select>
                </div>
                <div class="flex gap-3 mt-8">
                    <button type="button" onclick="Modal.hide()" class="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
                    <button type="submit" class="flex-1 py-3 gradient-bg text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">Update Info</button>
                </div>
            </form>
        `;
        Modal.show(modalHtml);
        
        document.getElementById('student-edit-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = {
                name: document.getElementById('e-name').value,
                email: document.getElementById('e-email').value,
                grade: document.getElementById('e-grade').value
            };
            try {
                await API.updateStudent(id, data);
                Toast.success('Student updated');
                Modal.hide();
                renderStudentManagement();
            } catch (err) {}
        });
    } catch (err) {}
}

function confirmDeleteStudent(id, name) {
    const modalHtml = `
        <div class="text-center">
            <div class="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <i data-lucide="trash-2" class="w-8 h-8"></i>
            </div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">Delete Student</h3>
            <p class="text-slate-500 mb-8">Are you sure you want to delete <b>${name}</b>? This action will also delete all their assessments and cannot be undone.</p>
            <div class="flex gap-3">
                <button onclick="Modal.hide()" class="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Keep Student</button>
                <button onclick="deleteStudent('${id}')" class="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-600 transition-colors">Yes, Delete</button>
            </div>
        </div>
    `;
    Modal.show(modalHtml);
}

async function deleteStudent(id) {
    try {
        await API.deleteStudent(id);
        Toast.success('Student deleted');
        Modal.hide();
        renderStudentManagement();
    } catch (err) {}
}

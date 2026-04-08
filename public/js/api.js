const API_BASE = '/api';

const API = {
    async fetch(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Something went wrong');
            return data;
        } catch (error) {
            console.error('API Error:', error);
            Toast.error(error.message);
            throw error;
        }
    },

    // Auth
    login(credentials) {
        return this.fetch('/login', { method: 'POST', body: JSON.stringify(credentials) });
    },
    getAdmin() {
        return this.fetch('/admin');
    },
    updateAdmin(data) {
        return this.fetch('/admin', { method: 'PUT', body: JSON.stringify(data) });
    },

    // Students
    getStudents() {
        return this.fetch('/students');
    },
    createStudent(data) {
        return this.fetch('/students', { method: 'POST', body: JSON.stringify(data) });
    },
    updateStudent(id, data) {
        return this.fetch(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) });
    },
    deleteStudent(id) {
        return this.fetch(`/students/${id}`, { method: 'DELETE' });
    },

    // Assessments
    getAssessments(studentId) {
        const query = studentId ? `?studentId=${studentId}` : '';
        return this.fetch(`/assessments${query}`);
    },
    createAssessment(data) {
        return this.fetch('/assessments', { method: 'POST', body: JSON.stringify(data) });
    },

    // Reports
    getReports(studentId) {
        const query = studentId ? `?studentId=${studentId}` : '';
        return this.fetch(`/reports${query}`);
    }
};

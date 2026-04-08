const API_BASE = '/api';
const API_TIMEOUT_MS = 15000;

const API = {
    async fetch(endpoint, options = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });
            clearTimeout(timeoutId);
            const contentType = response.headers.get('content-type') || '';
            const data = contentType.includes('application/json')
                ? await response.json()
                : { message: `Unexpected response from server (${response.status})` };
            if (!response.ok) throw new Error(data.message || 'Something went wrong');
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                Toast.error('Server timeout. Please try again.');
                throw new Error('Request timeout');
            }
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

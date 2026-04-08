require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

const proxyKeys = ['HTTP_PROXY', 'HTTPS_PROXY', 'http_proxy', 'https_proxy'];
proxyKeys.forEach((key) => {
    const value = process.env[key];
    if (value && value.includes('127.0.0.1:9')) {
        delete process.env[key];
    }
});
if (!process.env.NO_PROXY) {
    process.env.NO_PROXY = 'localhost,127.0.0.1,.googleapis.com';
}

const DEFAULT_SERVICE_ACCOUNT_PATH = 'C:\\Users\\dudek\\Downloads\\student-1ac26-firebase-adminsdk-fbsvc-41ffec3874.json';
const ADMIN_COLLECTION = 'admins';
const STUDENT_COLLECTION = 'students';
const ASSESSMENT_COLLECTION = 'assessments';
const ADMIN_ID = 'admin-1';

const defaultAdmin = {
    id: ADMIN_ID,
    name: 'D. Sadiq',
    email: 'sadiq123@gmail.com',
    password: 'sadiq@2007',
    role: 'admin'
};

let db;
let resolvedServiceAccountPath = '(env-json)';
let databaseURL = '';
let bootstrapPromise;

function loadServiceAccountFromEnv() {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        return { account: JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON), source: 'FIREBASE_SERVICE_ACCOUNT_JSON' };
    }

    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        const decoded = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf8');
        return { account: JSON.parse(decoded), source: 'FIREBASE_SERVICE_ACCOUNT_BASE64' };
    }

    return null;
}

function resolveServiceAccount() {
    const envCredential = loadServiceAccountFromEnv();
    if (envCredential) {
        resolvedServiceAccountPath = envCredential.source;
        return envCredential.account;
    }

    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || DEFAULT_SERVICE_ACCOUNT_PATH;
    resolvedServiceAccountPath = path.resolve(serviceAccountPath);

    if (!fs.existsSync(resolvedServiceAccountPath)) {
        throw new Error(
            `Firebase service account key not found at "${resolvedServiceAccountPath}". ` +
            'Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON.'
        );
    }

    return JSON.parse(fs.readFileSync(resolvedServiceAccountPath, 'utf8'));
}

function initFirebase() {
    if (db) {
        return db;
    }

    const serviceAccount = resolveServiceAccount();
    const projectId = process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id;
    databaseURL = process.env.FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.firebaseio.com`;

    if (!getApps().length) {
        initializeApp({
            credential: cert(serviceAccount),
            databaseURL
        });
    }

    db = getDatabase();
    return db;
}

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const authenticate = (_req, _res, next) => {
    next();
};

function getStartupHelp(error) {
    const message = String(error?.message || '');
    if (message.includes('Firebase error. Please ensure that you have the URL of your Firebase Realtime Database instance configured correctly')) {
        return 'Set FIREBASE_DATABASE_URL to your actual Realtime Database URL from Firebase Console > Realtime Database.';
    }
    if (message.includes('PERMISSION_DENIED')) {
        return 'Enable required Firebase/Google API in Google Cloud Console for this project and retry.';
    }
    return 'Check Firebase credentials and env vars (FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH).';
}

const asyncHandler = (fn) => async (req, res) => {
    try {
        await bootstrap();
        await fn(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

async function ensureSeedData() {
    const adminRef = initFirebase().ref(`${ADMIN_COLLECTION}/${ADMIN_ID}`);
    const snapshot = await adminRef.get();
    if (!snapshot.exists()) {
        await adminRef.set(defaultAdmin);
    }
}

function bootstrap() {
    if (!bootstrapPromise) {
        bootstrapPromise = ensureSeedData();
    }
    return bootstrapPromise;
}

async function getAdmin() {
    const adminRef = initFirebase().ref(`${ADMIN_COLLECTION}/${ADMIN_ID}`);
    const snapshot = await adminRef.get();
    if (!snapshot.exists()) {
        await adminRef.set(defaultAdmin);
        return defaultAdmin;
    }
    return snapshot.val();
}

async function getStudents() {
    const snapshot = await initFirebase().ref(STUDENT_COLLECTION).get();
    const value = snapshot.val() || {};
    return Object.values(value);
}

async function getAssessments(studentId) {
    const snapshot = await initFirebase().ref(ASSESSMENT_COLLECTION).get();
    const value = snapshot.val() || {};
    const allAssessments = Object.values(value);
    return studentId
        ? allAssessments.filter((assessment) => assessment.studentId === studentId)
        : allAssessments;
}

async function isStudentEmailTaken(email, excludeStudentId) {
    const students = await getStudents();
    return students.some((student) => student.email === email && student.id !== excludeStudentId);
}

app.post('/api/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const admin = await getAdmin();

    if (email === admin.email && password === admin.password) {
        const { password: _password, ...userWithoutPassword } = admin;
        return res.json({ success: true, user: userWithoutPassword, message: 'Login successful' });
    }

    const students = await getStudents();
    const student = students.find((entry) => entry.email === email && entry.password === password);

    if (student) {
        const { password: _password, ...userWithoutPassword } = student;
        return res.json({ success: true, user: userWithoutPassword, message: 'Login successful' });
    }

    return res.status(401).json({ success: false, message: 'Invalid email or password' });
}));

app.get('/api/admin', authenticate, asyncHandler(async (_req, res) => {
    const admin = await getAdmin();
    const { password, ...data } = admin;
    res.json(data);
}));

app.put('/api/admin', authenticate, asyncHandler(async (req, res) => {
    const adminRef = initFirebase().ref(`${ADMIN_COLLECTION}/${ADMIN_ID}`);
    const currentAdmin = await getAdmin();
    const updatedAdmin = { ...currentAdmin, ...req.body, id: ADMIN_ID, role: 'admin' };

    await adminRef.set(updatedAdmin);
    const { password, ...data } = updatedAdmin;
    res.json({ success: true, user: data });
}));

app.get('/api/students', authenticate, asyncHandler(async (_req, res) => {
    const students = await getStudents();
    res.json(students);
}));

app.post('/api/students', authenticate, asyncHandler(async (req, res) => {
    const { name, email, password, grade } = req.body;
    const admin = await getAdmin();

    if ((await isStudentEmailTaken(email)) || admin.email === email) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const id = `student-${Date.now()}`;
    const newStudent = {
        id,
        name,
        email,
        password,
        grade,
        role: 'student',
        createdAt: new Date().toISOString()
    };

    await initFirebase().ref(`${STUDENT_COLLECTION}/${id}`).set(newStudent);
    return res.status(201).json(newStudent);
}));

app.put('/api/students/:id', authenticate, asyncHandler(async (req, res) => {
    const { id } = req.params;
    const studentRef = initFirebase().ref(`${STUDENT_COLLECTION}/${id}`);
    const studentSnapshot = await studentRef.get();

    if (!studentSnapshot.exists()) {
        return res.status(404).json({ message: 'Student not found' });
    }

    const admin = await getAdmin();
    const { email } = req.body;

    if (email && ((await isStudentEmailTaken(email, id)) || admin.email === email)) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const currentStudent = studentSnapshot.val();
    const updatedStudent = { ...currentStudent, ...req.body, id };
    await studentRef.set(updatedStudent);

    return res.json(updatedStudent);
}));

app.delete('/api/students/:id', authenticate, asyncHandler(async (req, res) => {
    const { id } = req.params;

    await initFirebase().ref(`${STUDENT_COLLECTION}/${id}`).remove();

    const assessments = await getAssessments();
    const updates = {};
    assessments.forEach((assessment) => {
        if (assessment.studentId === id) {
            updates[`${ASSESSMENT_COLLECTION}/${assessment.id}`] = null;
        }
    });

    if (Object.keys(updates).length > 0) {
        await initFirebase().ref().update(updates);
    }

    return res.json({ success: true });
}));

app.get('/api/assessments', authenticate, asyncHandler(async (req, res) => {
    const { studentId } = req.query;
    const assessments = await getAssessments(studentId);
    res.json(assessments);
}));

app.post('/api/assessments', authenticate, asyncHandler(async (req, res) => {
    const { studentId, subject, type, score } = req.body;
    const id = `assessment-${Date.now()}`;
    const newAssessment = {
        id,
        studentId,
        subject,
        type,
        score: Number(score),
        createdAt: new Date().toISOString()
    };

    await initFirebase().ref(`${ASSESSMENT_COLLECTION}/${id}`).set(newAssessment);
    return res.status(201).json(newAssessment);
}));

app.get('/api/reports', authenticate, asyncHandler(async (req, res) => {
    const { studentId } = req.query;
    const [students, targetAssessments] = await Promise.all([
        getStudents(),
        getAssessments(studentId)
    ]);

    const totalStudents = students.length;
    const totalAssessments = targetAssessments.length;
    const overallAverage = totalAssessments > 0
        ? targetAssessments.reduce((sum, assessment) => sum + assessment.score, 0) / totalAssessments
        : 0;

    const subjectPerformance = {};
    targetAssessments.forEach((assessment) => {
        if (!subjectPerformance[assessment.subject]) {
            subjectPerformance[assessment.subject] = { total: 0, count: 0 };
        }
        subjectPerformance[assessment.subject].total += assessment.score;
        subjectPerformance[assessment.subject].count += 1;
    });

    const subjects = Object.keys(subjectPerformance).map((name) => ({
        name,
        average: subjectPerformance[name].total / subjectPerformance[name].count
    }));

    res.json({
        totalStudents,
        totalAssessments,
        overallAverage,
        subjects
    });
}));

if (require.main === module) {
    bootstrap()
        .then(() => {
            app.listen(PORT, () => {
                console.log(`Server running at http://localhost:${PORT}`);
                console.log(`Connected to Firebase using ${resolvedServiceAccountPath}`);
                console.log(`Realtime Database URL: ${databaseURL}`);
            });
        })
        .catch((error) => {
            console.error('Failed to start server:', error);
            console.error('Startup hint:', getStartupHelp(error));
            process.exit(1);
        });
}

module.exports = app;

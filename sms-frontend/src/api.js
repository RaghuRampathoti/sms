// API configuration and Axios instance
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401, clear storage and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Auth
export const login = (data) => api.post('/auth/login', data);
export const signup = (data) => api.post('/auth/signup', data);

// Uploads
export const uploadFile = (data) => api.post('/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });

// Students
export const getStudents = () => api.get('/students');
export const getStudentsByClass = (classId) => api.get(`/students/class/${classId}`);
export const getStudentById = (id) => api.get(`/students/${id}`);
export const getMyStudentProfile = () => api.get('/students/my');
export const updateStudent = (id, data) => api.put(`/students/${id}`, data);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

// Teachers
export const getTeachers = () => api.get('/teachers');
export const getTeacherById = (id) => api.get(`/teachers/${id}`);
export const updateTeacher = (id, data) => api.put(`/teachers/${id}`, data);
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`);

// Classes
export const getClasses = () => api.get('/classes');
export const createClass = (data) => api.post('/classes', data);
export const updateClass = (id, data) => api.put(`/classes/${id}`, data);
export const deleteClass = (id) => api.delete(`/classes/${id}`);

// Subjects
export const getSubjects = () => api.get('/subjects');
export const getSubjectsByClass = (classId) => api.get(`/subjects/class/${classId}`);
export const createSubject = (data) => api.post('/subjects', data);
export const updateSubject = (id, data) => api.put(`/subjects/${id}`, data);
export const deleteSubject = (id) => api.delete(`/subjects/${id}`);

// Attendance
export const saveAttendance = (data) => api.post('/attendance', data);
export const getAttendance = (params) => api.get('/attendance/filter', { params });
export const getStudentAttendance = (studentId) => api.get(`/attendance/student/${studentId}`);
export const saveTeacherAttendance = (data) => api.post('/attendance/teacher', data);
export const getTeacherAttendance = (date) => api.get(`/attendance/teacher?date=${date}`);
export const getDailyReportUrl = (classId, date) => `${API_BASE}/attendance/report/daily?classId=${classId}&date=${date}`;
export const downloadDailyReport = (classId, date) => api.get('/attendance/report/daily', { params: { classId, date }, responseType: 'blob' });
export const getMonthlyReportUrl = (studentId, month, year) => `${API_BASE}/attendance/report/monthly?studentId=${studentId}&month=${month}&year=${year}`;

// Leaves
export const applyLeave = (data) => api.post('/leaves', data);
export const getLeaves = () => api.get('/leaves');
export const getMyLeaves = () => api.get('/leaves/my');
export const updateLeave = (id, status, remarks) => api.put(`/leaves/${id}`, null, { params: { status, remarks } });

// Holidays
export const getHolidays = () => api.get('/holidays');
export const createHoliday = (data) => api.post('/holidays', data);
export const deleteHoliday = (id) => api.delete(`/holidays/${id}`);

// Announcements
export const getAnnouncements = () => api.get('/announcements');
export const createAnnouncement = (data) => api.post('/announcements', data);
export const deleteAnnouncement = (id) => api.delete(`/announcements/${id}`);

// Exams
export const getExams = () => api.get('/exams');
export const getExamsByClass = (classId) => api.get(`/exams/class/${classId}`);
export const createExam = (data) => api.post('/exams', data);
export const deleteExam = (id) => api.delete(`/exams/${id}`);

// Results
export const getResultsByExam = (examId) => api.get(`/results/exam/${examId}`);
export const getResultsByStudent = (studentId) => api.get(`/results/student/${studentId}`);
export const createResult = (data) => api.post('/results', data);

// Fees
export const getFees = () => api.get('/fees');
export const getStudentFees = (studentId) => api.get(`/fees/student/${studentId}`);
export const createFee = (data) => api.post('/fees', data);
export const payFee = (id, amount) => api.post(`/fees/${id}/pay`, null, { params: { amount } });

// Timetable
export const getTimetableByClass = (classId) => api.get(`/timetable/class/${classId}`);
export const getTimetableByTeacher = (teacherId) => api.get(`/timetable/teacher/${teacherId}`);
export const createTimetable = (data) => api.post('/timetable', data);
export const deleteTimetable = (id) => api.delete(`/timetable/${id}`);
export const generateFirstPeriods = (classId) => api.post(`/timetable/generate-first-periods/${classId}`);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');

// Academic Years
export const getAcademicYears = () => api.get('/academic-years');
export const createAcademicYear = (data) => api.post('/academic-years', data);
export const updateAcademicYear = (id, data) => api.put(`/academic-years/${id}`, data);
export const deleteAcademicYear = (id) => api.delete(`/academic-years/${id}`);

// Promotions
export const getEligibleForPromotion = (academicYearId, classId) => api.get('/promotions/eligible', { params: { academicYearId, classId } });
export const promoteStudents = (data) => api.post('/promotions/promote', data);

// Alumni
export const getAlumni = () => api.get('/alumni');
export const getAlumniById = (id) => api.get(`/alumni/${id}`);
export const createAlumni = (data) => api.post('/alumni', data);
export const getAlumniCandidates = (academicYearId, classId) => api.get('/alumni/candidates', { params: { academicYearId, classId } });
export const getAlumniCandidatesByYear = (year) => api.get('/alumni/candidates/by-year', { params: { year } });
export const getAlumniCandidatesByYearAndClass = (year, className) => api.get('/alumni/candidates/by-year-class', { params: { year, className } });
export const getAlumniCandidatesByYearIdAndClass = (academicYearId, className) => api.get('/alumni/candidates/by-year-id-class', { params: { academicYearId, className } });
export const getAlumniCandidatesByClass = (className) => api.get('/alumni/candidates/by-class', { params: { className } });
export const getAlumniCandidatesByDates = (startDate, endDate) => api.get('/alumni/candidates/by-dates', { params: { startDate, endDate } });
export const bulkTransferAlumni = (data) => api.post('/alumni/bulk-transfer', data);
export const updateAlumni = (id, data) => api.put(`/alumni/${id}`, data);
export const deleteAlumni = (id) => api.delete(`/alumni/${id}`);
export const renameAlumniFolder = (oldName, newName) => api.put('/alumni/folder/rename', null, { params: { oldName, newName } });


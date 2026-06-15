import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Teachers from './pages/Teachers';
import Classes from './pages/Classes';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Holidays from './pages/Holidays';
import Announcements from './pages/Announcements';
import Exams from './pages/Exams';
import Fees from './pages/Fees';
import Timetable from './pages/Timetable';
import './index.css';

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-dark)' }}>
      <div className="spinner" style={{ width: 50, height: 50 }} />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="sms-shell">
      <Sidebar />
      <div className="sms-main">
        <Header />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
          <Route path="/students" element={<ProtectedLayout><Students /></ProtectedLayout>} />
          <Route path="/teachers" element={<ProtectedLayout><Teachers /></ProtectedLayout>} />
          <Route path="/classes" element={<ProtectedLayout><Classes /></ProtectedLayout>} />
          <Route path="/attendance" element={<ProtectedLayout><Attendance /></ProtectedLayout>} />
          <Route path="/leaves" element={<ProtectedLayout><Leaves /></ProtectedLayout>} />
          <Route path="/holidays" element={<ProtectedLayout><Holidays /></ProtectedLayout>} />
          <Route path="/announcements" element={<ProtectedLayout><Announcements /></ProtectedLayout>} />
          <Route path="/exams" element={<ProtectedLayout><Exams /></ProtectedLayout>} />
          <Route path="/fees" element={<ProtectedLayout><Fees /></ProtectedLayout>} />
          <Route path="/timetable" element={<ProtectedLayout><Timetable /></ProtectedLayout>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

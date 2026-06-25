import { useLocation, useNavigate } from 'react-router-dom';
import { FiBell, FiSearch, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../AuthContext';

const pageTitles = {
  '/dashboard': { title: 'Dashboard', sub: 'Overview of school activity' },
  '/students': { title: 'Student Management', sub: 'View, add, and manage students' },
  '/teachers': { title: 'Teacher Management', sub: 'Manage school faculty' },
  '/classes': { title: 'Classes & Subjects' },
  '/attendance': { title: 'Attendance', sub: 'Record and view student attendance' },
  '/leaves': { title: 'Leave Requests', sub: 'Manage leave applications' },
  '/holidays': { title: 'Holiday Calendar', sub: 'Academic year holidays' },
  '/announcements': { title: 'Announcements', sub: 'School-wide notifications' },
  '/exams': { title: 'Exams & Results', sub: 'Examination scheduling and results' },
  '/fees': { title: 'Fee Management', sub: 'Track student fees and payments' },
  '/timetable': { title: 'Timetable', sub: 'Class schedule management' },
};

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const page = pageTitles[location.pathname] || { title: 'SMS', sub: '' };
  const now = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <header className="sms-header">
      <div>
        <div className="header-title">{page.title}</div>
        <div className="header-sub">{page.sub} &mdash; {now}</div>
      </div>
      <div className="header-actions">
        <button id="header-search" className="header-btn"><FiSearch /></button>
        <button id="header-notify" className="header-btn"><FiBell /></button>
        <div style={{
          padding: '6px 14px',
          background: 'rgba(99,102,241,0.1)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          fontSize: 12.5,
          color: 'var(--primary-light)',
          fontWeight: 600
        }}>
          {user?.role?.replace('ROLE_', '') || 'USER'}
        </div>
        <button onClick={handleLogout} className="header-btn" title="Logout" style={{ marginLeft: 8, color: 'var(--danger)' }}>
          <FiLogOut />
        </button>
      </div>
    </header>
  );
}

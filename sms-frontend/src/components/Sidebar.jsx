import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  FiGrid, FiUsers, FiBriefcase, FiBookOpen, FiCheckSquare,
  FiCalendar, FiMic, FiFileText, FiDollarSign, FiClock,
  FiLogOut, FiSun, FiBell
} from 'react-icons/fi';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
    ],
  },
  {
    label: 'People',
    items: [
      { path: '/students', icon: <FiUsers />, label: 'Students' },
      { path: '/teachers', icon: <FiBriefcase />, label: 'Teachers' },
    ],
  },
  {
    label: 'Academic',
    items: [
      { path: '/classes', icon: <FiBookOpen />, label: 'Classes & Subjects' },
      { path: '/timetable', icon: <FiClock />, label: 'Timetable' },
      { path: '/attendance', icon: <FiCheckSquare />, label: 'Attendance' },
      { path: '/exams', icon: <FiFileText />, label: 'Exams & Results' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { path: '/leaves', icon: <FiCalendar />, label: 'Leave Requests' },
      { path: '/holidays', icon: <FiSun />, label: 'Holidays' },
      { path: '/announcements', icon: <FiBell />, label: 'Announcements' },
      { path: '/fees', icon: <FiDollarSign />, label: 'Fee Management' },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  return (
    <aside className="sms-sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🎓</div>
        <div className="sidebar-brand-text">
          EduManage
          <span>School Management System</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="nav-section-label">{group.label}</div>
            {group.items.map((item) => (
              <button
                key={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-card" onClick={handleLogout}>
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <div className="user-name">{user?.username || 'User'}</div>
            <div className="user-role">{user?.role?.replace('ROLE_', '') || 'Guest'}</div>
          </div>
          <FiLogOut style={{ color: 'var(--text-muted)', fontSize: 15 }} />
        </div>
      </div>
    </aside>
  );
}

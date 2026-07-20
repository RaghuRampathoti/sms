import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  FiGrid, FiUsers, FiBriefcase, FiBookOpen, FiCheckSquare,
  FiCalendar, FiMic, FiFileText, FiDollarSign, FiClock,
  FiLogOut, FiSun, FiBell
} from 'react-icons/fi';
import { useState, useEffect } from 'react';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
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
    label: 'People',
    items: [
      { path: '/students', icon: <FiUsers />, label: 'Students' },
      { path: '/teachers', icon: <FiBriefcase />, label: 'Teachers' },
      { path: '/alumni', icon: <FiUsers />, label: 'Alumni' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { path: '/academic-years', icon: <FiCalendar />, label: 'Academic Years' },
      { path: '/leaves', icon: <FiCalendar />, label: 'Leave Requests' },
      { path: '/holidays', icon: <FiSun />, label: 'Holidays' },
      { path: '/announcements', icon: <FiBell />, label: 'Announcements' },
      { path: '/fees', icon: <FiDollarSign />, label: 'Fee Management' },
      { path: '/promotions', icon: <FiCheckSquare />, label: 'Promotions' },
    ],
  },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const [schoolName, setSchoolName] = useState(() => localStorage.getItem('schoolName') || 'EduManage');
  const [schoolSubtitle, setSchoolSubtitle] = useState(() => localStorage.getItem('schoolSubtitle') || 'School Management System');
  const [schoolLogo, setSchoolLogo] = useState(() => localStorage.getItem('schoolLogo') || null);

  useEffect(() => {
    const handleStorageChange = () => {
      setSchoolName(localStorage.getItem('schoolName') || 'EduManage');
      setSchoolSubtitle(localStorage.getItem('schoolSubtitle') || 'School Management System');
      setSchoolLogo(localStorage.getItem('schoolLogo') || null);
    };
    window.addEventListener('schoolBrandUpdate', handleStorageChange);
    return () => window.removeEventListener('schoolBrandUpdate', handleStorageChange);
  }, []);

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : '??';

  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isStudent = user?.role === 'ROLE_STUDENT';

  const filteredGroups = navGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (isStudent) {
        const allowedForStudent = ['/dashboard', '/timetable', '/attendance', '/exams', '/announcements', '/fees'];
        return allowedForStudent.includes(item.path);
      } else {
        if ((item.path === '/fees' || item.path === '/promotions' || item.path === '/academic-years') && !isAdmin) return false;
        return true;
      }
    })
  })).filter(group => group.items.length > 0);

  return (
    <aside className="sms-sidebar">
      <div className="sidebar-brand" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <div 
          className="sidebar-brand-icon" 
          style={{ position: 'relative', overflow: 'hidden', padding: schoolLogo ? 0 : undefined }}
        >
          {schoolLogo ? (
            <img src={schoolLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            '🎓'
          )}
        </div>
        <div className="sidebar-brand-text" style={{ flex: 1 }}>
          {schoolName}
          <span>{schoolSubtitle}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {filteredGroups.map((group) => (
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

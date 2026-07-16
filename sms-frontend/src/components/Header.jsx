import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiBell, FiSettings, FiLogOut, FiMoon, FiSun, FiDroplet, FiUpload, FiX } from 'react-icons/fi';
import { useAuth } from '../AuthContext';
import { uploadFile } from '../api';

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

  const themes = ['default', 'dark-theme', 'theme-blue', 'theme-purple', 'theme-green', 'theme-gold'];
  const [themeIndex, setThemeIndex] = useState(0);

  const [showThemeSelector, setShowThemeSelector] = useState(false);
  
  // Settings Modal State
  const [showSettings, setShowSettings] = useState(false);
  const [schoolName, setSchoolName] = useState('');
  const [schoolSubtitle, setSchoolSubtitle] = useState('');
  const [schoolLogo, setSchoolLogo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (showSettings) {
      setSchoolName(localStorage.getItem('schoolName') || 'EduManage');
      setSchoolSubtitle(localStorage.getItem('schoolSubtitle') || 'School Management System');
      setSchoolLogo(localStorage.getItem('schoolLogo') || null);
    }
  }, [showSettings]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setIsUploading(true);
    try {
      const res = await uploadFile(formData);
      setSchoolLogo(res.data.url);
    } catch (err) {
      console.error('Failed to upload logo', err);
      alert('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const saveSettings = () => {
    localStorage.setItem('schoolName', schoolName);
    localStorage.setItem('schoolSubtitle', schoolSubtitle);
    if (schoolLogo) localStorage.setItem('schoolLogo', schoolLogo);
    window.dispatchEvent(new Event('schoolBrandUpdate'));
    setShowSettings(false);
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('sms-theme') || 'default';
    const idx = themes.indexOf(savedTheme);
    if (idx !== -1) {
      setThemeIndex(idx);
      if (savedTheme !== 'default') {
        document.documentElement.classList.add(savedTheme);
        document.body.classList.add(savedTheme);
      }
    }
  }, []);

  const selectTheme = (theme) => {
    const currentTheme = themes[themeIndex];
    if (currentTheme !== 'default') {
      document.documentElement.classList.remove(currentTheme);
      document.body.classList.remove(currentTheme);
    }
    if (theme !== 'default') {
      document.documentElement.classList.add(theme);
      document.body.classList.add(theme);
    }
    localStorage.setItem('sms-theme', theme);
    setThemeIndex(themes.indexOf(theme));
    setShowThemeSelector(false);
  };

  const getThemeColor = (theme) => {
    switch(theme) {
      case 'default': return '#f8fafc';
      case 'dark-theme': return '#0f172a';
      case 'theme-blue': return '#3b82f6';
      case 'theme-purple': return '#9333ea';
      case 'theme-green': return '#22c55e';
      case 'theme-gold': return 'linear-gradient(135deg, var(--primary-light), #b45309)';
      default: return '#f8fafc';
    }
  };

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
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowThemeSelector(!showThemeSelector)} 
            className="header-btn" 
            title="Select Theme"
          >
            <FiDroplet />
          </button>
          {showThemeSelector && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '12px',
              display: 'flex',
              gap: '8px',
              boxShadow: 'var(--shadow)',
              zIndex: 100
            }}>
              {themes.map((theme, idx) => (
                <button
                  key={theme}
                  onClick={() => selectTheme(theme)}
                  style={{
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    border: themeIndex === idx ? '2px solid var(--primary)' : '1px solid var(--border)',
                    background: getThemeColor(theme),
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  title={theme.replace('theme-', '').replace('-theme', '')}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              ))}
            </div>
          )}
        </div>
        <div style={{ position: 'relative' }}>
          <button id="header-settings" className="header-btn" onClick={() => setShowSettings(!showSettings)}>
            <FiSettings />
          </button>
          {showSettings && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              width: '320px',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 16, fontWeight: 700, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 4, color: 'var(--text-primary)' }}>
                <FiSettings style={{ color: 'var(--primary)' }} /> Brand Settings
              </div>
              
              <div className="sms-form-group" style={{ marginBottom: 0 }}>
                <label className="sms-label">School Name</label>
                <input 
                  className="sms-input"
                  value={schoolName} 
                  onChange={(e) => setSchoolName(e.target.value)} 
                  placeholder="e.g. EduManage" 
                />
              </div>

              <div className="sms-form-group" style={{ marginBottom: 0 }}>
                <label className="sms-label">Subtitle</label>
                <input 
                  className="sms-input"
                  value={schoolSubtitle} 
                  onChange={(e) => setSchoolSubtitle(e.target.value)} 
                  placeholder="e.g. School Management System" 
                />
              </div>

              <div className="sms-form-group" style={{ marginBottom: 0 }}>
                <label className="sms-label">School Logo</label>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: '6px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid var(--border)', flexShrink: 0, fontSize: '20px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                     {schoolLogo ? <img src={schoolLogo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🎓'}
                  </div>
                  <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" style={{ display: 'none' }} />
                  <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={isUploading} style={{ flex: 1, justifyContent: 'center', height: '38px' }}>
                    {isUploading ? <span className="spinner" style={{width: 16, height: 16, borderWidth: 2, borderColor: 'var(--primary)', borderTopColor: 'transparent'}} /> : <><FiUpload /> Upload Image</>}
                  </button>
                </div>
              </div>

              <button className="btn btn-primary w-full flex-center" onClick={saveSettings} style={{ marginTop: '8px', padding: '12px', fontSize: '14px' }}>
                Save Changes
              </button>
            </div>
          )}
        </div>
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

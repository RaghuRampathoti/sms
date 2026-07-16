import { useEffect, useState } from 'react';
import { getDashboardStats, getMyStudentProfile, getSubjectsByClass } from '../api';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers, FiBriefcase, FiBookOpen, FiBook,
  FiCalendar, FiCheckSquare, FiTrendingUp,
  FiBell, FiInfo, FiClock, FiFileText, FiSun, FiDollarSign
} from 'react-icons/fi';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStudent = user?.role === 'ROLE_STUDENT';

  const [stats, setStats] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetchPromises = [
      getDashboardStats().then(r => setStats(r.data)).catch(() => setStats({
        totalStudents: 0, totalTeachers: 0, totalClasses: 0,
        totalSubjects: 0, pendingLeaves: 0, todayAttendancePercentage: 0,
        teacherAttendancePercentage: 0, recentAnnouncements: []
      }))
    ];

    if (isStudent) {
      fetchPromises.push(
        getMyStudentProfile().then(r => {
          setStudentProfile(r.data);
          if (r.data?.schoolClass?.id) {
            return getSubjectsByClass(r.data.schoolClass.id).then(res => setSubjects(res.data));
          }
        }).catch(() => {})
      );
    }

    Promise.all(fetchPromises).finally(() => setLoading(false));
  }, [isStudent]);

  if (loading) {
    return (
      <div className="flex-center" style={{ height: 300 }}>
        <div className="spinner" style={{ width: 40, height: 40, borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const adminStatDefs = [
    { key: 'totalStudents', label: 'Total Students', icon: <FiUsers />, color: 'indigo' },
    { key: 'totalTeachers', label: 'Total Teachers', icon: <FiBriefcase />, color: 'cyan' },
    { key: 'totalClasses', label: 'Total Classes', icon: <FiBookOpen />, color: 'emerald' },
    { key: 'totalSubjects', label: 'Total Subjects', icon: <FiBook />, color: 'amber' },
    { key: 'pendingLeaves', label: 'Pending Leaves', icon: <FiCalendar />, color: 'rose' },
    { key: 'todayAttendancePercentage', label: "Student Attendance", icon: <FiCheckSquare />, color: 'violet', format: v => `${Number(v || 0).toFixed(1)}%` },
    { key: 'teacherAttendancePercentage', label: "Teacher Attendance", icon: <FiTrendingUp />, color: 'fuchsia', format: v => `${Number(v || 0).toFixed(1)}%` },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {!isStudent && (
        <div className="stat-grid">
          {adminStatDefs.map(def => (
            <div key={def.key} className={`stat-card ${def.color}`}>
              <div className={`stat-icon ${def.color}`}>{def.icon}</div>
              <div>
                <div className="stat-value">
                  {def.format ? def.format(stats?.[def.key] || 0) : stats?.[def.key] || 0}
                </div>
                <div className="stat-label">{def.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hero Welcome Banner - Golfspace Style */}
      {isStudent && studentProfile && (
        <div style={{ 
          background: `linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)`, /* Deep Charcoal */
          color: 'white',
          borderRadius: '16px',
          padding: '30px 40px', /* Reduced padding to save space */
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)'
        }}>
          {/* Neon accents */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)', boxShadow: '0 0 20px var(--primary)' }}></div>
          <div style={{ position: 'absolute', top: '-100px', right: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(var(--primary-rgb),0.15) 0%, rgba(var(--primary-rgb),0) 70%)' }}></div>
          
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2, marginBottom: '16px' }}>
              The Space That <span style={{ color: 'var(--primary-light)', textShadow: '0 0 15px rgba(251, 191, 36,0.5)' }}>Education's</span> Been Missing
            </h1>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ background: 'var(--primary)', boxShadow: '0 0 15px rgba(var(--primary-rgb),0.5)', color: 'white', padding: '8px 20px', borderRadius: '4px', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Welcome, {studentProfile.user?.username}
              </div>
              <div style={{ display: 'flex', gap: '20px', color: '#9ca3af', fontSize: '14px', fontWeight: 500 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiBook /> Class {studentProfile.studentClass?.className}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiUsers /> Roll: {studentProfile.rollNumber}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Modules Grid */}
      <div style={{ marginBottom: '32px', animation: 'slideUp 0.45s ease' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>Quick Access</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', 
          gap: '12px' 
        }}>
          {/* Always show these to everyone (assuming basic access, but routing handles actual guards) */}
          {[
            { label: 'Students', icon: <FiUsers />, path: '/students', show: !isStudent },
            { label: 'Teachers', icon: <FiBriefcase />, path: '/teachers', show: !isStudent },
            { label: 'Classes', icon: <FiBookOpen />, path: '/classes', show: !isStudent },
            { label: 'Timetable', icon: <FiClock />, path: '/timetable', show: true },
            { label: 'Attendance', icon: <FiCheckSquare />, path: '/attendance', show: true },
            { label: 'Exams', icon: <FiFileText />, path: '/exams', show: true },
            { label: 'Leaves', icon: <FiCalendar />, path: '/leaves', show: true },
            { label: 'Holidays', icon: <FiSun />, path: '/holidays', show: true },
            { label: 'Announcements', icon: <FiBell />, path: '/announcements', show: true },
            { label: 'Fees', icon: <FiDollarSign />, path: '/fees', show: true },
          ].filter(item => item.show).map((module, i) => (
            <button
              key={i}
              onClick={() => navigate(module.path)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '10px', padding: '16px 10px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'pointer',
                transition: 'var(--transition)',
                outline: 'none'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{
                width: 42, height: 42, borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.15), rgba(var(--primary-rgb), 0.05))',
                color: 'var(--primary-dark)',
                border: '1px solid rgba(var(--primary-rgb), 0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18
              }}>
                {module.icon}
              </div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)' }}>{module.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid-2" style={{ gap: '32px' }}>
        
        {/* Left Column: Announcements */}
        <div style={{ animation: 'slideUp 0.5s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '24px' }}>
            <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 0 10px rgba(var(--primary-rgb), 0.2)' }}>
              <FiBell />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Recent Announcements</h2>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Stay updated with the latest news</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats?.recentAnnouncements?.length > 0 ? (
              stats.recentAnnouncements.map((a, i) => (
                <div key={i} style={{
                  padding: '24px',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border)',
                  transition: 'var(--transition)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow), 0 0 15px rgba(var(--primary-rgb),0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '3px', background: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }}></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', paddingRight: 10 }}>{a.title}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(var(--primary-rgb), 0.1)', padding: '4px 10px', borderRadius: '20px' }}>
                      <FiCalendar size={12} />
                      {new Date(a.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{a.content?.substring(0, 150)}{a.content?.length > 150 ? '…' : ''}</div>
                </div>
              ))
            ) : (
              <div className="flex-center" style={{ padding: '60px 20px', flexDirection: 'column', gap: 12, color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                <FiInfo style={{ fontSize: 32, opacity: 0.3 }} />
                <div style={{ fontSize: 14 }}>No announcements at the moment</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Subjects (Only for Student) */}
        {isStudent && (
          <div style={{ animation: 'slideUp 0.6s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '24px' }}>
              <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: '0 0 10px rgba(var(--primary-rgb), 0.2)' }}>
                <FiBookOpen />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>My Subjects</h2>
                <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Enrolled for {studentProfile?.studentClass?.className}</div>
              </div>
            </div>

            {subjects.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                {subjects.map((s, i) => (
                  <div key={i} style={{ 
                    padding: '20px', 
                    borderRadius: '16px', 
                    background: 'var(--bg-card)', 
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex', alignItems: 'center', gap: 16,
                    transition: 'var(--transition)', cursor: 'default'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow), 0 0 15px rgba(var(--primary-rgb), 0.1)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    <div style={{ 
                      width: 44, height: 44, borderRadius: '12px', 
                      background: '#1f2937', color: 'var(--primary)', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: 18, fontWeight: 700,
                      boxShadow: 'inset 0 0 8px rgba(var(--primary-rgb), 0.4)'
                    }}>
                      {s.subjectName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 15 }}>
                      {s.subjectName}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-center" style={{ padding: '60px 20px', flexDirection: 'column', gap: 12, color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                <FiInfo style={{ fontSize: 32, opacity: 0.3 }} />
                <div style={{ fontSize: 14 }}>No subjects found</div>
              </div>
            )}
          </div>
        )}
        
        {!isStudent && (
          <div className="card" style={{ animation: 'slideUp 0.6s ease' }}>
            <div className="card-header">
              <div>
                <div className="card-title">⚡ Quick Actions</div>
                <div className="card-subtitle">Common shortcuts</div>
              </div>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gap: 10 }}>
                {[
                  { label: 'Mark Attendance', desc: 'Record today\'s class attendance', icon: '✅', path: '/attendance', color: 'var(--accent)' },
                  { label: 'View Students', desc: 'Browse enrolled students', icon: '👥', path: '/students', color: 'var(--primary)' },
                  { label: 'Add Leave Request', desc: 'Apply for a leave of absence', icon: '📋', path: '/leaves', color: 'var(--warning)' },
                  { label: 'Exam Results', desc: 'View or post exam results', icon: '📊', path: '/exams', color: 'var(--secondary)' },
                ].map(qk => (
                  <a key={qk.path} href={qk.path} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '12px 14px', borderRadius: 10,
                      background: 'rgba(99,102,241,0.04)',
                      border: '1px solid var(--border)',
                      transition: 'all 0.2s', cursor: 'pointer'
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.04)'}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: 10,
                        background: `${qk.color}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20, flexShrink: 0
                      }}>{qk.icon}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{qk.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{qk.desc}</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


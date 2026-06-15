import { useEffect, useState } from 'react';
import { getDashboardStats } from '../api';
import {
  FiUsers, FiBriefcase, FiBookOpen, FiBook,
  FiCalendar, FiCheckSquare, FiMic, FiTrendingUp
} from 'react-icons/fi';

const statDefs = [
  { key: 'totalStudents', label: 'Total Students', icon: <FiUsers />, color: 'indigo' },
  { key: 'totalTeachers', label: 'Total Teachers', icon: <FiBriefcase />, color: 'cyan' },
  { key: 'totalClasses', label: 'Total Classes', icon: <FiBookOpen />, color: 'emerald' },
  { key: 'totalSubjects', label: 'Total Subjects', icon: <FiBook />, color: 'amber' },
  { key: 'pendingLeaves', label: 'Pending Leaves', icon: <FiCalendar />, color: 'rose' },
  { key: 'todayAttendancePercentage', label: "Today's Attendance", icon: <FiCheckSquare />, color: 'violet', format: v => `${v.toFixed(1)}%` },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then(r => setStats(r.data))
      .catch(() => setStats({
        totalStudents: 0, totalTeachers: 0, totalClasses: 0,
        totalSubjects: 0, pendingLeaves: 0, todayAttendancePercentage: 0,
        recentAnnouncements: []
      }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-center" style={{ height: 300 }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  return (
    <div>
      <div className="stat-grid">
        {statDefs.map(def => (
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

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Announcements */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">📢 Recent Announcements</div>
              <div className="card-subtitle">Latest news from administration</div>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {stats?.recentAnnouncements?.length > 0 ? (
              stats.recentAnnouncements.map((a, i) => (
                <div key={i} style={{
                  padding: '16px 22px',
                  borderBottom: i < stats.recentAnnouncements.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div style={{ fontWeight: 600, fontSize: 13.5, marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{a.content?.substring(0, 100)}{a.content?.length > 100 ? '…' : ''}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>{a.date?.substring(0, 10)}</div>
                </div>
              ))
            ) : (
              <div className="flex-center" style={{ padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
                No announcements yet
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="card">
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
      </div>
    </div>
  );
}

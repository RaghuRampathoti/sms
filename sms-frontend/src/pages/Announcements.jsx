import { useEffect, useState } from 'react';
import { getAnnouncements, createAnnouncement, deleteAnnouncement, getClasses } from '../api';
import { useAuth } from '../AuthContext';
import { FiPlus, FiTrash2, FiBell, FiX } from 'react-icons/fi';

export default function Announcements() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const [announcements, setAnnouncements] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', targetRole: '', targetClass: { id: '' } });
  const [saving, setSaving] = useState(false);

  const [activeTab, setActiveTab] = useState('ALL');

  const filteredAnnouncements = announcements.filter(a => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'TEACHER') return a.targetRole === 'ROLE_TEACHER';
    if (activeTab === 'STUDENT') return a.targetRole === 'ROLE_STUDENT';
    if (activeTab === 'GENERAL') return !a.targetRole || a.targetRole === 'ROLE_ADMIN';
    return true;
  });

  const load = () => {
    setLoading(true);
    Promise.all([getAnnouncements(), getClasses()])
      .then(([ar, cr]) => { setAnnouncements(ar.data); setClasses(cr.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        content: form.content,
        targetRole: form.targetRole || null,
        targetClass: form.targetClass.id ? { id: Number(form.targetClass.id) } : null,
      };
      await createAnnouncement(payload);
      setShowModal(false);
      setForm({ title: '', content: '', targetRole: '', targetClass: { id: '' } });
      load();
    } catch { }
    setSaving(false);
  };

  return (
    <div>
      {/* Hero Banner */}
      <div style={{ 
        background: `linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)`,
        color: 'white',
        borderRadius: '16px',
        padding: '30px 40px',
        marginBottom: '24px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
        animation: 'slideUp 0.4s ease'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--primary)', boxShadow: '0 0 20px var(--primary)' }}></div>
        <div style={{ position: 'absolute', top: '-100px', right: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(var(--primary-rgb),0.15) 0%, rgba(var(--primary-rgb),0) 70%)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2, margin: '0 0 8px 0' }}>
              School <span style={{ color: 'var(--primary-light)', textShadow: '0 0 15px var(--primary)' }}>Announcements</span>
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Stay updated with the latest news and notices</p>
          </div>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {isAdmin && (
              <button id="add-announcement-btn" className="btn" style={{ background: 'var(--primary)', color: 'white', border: 'none', boxShadow: '0 0 15px var(--primary)' }} onClick={() => setShowModal(true)}>
                <FiPlus /> New Announcement
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 16, overflowX: 'auto' }}>
        {[
          { id: 'ALL', label: 'All Announcements' },
          { id: 'GENERAL', label: 'General & Admin' },
          { id: 'TEACHER', label: 'Teacher Announcements' },
          { id: 'STUDENT', label: 'Student Announcements' }
        ].map(tab => (
          <button 
            key={tab.id}
            className="btn"
            style={{
              background: activeTab === tab.id ? 'var(--primary)' : 'var(--bg-card)',
              color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
              border: activeTab === tab.id ? 'none' : '1px solid var(--border)',
              padding: '8px 20px',
              borderRadius: '20px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              boxShadow: activeTab === tab.id ? '0 4px 12px rgba(var(--primary-rgb), 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: 200 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="card flex-center" style={{ height: 200, flexDirection: 'column', gap: 12 }}>
          <FiBell style={{ fontSize: 40, color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No announcements in this category</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {filteredAnnouncements.map(a => (
            <div key={a.id} className="card" style={{ 
              transition: 'var(--transition)', 
              cursor: 'default',
              borderLeft: '4px solid var(--primary)'
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow), 0 0 15px rgba(var(--primary-rgb), 0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                  <div style={{ display: 'flex', gap: 16, flex: 1 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: 'rgba(var(--primary-rgb),0.1)',
                      color: 'var(--primary-dark)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0
                    }}><FiBell /></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8, color: 'var(--text-primary)' }}>{a.title}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6 }}>{a.content}</div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <FiBell size={12}/> {a.announcementDate?.substring(0, 10)}
                        </span>
                        {a.targetRole && <span style={{ background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: 11, fontWeight: 700 }}>{a.targetRole.replace('ROLE_', '')}</span>}
                        {a.targetClass && <span style={{ background: '#0ea5e9', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: 11, fontWeight: 700 }}>Class: {a.targetClass.className}</span>}
                        {!a.targetRole && !a.targetClass && <span style={{ background: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: 11, fontWeight: 700 }}>All</span>}
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <button className="btn btn-sm" style={{ flexShrink: 0, background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px' }}
                      onClick={async () => { if (window.confirm('Delete announcement?')) { await deleteAnnouncement(a.id); load(); } }}>
                      <FiTrash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="sms-modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="sms-modal">
            <div className="sms-modal-header flex-between">
              <div className="sms-modal-title">Create Announcement</div>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="sms-form-group">
                <label className="sms-label">Title *</label>
                <input className="sms-input" required value={form.title} placeholder="Announcement title…" onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Content *</label>
                <textarea className="sms-input" rows={5} required value={form.content} placeholder="Write announcement details…" onChange={e => setForm({ ...form, content: e.target.value })} />
              </div>
              <div className="grid-2">
                <div className="sms-form-group">
                  <label className="sms-label">Target Audience</label>
                  <select className="sms-input sms-select" value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })}>
                    <option value="">All Users</option>
                    <option value="ROLE_TEACHER">Teachers Only</option>
                    <option value="ROLE_STUDENT">Students Only</option>
                    <option value="ROLE_ADMIN">Admins Only</option>
                  </select>
                </div>
                <div className="sms-form-group">
                  <label className="sms-label">Target Class (Optional)</label>
                  <select className="sms-input sms-select" value={form.targetClass.id} onChange={e => setForm({ ...form, targetClass: { id: e.target.value } })}>
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
                  </select>
                </div>
              </div>
              <div className="sms-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
      <div className="flex-between mb-6">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Announcements</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>School-wide notices and announcements</p>
        </div>
        {isAdmin && (
          <button id="add-announcement-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus /> New Announcement
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: 200 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : announcements.length === 0 ? (
        <div className="card flex-center" style={{ height: 200, flexDirection: 'column', gap: 12 }}>
          <FiBell style={{ fontSize: 40, color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>No announcements yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 14 }}>
          {announcements.map(a => (
            <div key={a.id} className="card" style={{ transition: 'transform 0.2s', cursor: 'default' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ padding: '18px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 14, flex: 1 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10,
                      background: 'rgba(99,102,241,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, flexShrink: 0
                    }}>📢</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{a.title}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: 13.5, lineHeight: 1.6 }}>{a.content}</div>
                      <div style={{ display: 'flex', gap: 10, marginTop: 10, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          📅 {a.announcementDate?.substring(0, 10)}
                        </span>
                        {a.targetRole && <span className="badge badge-primary">{a.targetRole.replace('ROLE_', '')}</span>}
                        {a.targetClass && <span className="badge badge-info">Class: {a.targetClass.className}</span>}
                        {!a.targetRole && !a.targetClass && <span className="badge badge-success">All</span>}
                      </div>
                    </div>
                  </div>
                  {isAdmin && (
                    <button className="btn btn-danger btn-sm" style={{ flexShrink: 0 }}
                      onClick={async () => { if (confirm('Delete announcement?')) { await deleteAnnouncement(a.id); load(); } }}>
                      <FiTrash2 />
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

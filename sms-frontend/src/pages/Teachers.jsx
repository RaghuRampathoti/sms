import { useEffect, useState } from 'react';
import { getTeachers, deleteTeacher, signup, updateTeacher } from '../api';
import { FiUserPlus, FiTrash2, FiSearch, FiX, FiEdit } from 'react-icons/fi';
import { useAuth } from '../AuthContext';

function Modal({ title, onClose, children }) {
  return (
    <div className="sms-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sms-modal">
        <div className="sms-modal-header flex-between">
          <div><div className="sms-modal-title">{title}</div></div>
          <button onClick={onClose} className="btn btn-secondary btn-sm"><FiX /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const initForm = {
  fullName: '', username: '', email: '', password: '', phoneNumber: '',
  specialization: '', qualification: '', department: ''
};

export default function Teachers() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleEdit = (teacher) => {
    setForm({
      id: teacher.id,
      fullName: teacher.user?.fullName || '',
      username: teacher.user?.username || '',
      email: teacher.user?.email || '',
      password: '', // leave empty when editing
      phoneNumber: teacher.phoneNumber || '',
      specialization: teacher.specialization || '',
      qualification: teacher.qualification || '',
      department: teacher.department || ''
    });
    setShowModal(true);
  };

  const load = () => {
    setLoading(true);
    getTeachers()
      .then(r => setTeachers(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this teacher?')) return;
    await deleteTeacher(id);
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (form.id) {
        await updateTeacher(form.id, { ...form });
      } else {
        await signup({ ...form, role: 'TEACHER' });
      }
      setShowModal(false);
      setForm(initForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Error saving teacher');
    } finally {
      setSaving(false);
    }
  };

  const filtered = teachers.filter(t =>
    t.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    t.specialization?.toLowerCase().includes(search.toLowerCase()) ||
    t.department?.toLowerCase().includes(search.toLowerCase())
  );

  const deptColors = { Mathematics: 'indigo', Science: 'cyan', English: 'emerald', History: 'amber', default: 'primary' };

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Teacher Directory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{teachers.length} faculty members</p>
        </div>
        {isAdmin && (
          <button id="add-teacher-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiUserPlus /> Add Teacher
          </button>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ position: 'relative', width: 280 }}>
            <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              id="teacher-search"
              className="sms-input"
              style={{ paddingLeft: 36 }}
              placeholder="Search teachers…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <span className="badge badge-info">{filtered.length} results</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="sms-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Teacher</th>
                <th>Specialization</th>
                <th>Qualification</th>
                <th>Department</th>
                <th>Joined</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={isAdmin ? 7 : 6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No teachers found</td></tr>
              ) : filtered.map((t, i) => (
                <tr key={t.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: `linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-light) 100%)`,
                        color: '#ffffff',
                        boxShadow: '0 4px 12px var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 800, flexShrink: 0, textTransform: 'uppercase'
                      }}>
                        {t.user?.fullName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{t.user?.fullName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.user?.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-primary">{t.specialization || '—'}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{t.qualification || '—'}</td>
                  <td><span className="badge badge-info">{t.department || '—'}</span></td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{t.joiningDate || '—'}</td>
                  {isAdmin && (
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => handleEdit(t)}>
                          <FiEdit />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t.id)}>
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={form.id ? "Edit Teacher" : "Register New Teacher"} onClose={() => { setShowModal(false); setForm(initForm); setError(''); }}>
          {error && <div className="sms-alert sms-alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="sms-form-group">
                <label className="sms-label">Full Name *</label>
                <input 
                  className="sms-input" 
                  required 
                  value={form.fullName} 
                  pattern="^[a-zA-Z\s]*$"
                  title="Only alphabets and spaces are allowed"
                  onChange={e => {
                    if (/^[a-zA-Z\s]*$/.test(e.target.value)) {
                      setForm({ ...form, fullName: e.target.value });
                    }
                  }} 
                />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Username *</label>
                <input 
                  className="sms-input" 
                  required 
                  value={form.username} 
                  pattern="^[a-zA-Z]+$"
                  title="Only alphabetic characters are allowed (no spaces or numbers)"
                  onChange={e => {
                    if (/^[a-zA-Z]*$/.test(e.target.value)) {
                      setForm({ ...form, username: e.target.value });
                    }
                  }} 
                />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Email *</label>
                <input 
                  className="sms-input" 
                  type="email" 
                  required 
                  pattern="^[a-zA-Z0-9._%+-]+@gmail\.com$"
                  title="Email must end with @gmail.com"
                  value={form.email} 
                  onChange={e => setForm({ ...form, email: e.target.value })} 
                />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Password *</label>
                <input className="sms-input" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Specialization</label>
                <input className="sms-input" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Qualification</label>
                <input className="sms-input" value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Department</label>
                <input className="sms-input" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Phone Number</label>
                <input 
                  className="sms-input" 
                  value={form.phoneNumber} 
                  maxLength={10}
                  pattern="^\d{10}$"
                  title="Phone number must be exactly 10 digits"
                  onChange={e => {
                    if (/^\d{0,10}$/.test(e.target.value)) {
                      setForm({ ...form, phoneNumber: e.target.value });
                    }
                  }} 
                />
              </div>
            </div>
            <div className="sms-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : (form.id ? 'Save Changes' : 'Register Teacher')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

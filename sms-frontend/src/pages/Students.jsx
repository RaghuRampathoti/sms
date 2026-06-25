import { useEffect, useState } from 'react';
import { getStudents, deleteStudent, signup, getClasses, updateStudent } from '../api';
import { FiUserPlus, FiTrash2, FiSearch, FiX, FiEdit } from 'react-icons/fi';

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
  role: 'STUDENT', rollNumber: '', admissionNumber: '', classId: '',
  parentName: '', parentPhone: '', dateOfBirth: '', dateOfJoining: ''
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleEdit = (student) => {
    setForm({
      id: student.id,
      fullName: student.user?.fullName || '',
      username: student.user?.username || '',
      email: student.user?.email || '',
      password: '', // leave empty when editing
      phoneNumber: student.user?.phoneNumber || '',
      role: 'STUDENT',
      rollNumber: student.rollNumber || '',
      admissionNumber: student.admissionNumber || '',
      classId: student.schoolClass?.id || '',
      parentName: student.parentName || '',
      parentPhone: student.parentPhone || '',
      dateOfBirth: student.dateOfBirth || '',
      dateOfJoining: student.dateOfJoining || ''
    });
    setShowModal(true);
  };

  const load = () => {
    setLoading(true);
    Promise.all([getStudents(), getClasses()])
      .then(([sr, cr]) => {
        setStudents(sr.data);
        setClasses(cr.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    await deleteStudent(id);
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (form.id) {
        await updateStudent(form.id, { ...form, classId: form.classId ? Number(form.classId) : null });
      } else {
        await signup({ ...form, role: 'STUDENT', classId: form.classId ? Number(form.classId) : null });
      }
      setShowModal(false);
      setForm(initForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Error saving student');
    } finally {
      setSaving(false);
    }
  };

  const filtered = students.filter(s =>
    (s.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    s.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
    s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.admissionNumber?.toLowerCase().includes(search.toLowerCase())) &&
    (classFilter === '' || s.schoolClass?.id === Number(classFilter))
  );

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Student Directory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{students.length} students enrolled</p>
        </div>
        <button id="add-student-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiUserPlus /> Add Student
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: 280 }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="student-search"
                className="sms-input"
                style={{ paddingLeft: 36 }}
                placeholder="Search students…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select 
              className="sms-input sms-select" 
              style={{ width: '200px' }}
              value={classFilter} 
              onChange={e => setClassFilter(e.target.value)}
            >
              <option value="">All Classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
            </select>
          </div>
          <span className="badge badge-info">{filtered.length} results</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="sms-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Roll No.</th>
                <th>Admission No.</th>
                <th>Class</th>
                <th>Email</th>
                <th>Parent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No students found</td></tr>
              ) : filtered.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: `linear-gradient(135deg, var(--primary), var(--secondary))`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 12, fontWeight: 700, flexShrink: 0
                      }}>
                        {s.user?.fullName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{s.user?.fullName}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>@{s.user?.username}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge badge-info">{s.rollNumber || '—'}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.admissionNumber || '—'}</td>
                  <td>
                    {s.schoolClass?.className
                      ? <span className="badge badge-primary">{s.schoolClass.className}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{s.user?.email}</td>
                  <td style={{ fontSize: 12.5 }}>
                    <div>{s.parentName || '—'}</div>
                    <div style={{ color: 'var(--text-muted)' }}>{s.parentPhone || ''}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleEdit(s)}>
                        <FiEdit />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title={form.id ? "Edit Student" : "Register New Student"} onClose={() => { setShowModal(false); setForm(initForm); setError(''); }}>
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
                <label className="sms-label">Password *</label>
                <input className="sms-input" type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Roll Number</label>
                <input className="sms-input" value={form.rollNumber} onChange={e => setForm({ ...form, rollNumber: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Admission Number</label>
                <input className="sms-input" value={form.admissionNumber} onChange={e => setForm({ ...form, admissionNumber: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Class</label>
                <select className="sms-input sms-select" value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })}>
                  <option value="">— Select Class —</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
                </select>
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Date of Birth</label>
                <input className="sms-input" type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Date of Joining</label>
                <input className="sms-input" type="date" value={form.dateOfJoining} onChange={e => setForm({ ...form, dateOfJoining: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Parent Name</label>
                <input className="sms-input" value={form.parentName} onChange={e => setForm({ ...form, parentName: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Parent Phone</label>
                <input 
                  className="sms-input" 
                  value={form.parentPhone} 
                  maxLength={10}
                  pattern="^\d{10}$"
                  title="Phone number must be exactly 10 digits"
                  onChange={e => {
                    if (/^\d{0,10}$/.test(e.target.value)) {
                      setForm({ ...form, parentPhone: e.target.value });
                    }
                  }} 
                />
              </div>
            </div>
            <div className="sms-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" /> : (form.id ? 'Save Changes' : 'Register Student')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

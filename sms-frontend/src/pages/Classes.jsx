import { useEffect, useState } from 'react';
import {
  getClasses, createClass, deleteClass, updateClass,
  getSubjects, createSubject, deleteSubject, updateSubject,
  getTeachers, getAcademicYears
} from '../api';
import { FiPlus, FiTrash2, FiX, FiEdit, FiLayers } from 'react-icons/fi';

function Modal({ title, onClose, children }) {
  return (
    <div className="sms-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sms-modal">
        <div className="sms-modal-header flex-between">
          <div className="sms-modal-title">{title}</div>
          <button onClick={onClose} className="btn btn-secondary btn-sm"><FiX /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('classes');
  const [showClassModal, setShowClassModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [classForm, setClassForm] = useState({ className: '', classTeacher: { id: '' }, academicYear: { id: '' } });
  const [subjectForm, setSubjectForm] = useState({ subjectName: '', subjectCode: '', schoolClass: { id: '' }, teacher: { id: '' } });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleEditClass = (c) => {
    setClassForm({
      id: c.id,
      className: c.className,
      classTeacher: { id: c.classTeacher?.id || '' },
      academicYear: { id: c.academicYear?.id || '' }
    });
    setShowClassModal(true);
  };

  const handleEditSubject = (s) => {
    setSubjectForm({
      id: s.id,
      subjectName: s.subjectName,
      subjectCode: s.subjectCode,
      schoolClass: { id: s.schoolClass?.id || '' },
      teacher: { id: s.teacher?.id || '' }
    });
    setShowSubjectModal(true);
  };

  const load = () => {
    setLoading(true);
    Promise.all([getClasses(), getSubjects(), getTeachers(), getAcademicYears()])
      .then(([cr, sr, tr, ar]) => {
        setClasses(cr.data);
        setSubjects(sr.data);
        setTeachers(tr.data);
        setAcademicYears(ar.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = { className: classForm.className };
      if (classForm.classTeacher.id) payload.classTeacher = { id: Number(classForm.classTeacher.id) };
      if (classForm.academicYear.id) payload.academicYear = { id: Number(classForm.academicYear.id) };
      
      if (classForm.id) {
        await updateClass(classForm.id, payload);
      } else {
        await createClass(payload);
      }
      setShowClassModal(false);
      setClassForm({ className: '', classTeacher: { id: '' }, academicYear: { id: '' } });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving class');
    } finally {
      setSaving(false);
    }
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const payload = {
        subjectName: subjectForm.subjectName,
        subjectCode: subjectForm.subjectCode,
        schoolClass: subjectForm.schoolClass.id ? { id: Number(subjectForm.schoolClass.id) } : null,
        teacher: subjectForm.teacher.id ? { id: Number(subjectForm.teacher.id) } : null,
      };
      
      if (subjectForm.id) {
        await updateSubject(subjectForm.id, payload);
      } else {
        await createSubject(payload);
      }
      setShowSubjectModal(false);
      setSubjectForm({ subjectName: '', subjectCode: '', schoolClass: { id: '' }, teacher: { id: '' } });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving subject');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Classes & Subjects</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Manage academic classes and subject assignments</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button id="add-class-btn" className="btn btn-secondary" onClick={() => { setClassForm({ className: '', classTeacher: { id: '' }, academicYear: { id: '' } }); setShowClassModal(true); }}><FiPlus /> New Class</button>
          <button id="add-subject-btn" className="btn btn-primary" onClick={() => { setSubjectForm({ subjectName: '', subjectCode: '', schoolClass: { id: '' }, teacher: { id: '' } }); setShowSubjectModal(true); }}><FiPlus /> New Subject</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {['classes', 'subjects'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13.5, fontWeight: 600, color: tab === t ? 'var(--primary-light)' : 'var(--text-muted)',
              borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all 0.2s', textTransform: 'capitalize'
            }}
          >
            {t === 'classes' ? `📚 Classes (${classes.length})` : `📖 Subjects (${subjects.length})`}
          </button>
        ))}
      </div>

      {tab === 'classes' && (
        <div className="card">
          <table className="sms-table">
            <thead>
              <tr><th>#</th><th>Class Name</th><th>Class Teacher</th><th>Academic Year</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>
              ) : classes.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No classes found. Add one!</td></tr>
              ) : classes.map((c, i) => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: 'rgba(var(--primary-rgb), 0.1)',
                        color: 'var(--primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 18
                      }}>
                        <FiLayers />
                      </div>
                      <span style={{ fontWeight: 600 }}>{c.className}</span>
                    </div>
                  </td>
                  <td>
                    {c.classTeacher
                      ? <span className="badge badge-success">{c.classTeacher.user?.fullName}</span>
                      : <span style={{ color: 'var(--text-muted)' }}>Not assigned</span>}
                  </td>
                  <td>
                    {c.academicYear ? <span className="badge badge-primary">{c.academicYear.startDate} to {c.academicYear.endDate}</span> : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleEditClass(c)}>
                        <FiEdit />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={async () => {
                        try {
                          await deleteClass(c.id);
                          load();
                        } catch (err) {
                          console.error('Failed to delete class:', err);
                        }
                      }}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'subjects' && (
        <div className="card">
          <table className="sms-table">
            <thead>
              <tr><th>#</th><th>Subject</th><th>Code</th><th>Class</th><th>Teacher</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>
              ) : subjects.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No subjects found. Add one!</td></tr>
              ) : subjects.map((s, i) => (
                <tr key={s.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{s.subjectName}</td>
                  <td><span className="badge badge-warning">{s.subjectCode}</span></td>
                  <td>{s.schoolClass?.className ? <span className="badge badge-primary">{s.schoolClass.className}</span> : '—'}</td>
                  <td style={{ fontSize: 13 }}>{s.teacher?.user?.fullName || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => handleEditSubject(s)}>
                        <FiEdit />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={async () => {
                        try {
                          await deleteSubject(s.id);
                          load();
                        } catch (err) {
                          console.error('Failed to delete subject:', err);
                        }
                      }}>
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showClassModal && (
        <Modal title={classForm.id ? "Edit Class" : "Create New Class"} onClose={() => { setShowClassModal(false); setError(''); }}>
          {error && <div className="sms-alert sms-alert-error">{error}</div>}
          <form onSubmit={handleClassSubmit}>
            <div className="sms-form-group">
              <label className="sms-label">Class Name *</label>
              <input className="sms-input" required value={classForm.className} placeholder="e.g. Grade 10-A" onChange={e => setClassForm({ ...classForm, className: e.target.value })} />
            </div>
            <div className="sms-form-group">
              <label className="sms-label">Class Teacher</label>
              <select className="sms-input sms-select" value={classForm.classTeacher.id} onChange={e => setClassForm({ ...classForm, classTeacher: { id: e.target.value } })}>
                <option value="">— Select Teacher —</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.user?.fullName}</option>)}
              </select>
            </div>
            <div className="sms-form-group">
              <label className="sms-label">Academic Year</label>
              <select className="sms-input sms-select" value={classForm.academicYear.id} onChange={e => setClassForm({ ...classForm, academicYear: { id: e.target.value } })}>
                <option value="">— Select Academic Year —</option>
                {academicYears.map(y => <option key={y.id} value={y.id}>{y.startDate} to {y.endDate}</option>)}
              </select>
            </div>
            <div className="sms-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowClassModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : (classForm.id ? 'Save Changes' : 'Create Class')}</button>
            </div>
          </form>
        </Modal>
      )}

      {showSubjectModal && (
        <Modal title={subjectForm.id ? "Edit Subject" : "Add New Subject"} onClose={() => { setShowSubjectModal(false); setError(''); }}>
          {error && <div className="sms-alert sms-alert-error">{error}</div>}
          <form onSubmit={handleSubjectSubmit}>
            <div className="grid-2">
              <div className="sms-form-group">
                <label className="sms-label">Subject Name *</label>
                <input className="sms-input" required value={subjectForm.subjectName} onChange={e => setSubjectForm({ ...subjectForm, subjectName: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Subject Code *</label>
                <input className="sms-input" required value={subjectForm.subjectCode} placeholder="e.g. MATH101" onChange={e => setSubjectForm({ ...subjectForm, subjectCode: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Assign to Class</label>
                <select className="sms-input sms-select" value={subjectForm.schoolClass.id} onChange={e => setSubjectForm({ ...subjectForm, schoolClass: { id: e.target.value } })}>
                  <option value="">— Select Class —</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
                </select>
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Assign Teacher</label>
                <select className="sms-input sms-select" value={subjectForm.teacher.id} onChange={e => setSubjectForm({ ...subjectForm, teacher: { id: e.target.value } })}>
                  <option value="">— Select Teacher —</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.user?.fullName}</option>)}
                </select>
              </div>
            </div>
            <div className="sms-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowSubjectModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : (subjectForm.id ? 'Save Changes' : 'Add Subject')}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

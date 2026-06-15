import { useEffect, useState } from 'react';
import { getTimetableByClass, createTimetable, deleteTimetable, getClasses, getSubjects, getTeachers } from '../api';
import { FiPlus, FiTrash2, FiClock, FiX } from 'react-icons/fi';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_COLORS = {
  MONDAY: 'rgba(99,102,241,0.15)',
  TUESDAY: 'rgba(14,165,233,0.15)',
  WEDNESDAY: 'rgba(16,185,129,0.15)',
  THURSDAY: 'rgba(245,158,11,0.15)',
  FRIDAY: 'rgba(239,68,68,0.15)',
  SATURDAY: 'rgba(139,92,246,0.15)',
};

export default function Timetable() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ schoolClass: { id: '' }, subject: { id: '' }, teacher: { id: '' }, dayOfWeek: 'MONDAY', startTime: '', endTime: '', periodNo: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getClasses(), getSubjects(), getTeachers()])
      .then(([cr, sr, tr]) => { setClasses(cr.data); setSubjects(sr.data); setTeachers(tr.data); });
  }, []);

  const loadTimetable = () => {
    if (!selectedClass) return;
    setLoading(true);
    getTimetableByClass(selectedClass).then(r => setTimetable(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadTimetable(); }, [selectedClass]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTimetable({
        schoolClass: { id: Number(selectedClass) },
        subject: { id: Number(form.subject.id) },
        teacher: { id: Number(form.teacher.id) },
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
        periodNo: form.periodNo ? Number(form.periodNo) : null,
      });
      setShowModal(false);
      setForm({ schoolClass: { id: '' }, subject: { id: '' }, teacher: { id: '' }, dayOfWeek: 'MONDAY', startTime: '', endTime: '', periodNo: '' });
      loadTimetable();
    } catch { }
    setSaving(false);
  };

  // Group by day
  const grouped = DAYS.reduce((acc, d) => {
    acc[d] = timetable.filter(t => t.dayOfWeek === d).sort((a, b) => a.startTime?.localeCompare(b.startTime));
    return acc;
  }, {});

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Timetable Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Weekly class schedule</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select
            id="timetable-class"
            className="sms-input sms-select"
            style={{ width: 220 }}
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
          >
            <option value="">— Select Class —</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
          </select>
          {selectedClass && (
            <button id="add-timetable-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
              <FiPlus /> Add Period
            </button>
          )}
        </div>
      </div>

      {!selectedClass ? (
        <div className="card flex-center" style={{ height: 200, flexDirection: 'column', gap: 12 }}>
          <FiClock style={{ fontSize: 40, color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)' }}>Select a class to view its timetable</p>
        </div>
      ) : loading ? (
        <div className="flex-center" style={{ height: 200 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {DAYS.map(day => (
            <div key={day} className="card">
              <div className="card-header" style={{ background: DAY_COLORS[day] }}>
                <div className="card-title" style={{ fontSize: 13 }}>{day}</div>
                <span className="badge badge-info">{grouped[day]?.length || 0}</span>
              </div>
              <div style={{ padding: '10px' }}>
                {grouped[day]?.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: 13 }}>No periods</div>
                ) : grouped[day].map(t => (
                  <div key={t.id} style={{
                    padding: '10px 12px', borderRadius: 8, marginBottom: 8,
                    background: 'rgba(99,102,241,0.05)', border: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{t.subject?.subjectName}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.teacher?.user?.fullName}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--primary-light)', marginTop: 4 }}>
                        {t.startTime} – {t.endTime}
                        {t.periodNo && <span style={{ marginLeft: 6, color: 'var(--text-muted)' }}>P{t.periodNo}</span>}
                      </div>
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      style={{ padding: '4px 8px', marginTop: -2 }}
                      onClick={async () => { if (confirm('Remove this period?')) { await deleteTimetable(t.id); loadTimetable(); } }}>
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="sms-modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="sms-modal">
            <div className="sms-modal-header flex-between">
              <div className="sms-modal-title">Add Period to Timetable</div>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="sms-form-group">
                  <label className="sms-label">Subject *</label>
                  <select className="sms-input sms-select" required value={form.subject.id} onChange={e => setForm({ ...form, subject: { id: e.target.value } })}>
                    <option value="">— Select Subject —</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
                  </select>
                </div>
                <div className="sms-form-group">
                  <label className="sms-label">Teacher *</label>
                  <select className="sms-input sms-select" required value={form.teacher.id} onChange={e => setForm({ ...form, teacher: { id: e.target.value } })}>
                    <option value="">— Select Teacher —</option>
                    {teachers.map(t => <option key={t.id} value={t.id}>{t.user?.fullName}</option>)}
                  </select>
                </div>
                <div className="sms-form-group">
                  <label className="sms-label">Day *</label>
                  <select className="sms-input sms-select" value={form.dayOfWeek} onChange={e => setForm({ ...form, dayOfWeek: e.target.value })}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="sms-form-group">
                  <label className="sms-label">Period No.</label>
                  <input className="sms-input" type="number" min={1} max={10} value={form.periodNo} onChange={e => setForm({ ...form, periodNo: e.target.value })} />
                </div>
                <div className="sms-form-group">
                  <label className="sms-label">Start Time *</label>
                  <input className="sms-input" type="time" required value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
                </div>
                <div className="sms-form-group">
                  <label className="sms-label">End Time *</label>
                  <input className="sms-input" type="time" required value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
                </div>
              </div>
              <div className="sms-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : 'Add Period'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

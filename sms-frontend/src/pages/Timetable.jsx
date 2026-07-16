import { useEffect, useState } from 'react';
import { getTimetableByClass, createTimetable, deleteTimetable, getClasses, getSubjects, getTeachers, getMyStudentProfile, generateFirstPeriods } from '../api';
import { useAuth } from '../AuthContext';
import { FiPlus, FiTrash2, FiClock, FiX, FiEdit2, FiInfo } from 'react-icons/fi';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function Timetable() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: null, schoolClass: { id: '' }, subject: { id: '' }, teacher: { id: '' }, dayOfWeek: 'MONDAY', startTime: '', endTime: '', periodNo: '' });
  const [saving, setSaving] = useState(false);

  const isStudent = user?.role === 'ROLE_STUDENT';

  useEffect(() => {
    if (isStudent) {
      getMyStudentProfile().then(r => {
         if (r.data?.schoolClass?.id) {
           setSelectedClass(r.data.schoolClass.id.toString());
         }
      });
    } else {
      Promise.all([getClasses(), getSubjects(), getTeachers()])
        .then(([cr, sr, tr]) => { setClasses(cr.data); setSubjects(sr.data); setTeachers(tr.data); });
    }
  }, [isStudent]);

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
        id: form.id || undefined,
        schoolClass: { id: Number(selectedClass) },
        subject: { id: Number(form.subject.id) },
        teacher: { id: Number(form.teacher.id) },
        dayOfWeek: form.dayOfWeek,
        startTime: form.startTime,
        endTime: form.endTime,
        periodNo: form.periodNo ? Number(form.periodNo) : null,
      });
      setShowModal(false);
      setForm({ id: null, schoolClass: { id: '' }, subject: { id: '' }, teacher: { id: '' }, dayOfWeek: 'MONDAY', startTime: '', endTime: '', periodNo: '' });
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
              Your Weekly <span style={{ color: 'var(--primary-light)', textShadow: '0 0 15px var(--primary)' }}>Schedule</span>
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>View and manage class timetables</p>
          </div>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {!isStudent && (
              <select
                id="timetable-class"
                className="sms-input sms-select"
                style={{ width: 220, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
              >
                <option value="" style={{ color: '#000' }}>— Select Class —</option>
                {classes.map(c => <option key={c.id} value={c.id} style={{ color: '#000' }}>{c.className}</option>)}
              </select>
            )}
            {selectedClass && ['ROLE_ADMIN', 'ROLE_TEACHER'].includes(user?.role) && (
              <>
                <button className="btn" style={{ background: '#3b82f6', color: 'white', border: 'none', boxShadow: '0 0 15px rgba(59, 130, 246,0.5)' }} onClick={async () => {
                  try {
                    await generateFirstPeriods(selectedClass);
                    loadTimetable();
                  } catch (e) {
                    alert(e.response?.data || 'Failed to auto-generate');
                  }
                }}>
                  <FiClock /> Auto-Assign P1
                </button>
                <button id="add-timetable-btn" className="btn" style={{ background: 'var(--primary)', color: 'white', border: 'none', boxShadow: '0 0 15px var(--primary)' }} onClick={() => {
                  setForm({ id: null, schoolClass: { id: '' }, subject: { id: '' }, teacher: { id: '' }, dayOfWeek: 'MONDAY', startTime: '', endTime: '', periodNo: '' });
                setShowModal(true);
              }}>
                <FiPlus /> Add Period
              </button>
              </>
          )}
        </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, animation: 'slideUp 0.6s ease' }}>
          {DAYS.map(day => (
            <div key={day} style={{
              background: 'var(--bg-card)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              overflow: 'hidden'
            }}>
              <div style={{ 
                padding: '16px 20px', 
                background: 'rgba(var(--primary-rgb), 0.05)', 
                borderBottom: '1px solid var(--border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{day}</div>
                <span style={{ background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: 12, fontWeight: 600 }}>{grouped[day]?.length || 0} Periods</span>
              </div>
              <div style={{ padding: '16px' }}>
                {grouped[day]?.length === 0 ? (
                  <div className="flex-center" style={{ padding: '30px 0', color: 'var(--text-muted)', fontSize: 14, flexDirection: 'column', gap: 8 }}>
                    <FiInfo style={{ opacity: 0.3, fontSize: 24 }} />
                    No classes scheduled
                  </div>
                ) : grouped[day].map(t => (
                  <div key={t.id} style={{
                    padding: '16px', borderRadius: '12px', marginBottom: 12,
                    background: 'var(--bg-card-2)', border: '1px solid var(--border)',
                    borderLeft: '4px solid var(--primary)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>{t.subject?.subjectName}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{t.teacher?.user?.fullName}</div>
                      <div style={{ fontSize: 12, color: 'var(--primary-dark)', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, background: 'rgba(var(--primary-rgb), 0.1)', padding: '4px 10px', borderRadius: '20px', width: 'fit-content' }}>
                        <FiClock size={12} /> {t.startTime} – {t.endTime}
                        {t.periodNo && <span style={{ color: 'var(--text-muted)' }}>• P{t.periodNo}</span>}
                      </div>
                    </div>
                    {['ROLE_ADMIN', 'ROLE_TEACHER'].includes(user?.role) && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary-dark)', border: 'none', padding: '8px' }}
                          onClick={() => {
                            setForm({
                              id: t.id,
                              schoolClass: { id: t.schoolClass?.id || selectedClass },
                              subject: { id: t.subject?.id || '' },
                              teacher: { id: t.teacher?.id || '' },
                              dayOfWeek: t.dayOfWeek,
                              startTime: t.startTime,
                              endTime: t.endTime,
                              periodNo: t.periodNo || ''
                            });
                            setShowModal(true);
                          }}>
                          <FiEdit2 size={14} />
                        </button>
                        <button
                          className="btn btn-sm"
                          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px' }}
                          onClick={() => {
                            if (window.confirm('Delete this period?')) {
                              deleteTimetable(t.id).then(loadTimetable);
                            }
                          }}>
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    )}
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
              <div className="sms-modal-title">{form.id ? 'Edit Period' : 'Add Period to Timetable'}</div>
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
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : (form.id ? 'Save Changes' : 'Add Period')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

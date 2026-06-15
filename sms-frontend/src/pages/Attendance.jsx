import { useEffect, useState } from 'react';
import { getClasses, getSubjectsByClass, getStudentsByClass, saveAttendance, getAttendance, getDailyReportUrl } from '../api';
import { FiSave, FiDownload, FiCheckSquare } from 'react-icons/fi';

const PERIODS = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6'];
const STATUS = ['PRESENT', 'ABSENT', 'LEAVE'];
const STATUS_LABELS = { PRESENT: 'P', ABSENT: 'A', LEAVE: 'L' };
const STATUS_CLASS = { PRESENT: 'present', ABSENT: 'absent', LEAVE: 'leave' };

export default function Attendance() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Period 1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [records, setRecords] = useState({}); // studentId -> status
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { getClasses().then(r => setClasses(r.data)); }, []);

  useEffect(() => {
    if (selectedClass) {
      getSubjectsByClass(selectedClass).then(r => setSubjects(r.data));
      getStudentsByClass(selectedClass).then(r => {
        setStudents(r.data);
        // Pre-set all as PRESENT
        const init = {};
        r.data.forEach(s => { init[s.id] = 'PRESENT'; });
        setRecords(init);
      });
    } else {
      setSubjects([]); setStudents([]); setRecords({});
    }
  }, [selectedClass]);

  const loadExisting = async () => {
    if (!selectedClass || !selectedSubject || !date || !selectedPeriod) return;
    setLoading(true);
    try {
      const r = await getAttendance({ classId: selectedClass, subjectId: selectedSubject, date, period: selectedPeriod });
      if (r.data.length > 0) {
        const existing = {};
        r.data.forEach(a => { existing[a.student.id] = a.status; });
        setRecords(existing);
      }
    } catch { }
    setLoading(false);
  };

  useEffect(() => { loadExisting(); }, [selectedSubject, selectedPeriod, date]);

  const toggleStatus = (studentId, status) => {
    setRecords(prev => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const updated = {};
    students.forEach(s => { updated[s.id] = status; });
    setRecords(updated);
  };

  const handleSave = async () => {
    if (!selectedClass || !date) return;
    setSaving(true);
    try {
      const payload = {
        classId: Number(selectedClass),
        subjectId: selectedSubject ? Number(selectedSubject) : null,
        period: selectedPeriod,
        date,
        records: students.map(s => ({ studentId: s.id, status: records[s.id] || 'PRESENT' }))
      };
      await saveAttendance(payload);
      setMessage('✅ Attendance saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('❌ Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(records).filter(v => v === 'PRESENT').length;
  const absentCount = Object.values(records).filter(v => v === 'ABSENT').length;
  const leaveCount = Object.values(records).filter(v => v === 'LEAVE').length;

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Attendance Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Mark and track student attendance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-header"><div className="card-title">🔍 Select Session</div></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div className="sms-form-group" style={{ marginBottom: 0 }}>
              <label className="sms-label">Class *</label>
              <select id="att-class" className="sms-input sms-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                <option value="">— Select Class —</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
              </select>
            </div>
            <div className="sms-form-group" style={{ marginBottom: 0 }}>
              <label className="sms-label">Subject</label>
              <select id="att-subject" className="sms-input sms-select" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} disabled={!selectedClass}>
                <option value="">— Select Subject —</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
              </select>
            </div>
            <div className="sms-form-group" style={{ marginBottom: 0 }}>
              <label className="sms-label">Period</label>
              <select id="att-period" className="sms-input sms-select" value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
                {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="sms-form-group" style={{ marginBottom: 0 }}>
              <label className="sms-label">Date</label>
              <input id="att-date" className="sms-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {students.length > 0 && (
        <>
          {/* Summary */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Present', count: presentCount, color: 'var(--accent)', bg: 'rgba(16,185,129,0.1)' },
              { label: 'Absent', count: absentCount, color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
              { label: 'Leave', count: leaveCount, color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
              { label: 'Total', count: students.length, color: 'var(--primary-light)', bg: 'rgba(99,102,241,0.1)' },
            ].map(s => (
              <div key={s.label} style={{
                padding: '10px 20px', borderRadius: 10,
                background: s.bg, border: `1px solid ${s.color}30`,
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.count}</span>
                <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{s.label}</span>
              </div>
            ))}

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
              <button className="btn btn-success btn-sm" onClick={() => markAll('PRESENT')}>Mark All Present</button>
              <button className="btn btn-danger btn-sm" onClick={() => markAll('ABSENT')}>Mark All Absent</button>
              {selectedClass && date && (
                <a href={getDailyReportUrl(selectedClass, date)} target="_blank" rel="noreferrer">
                  <button className="btn btn-secondary btn-sm"><FiDownload /> PDF Report</button>
                </a>
              )}
            </div>
          </div>

          {/* Attendance Table */}
          <div className="card">
            {message && <div className={`sms-alert ${message.startsWith('✅') ? 'sms-alert-success' : 'sms-alert-error'}`} style={{ margin: '16px 22px 0' }}>{message}</div>}
            <div className="card-header">
              <div className="card-title"><FiCheckSquare style={{ marginRight: 8 }} />Student Attendance</div>
              <button id="save-attendance-btn" className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" /> : <><FiSave /> Save</>}
              </button>
            </div>
            <table className="sms-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Roll No.</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, i) => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700
                        }}>
                          {s.user?.fullName?.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{s.user?.fullName}</span>
                      </div>
                    </td>
                    <td><span className="badge badge-info">{s.rollNumber || '—'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {STATUS.map(status => (
                          <button
                            key={status}
                            className={`attendance-btn ${STATUS_CLASS[status]} ${records[s.id] === status ? 'active' : ''}`}
                            onClick={() => toggleStatus(s.id, status)}
                            title={status}
                          >
                            {STATUS_LABELS[status]}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {selectedClass && students.length === 0 && !loading && (
        <div className="card flex-center" style={{ height: 200 }}>
          <p style={{ color: 'var(--text-muted)' }}>No students found in this class.</p>
        </div>
      )}

      {!selectedClass && (
        <div className="card flex-center" style={{ height: 200, flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 40 }}>📋</div>
          <p style={{ color: 'var(--text-muted)' }}>Select a class to begin marking attendance</p>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { getClasses, getSubjectsByClass, getStudentsByClass, saveAttendance, getAttendance, getDailyReportUrl, getTeachers, getTeacherAttendance, saveTeacherAttendance } from '../api';
import { FiSave, FiDownload, FiCheckSquare } from 'react-icons/fi';
import { useAuth } from '../AuthContext';

const PERIODS = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6'];
const STATUS = ['PRESENT', 'ABSENT', 'LEAVE'];
const STATUS_LABELS = { PRESENT: 'P', ABSENT: 'A', LEAVE: 'L' };
const STATUS_CLASS = { PRESENT: 'present', ABSENT: 'absent', LEAVE: 'leave' };

export default function Attendance() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Period 1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceType, setAttendanceType] = useState('PERIOD'); // DAY or PERIOD

  const [records, setRecords] = useState({}); // studentId or teacherId -> status
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { 
    if (isAdmin) {
      getTeachers().then(r => {
        setTeachers(r.data);
        const init = {};
        r.data.forEach(t => { init[t.id] = 'PRESENT'; });
        setRecords(init);
      });
    } else {
      getClasses().then(r => setClasses(r.data)); 
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      if (selectedClass) {
        getSubjectsByClass(selectedClass).then(r => setSubjects(r.data));
        getStudentsByClass(selectedClass).then(r => {
          const sortedStudents = r.data.sort((a, b) => {
            const nameA = a.user?.fullName || '';
            const nameB = b.user?.fullName || '';
            return nameA.localeCompare(nameB);
          });
          setStudents(sortedStudents);
          const init = {};
          sortedStudents.forEach(s => { init[s.id] = 'PRESENT'; });
          setRecords(init);
        });
      } else {
        setSubjects([]); setStudents([]); setRecords({});
      }
    }
  }, [selectedClass, isAdmin]);

  const loadExisting = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        if (!date) return;
        const init = {};
        teachers.forEach(t => { init[t.id] = 'PRESENT'; });
        
        const r = await getTeacherAttendance(date);
        if (r.data.length > 0) {
          r.data.forEach(a => { init[a.teacher.id] = a.status; });
        }
        setRecords(init);
      } else {
        const fetchPeriod = attendanceType === 'DAY' ? 'DAY' : selectedPeriod;
        const fetchSubject = attendanceType === 'DAY' ? null : selectedSubject;
        if (attendanceType === 'PERIOD' && (!selectedClass || !fetchSubject || !date || !fetchPeriod)) return;
        if (attendanceType === 'DAY' && (!selectedClass || !date)) return;
        const init = {};
        students.forEach(s => { init[s.id] = 'PRESENT'; });
        
        const r = await getAttendance({ classId: selectedClass, subjectId: fetchSubject, date, period: fetchPeriod });
        if (r.data.length > 0) {
          r.data.forEach(a => { init[a.student.id] = a.status; });
        }
        setRecords(init);
      }
    } catch { }
    setLoading(false);
  };

  useEffect(() => { loadExisting(); }, [selectedSubject, selectedPeriod, date, isAdmin, teachers, students, attendanceType]);

  const toggleStatus = (id, status) => {
    setRecords(prev => ({ ...prev, [id]: status }));
  };

  const markAll = (status) => {
    const updated = {};
    if (isAdmin) {
      teachers.forEach(t => { updated[t.id] = status; });
    } else {
      students.forEach(s => { updated[s.id] = status; });
    }
    setRecords(updated);
  };

  const handleAttendanceTypeChange = (e) => {
    const type = e.target.value;
    setAttendanceType(type);
    if (type === 'DAY') {
      const myClass = classes.find(c => 
        c.classTeacher?.user?.id === user?.id || 
        c.classTeacher?.user?.username === user?.username
      );
      if (myClass) {
        setSelectedClass(myClass.id);
      }
    }
  };

  const handleSave = async () => {
    if (!date) return;
    if (!isAdmin && !selectedClass) return;
    
    setSaving(true);
    try {
      if (isAdmin) {
        const payload = {
          date,
          records: teachers.map(t => ({ teacherId: t.id, status: records[t.id] || 'PRESENT' }))
        };
        await saveTeacherAttendance(payload);
      } else {
        const payload = {
          classId: Number(selectedClass),
          subjectId: attendanceType === 'PERIOD' && selectedSubject ? Number(selectedSubject) : null,
          period: attendanceType === 'DAY' ? 'DAY' : selectedPeriod,
          date,
          records: students.map(s => ({ studentId: s.id, status: records[s.id] || 'PRESENT' }))
        };
        await saveAttendance(payload);
      }
      setMessage('✅ Attendance saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setMessage('❌ ' + err.response.data.message);
      } else {
        setMessage('❌ Error saving attendance (Ensure you are the Class Teacher for Day-wise)');
      }
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(records).filter(v => v === 'PRESENT').length;
  const absentCount = Object.values(records).filter(v => v === 'ABSENT').length;
  const leaveCount = Object.values(records).filter(v => v === 'LEAVE').length;
  const totalCount = isAdmin ? teachers.length : students.length;

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>
            {isAdmin ? 'Teacher Attendance Management' : 'Student Attendance Management'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Mark and track daily attendance</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-header"><div className="card-title">🔍 Select Session</div></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr' : (attendanceType === 'DAY' ? 'repeat(3, 1fr)' : 'repeat(5, 1fr)'), gap: 16 }}>
            {!isAdmin && (
              <>
                <div className="sms-form-group" style={{ marginBottom: 0 }}>
                  <label className="sms-label">Type</label>
                  <select className="sms-input sms-select" value={attendanceType} onChange={handleAttendanceTypeChange}>
                    <option value="PERIOD">Period-wise</option>
                    <option value="DAY">Day-wise</option>
                  </select>
                </div>
                <div className="sms-form-group" style={{ marginBottom: 0 }}>
                  <label className="sms-label">Class *</label>
                  <select id="att-class" className="sms-input sms-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                    <option value="">— Select Class —</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
                  </select>
                </div>
                {attendanceType === 'PERIOD' && (
                  <>
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
                  </>
                )}
              </>
            )}
            <div className="sms-form-group" style={{ marginBottom: 0 }}>
              <label className="sms-label">Date</label>
              <input id="att-date" className="sms-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      {(isAdmin ? teachers.length > 0 : students.length > 0) && (
        <>
          {/* Summary */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Present', count: presentCount, color: 'var(--accent)', bg: 'rgba(16,185,129,0.1)' },
              { label: 'Absent', count: absentCount, color: 'var(--danger)', bg: 'rgba(239,68,68,0.1)' },
              { label: 'Leave', count: leaveCount, color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
              { label: 'Total', count: totalCount, color: 'var(--primary-light)', bg: 'rgba(99,102,241,0.1)' },
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
              {!isAdmin && selectedClass && date && (
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
              <div className="card-title"><FiCheckSquare style={{ marginRight: 8 }} />{isAdmin ? 'Teacher Attendance' : 'Student Attendance'}</div>
              <button id="save-attendance-btn" className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                {saving ? <span className="spinner" /> : <><FiSave /> Save</>}
              </button>
            </div>
            <table className="sms-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{isAdmin ? 'Teacher' : 'Student'}</th>
                  {!isAdmin && <th>Roll No.</th>}
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(isAdmin ? teachers : students).map((person, i) => (
                  <tr key={person.id}>
                    <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700
                        }}>
                          {person.user?.fullName?.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{person.user?.fullName}</span>
                      </div>
                    </td>
                    {!isAdmin && <td><span className="badge badge-info">{`S${String(i + 1).padStart(3, '0')}`}</span></td>}
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {STATUS.map(status => (
                          <button
                            key={status}
                            className={`attendance-btn ${STATUS_CLASS[status]} ${records[person.id] === status ? 'active' : ''}`}
                            onClick={() => toggleStatus(person.id, status)}
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

      {(!isAdmin && selectedClass && students.length === 0 && !loading) && (
        <div className="card flex-center" style={{ height: 200 }}>
          <p style={{ color: 'var(--text-muted)' }}>No students found in this class.</p>
        </div>
      )}

      {(!isAdmin && !selectedClass) && (
        <div className="card flex-center" style={{ height: 200, flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 40 }}>📋</div>
          <p style={{ color: 'var(--text-muted)' }}>Select a class to begin marking attendance</p>
        </div>
      )}

      {(isAdmin && teachers.length === 0 && !loading) && (
        <div className="card flex-center" style={{ height: 200 }}>
          <p style={{ color: 'var(--text-muted)' }}>No teachers found in the system.</p>
        </div>
      )}
    </div>
  );
}

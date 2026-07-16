import { useEffect, useState } from 'react';
import { getClasses, getSubjectsByClass, getStudentsByClass, saveAttendance, getAttendance, getDailyReportUrl, downloadDailyReport, getTeachers, getTeacherAttendance, saveTeacherAttendance, getTimetableByClass, getMyStudentProfile, getStudentAttendance } from '../api';
import { FiSave, FiDownload, FiCheckSquare, FiSearch } from 'react-icons/fi';
import { useAuth } from '../AuthContext';

const PERIODS = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6'];
const STATUS = ['PRESENT', 'ABSENT', 'LEAVE'];
const STATUS_LABELS = { PRESENT: 'P', ABSENT: 'A', LEAVE: 'L' };
const STATUS_CLASS = { PRESENT: 'present', ABSENT: 'absent', LEAVE: 'leave' };

export default function Attendance() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const isStudent = user?.role === 'ROLE_STUDENT';

  const [myAttendance, setMyAttendance] = useState([]);

  useEffect(() => {
    if (isStudent) {
      getMyStudentProfile().then(r => {
        if (r.data?.id) {
          getStudentAttendance(r.data.id).then(res => setMyAttendance(res.data));
        }
      });
    }
  }, [isStudent]);

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('Period 1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceType, setAttendanceType] = useState('PERIOD'); // DAY or PERIOD
  const [timetable, setTimetable] = useState([]);

  const [records, setRecords] = useState({}); // studentId or teacherId -> status
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [substitutions, setSubstitutions] = useState({});
  const [dayTimetable, setDayTimetable] = useState([]);

  useEffect(() => {
    getClasses().then(r => setClasses(r.data));
    if (isAdmin) {
      getTeachers().then(r => {
        setTeachers(r.data);
        const init = {};
        r.data.forEach(t => { init[t.id] = 'PRESENT'; });
        setRecords(init);
      });
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

  useEffect(() => {
    if (!isAdmin && selectedClass && attendanceType === 'PERIOD') {
      getTimetableByClass(selectedClass).then(r => {
        setTimetable(r.data);
      }).catch(() => setTimetable([]));
    }
  }, [selectedClass, isAdmin, attendanceType]);

  useEffect(() => {
    if (!isAdmin && selectedClass && date && attendanceType === 'PERIOD') {
      if (timetable.length > 0) {
        const d = new Date(date);
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const dayName = days[d.getDay()];

        const filtered = timetable.filter(t => t.dayOfWeek === dayName).sort((a, b) => a.periodNo - b.periodNo);
        setDayTimetable(filtered);

        const teacherPeriods = filtered.filter(t =>
          t.teacher?.user?.id === user?.id || t.teacher?.user?.username === user?.username
        );

        if (teacherPeriods.length > 0) {
          const matched = teacherPeriods[0];
          if (matched.subject) {
            setSelectedSubject(matched.subject.id.toString());
          }
          if (matched.periodNo) {
            setSelectedPeriod(`Period ${matched.periodNo}`);
          }
        } else if (filtered.length > 0) {
          if (filtered[0].subject) setSelectedSubject(filtered[0].subject.id.toString());
          setSelectedPeriod(`Period ${filtered[0].periodNo}`);
        } else {
          setSelectedSubject('');
          setSelectedPeriod('Period 1');
        }
      } else {
        setDayTimetable([]);
        setSelectedSubject('');
        setSelectedPeriod('Period 1');
      }
    } else {
      setDayTimetable([]);
    }
  }, [selectedClass, date, timetable, isAdmin, attendanceType, user]);

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadExisting(); }, [selectedSubject, selectedPeriod, isAdmin, teachers, students, attendanceType]);

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
          records: teachers.map(t => ({ teacherId: t.id, status: records[t.id] || 'PRESENT' })),
          substitutions: Object.entries(substitutions)
            .filter(([_, subId]) => subId)
            .map(([classId, subId]) => ({ classId: Number(classId), substituteTeacherId: Number(subId) }))
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

  const handleDownloadPDF = async () => {
    if (!selectedClass || !date) return;
    try {
      const response = await downloadDailyReport(selectedClass, date);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Attendance_Report_${date}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      setMessage('❌ Error downloading PDF report');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const presentCount = Object.values(records).filter(v => v === 'PRESENT').length;
  const absentCount = Object.values(records).filter(v => v === 'ABSENT').length;
  const leaveCount = Object.values(records).filter(v => v === 'LEAVE').length;
  const totalCount = isAdmin ? teachers.length : students.length;

  if (isStudent) {
    const present = myAttendance.filter(a => a.status === 'PRESENT').length;
    const absent = myAttendance.filter(a => a.status === 'ABSENT').length;
    const leave = myAttendance.filter(a => a.status === 'LEAVE').length;
    const total = myAttendance.length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

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
                Your <span style={{ color: 'var(--primary-light)', textShadow: '0 0 15px rgba(251, 191, 36,0.5)' }}>Attendance</span>
              </h1>
              <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>View your attendance records</p>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {[
                { label: 'Present', count: present, color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
                { label: 'Absent', count: absent, color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
                { label: 'Leave', count: leave, color: 'var(--primary)', bg: 'rgba(var(--primary-rgb),0.15)' },
                { label: 'Overall', count: `${percentage}%`, color: 'var(--primary)', bg: 'rgba(var(--primary-rgb),0.2)' },
              ].map(s => (
                <div key={s.label} style={{
                  padding: '8px 16px', borderRadius: '12px',
                  background: s.bg, border: `1px solid ${s.color}30`,
                  display: 'flex', alignItems: 'center', gap: 8,
                  backdropFilter: 'blur(4px)'
                }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.count}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden',
          animation: 'slideUp 0.6s ease'
        }}>
          <div style={{
            padding: '20px 24px',
            background: 'rgba(var(--primary-rgb), 0.03)',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <FiCheckSquare style={{ color: 'var(--primary-dark)', fontSize: 20 }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Attendance History</div>
          </div>
          <div style={{ padding: '0 24px 24px 24px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead>
                <tr style={{ background: 'rgba(var(--primary-rgb), 0.1)', borderBottom: '2px solid rgba(var(--primary-rgb), 0.3)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--primary)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--primary)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--primary)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subject</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--primary)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Period</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--primary)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {myAttendance.map((a, i) => (
                  <tr key={i} style={{
                    transition: 'all 0.2s',
                    cursor: 'default',
                    background: i % 2 === 0 ? 'var(--bg-card)' : 'rgba(255,255,255,0.02)',
                    borderBottom: '1px solid var(--border)'
                  }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.05)'} onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? 'var(--bg-card)' : 'rgba(255,255,255,0.02)'}>
                    <td style={{ padding: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{a.date}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{a.period === 'DAY' ? 'Day-wise' : 'Period-wise'}</td>
                    <td style={{ padding: '16px', color: 'var(--text-primary)', fontWeight: 600 }}>{a.subject?.subjectName || '-'}</td>
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{a.period === 'DAY' ? '-' : a.period}</td>
                    <td style={{ padding: '16px' }}>
                      <span className={`badge`} style={{
                        background: a.status === 'PRESENT' ? 'rgba(16,185,129,0.15)' : a.status === 'ABSENT' ? 'rgba(239,68,68,0.15)' : 'rgba(var(--primary-rgb),0.15)',
                        color: a.status === 'PRESENT' ? '#10b981' : a.status === 'ABSENT' ? '#ef4444' : 'var(--primary-dark)',
                        border: `1px solid ${a.status === 'PRESENT' ? 'rgba(16,185,129,0.4)' : a.status === 'ABSENT' ? 'rgba(239,68,68,0.4)' : 'rgba(var(--primary-rgb),0.4)'}`,
                        fontWeight: 800, padding: '6px 12px'
                      }}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {myAttendance.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>No attendance records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

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
                      <select id="att-period" className="sms-input sms-select" value={selectedPeriod} onChange={e => {
                        const newPeriod = e.target.value;
                        setSelectedPeriod(newPeriod);
                        const match = dayTimetable.find(t => `Period ${t.periodNo}` === newPeriod);
                        if (match && match.subject) {
                          setSelectedSubject(match.subject.id.toString());
                        }
                      }}>
                        {dayTimetable.length > 0
                          ? dayTimetable.map(t => (
                            <option key={t.id} value={`Period ${t.periodNo}`}>
                              Period {t.periodNo} ({t.startTime} - {t.endTime})
                            </option>
                          ))
                          : PERIODS.map(p => <option key={p} value={p}>{p}</option>)
                        }
                      </select>
                    </div>
                  </>
                )}
              </>
            )}
            <div className="sms-form-group" style={{ marginBottom: 0 }}>
              <label className="sms-label">Date</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input id="att-date" className="sms-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
                <button className="btn btn-primary" onClick={loadExisting} style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiSearch /> Search
                </button>
              </div>
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
              { label: 'Leave', count: leaveCount, color: 'var(--warning)', bg: 'rgba(var(--primary-rgb),0.1)' },
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
                <button className="btn btn-secondary btn-sm" onClick={handleDownloadPDF}><FiDownload /> PDF Report</button>
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
                          background: `linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)`,
                          color: '#ffffff',
                          boxShadow: '0 4px 12px rgba(var(--primary-rgb), 0.4)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 14, fontWeight: 800, flexShrink: 0, textTransform: 'uppercase'
                        }}>
                          {person.user?.fullName?.charAt(0)}
                        </div>
                        <span style={{ fontWeight: 500 }}>{person.user?.fullName}</span>
                      </div>
                    </td>
                    {!isAdmin && <td><span className="badge badge-info">{`S${String(i + 1).padStart(3, '0')}`}</span></td>}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                        {isAdmin && records[person.id] === 'ABSENT' && classes.find(c => c.classTeacher?.id === person.id) && (
                          <div style={{ marginTop: 4 }}>
                            <select
                              className="sms-input sms-select"
                              style={{ fontSize: 12, padding: '4px 8px', minWidth: 150 }}
                              value={substitutions[classes.find(c => c.classTeacher?.id === person.id).id] || ''}
                              onChange={e => setSubstitutions({ ...substitutions, [classes.find(c => c.classTeacher?.id === person.id).id]: e.target.value })}
                            >
                              <option value="">— Assign Substitute —</option>
                              {teachers.filter(t => t.id !== person.id && records[t.id] === 'PRESENT').map(t => (
                                <option key={t.id} value={t.id}>{t.user?.fullName}</option>
                              ))}
                            </select>
                          </div>
                        )}
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

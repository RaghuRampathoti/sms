import { useEffect, useState } from 'react';
import {
  getExams, createExam, deleteExam,
  getResultsByExam, createResult, getClasses, getSubjects, getSubjectsByClass,
  getStudentsByClass, getResultsByStudent, getMyStudentProfile
} from '../api';

import { useAuth } from '../AuthContext';
import { FiPlus, FiTrash2, FiX, FiFileText } from 'react-icons/fi';

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

export default function Exams() {
  const { user } = useAuth();
  const isStudent = user?.role === 'ROLE_STUDENT';
  const [exams, setExams] = useState([]);
  
  // Student specific
  const [myResults, setMyResults] = useState([]);
  
  useEffect(() => {
    if (isStudent) {
      getMyStudentProfile().then(r => {
        if (r.data?.id) {
           getResultsByStudent(r.data.id).then(res => setMyResults(res.data));
        }
      });
    }
  }, [isStudent]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('exams');
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState({ name: '', schoolClass: { id: '' }, startDate: '', maxMarks: '' });
  const [saving, setSaving] = useState(false);
  // Results
  const [selectedExam, setSelectedExam] = useState('');
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultForm, setResultForm] = useState({ exam: { id: '' }, student: { id: '' }, marksObtained: '', grade: '', remarks: '' });

  const load = () => {
    setLoading(true);
    Promise.all([getExams(), getClasses(), getSubjects()])
      .then(([er, cr, sr]) => { setExams(er.data); setClasses(cr.data); setSubjects(sr.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (selectedExam) {
      getResultsByExam(selectedExam).then(r => setResults(r.data));
      const exam = exams.find(e => e.id === Number(selectedExam));
      if (exam?.schoolClass?.id) {
        getStudentsByClass(exam.schoolClass.id).then(r => setStudents(r.data));
      }
    }
  }, [selectedExam, exams]);

  const handleExamSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const classId = Number(examForm.schoolClass.id);
      const res = await getSubjectsByClass(classId);
      const classSubjects = (res.data || []).filter(s => s.subjectName?.toLowerCase() !== 'pet');
      
      if (classSubjects.length === 0) {
        alert('No subjects found for this class. Please add subjects first.');
        setSaving(false);
        return;
      }

      let currentDate = new Date(examForm.startDate);
      
      const promises = classSubjects.map((subj) => {
        // Skip Sundays
        if (currentDate.getDay() === 0) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        const dateString = currentDate.toISOString().split('T')[0];
        const payload = {
          name: examForm.name,
          examDate: dateString,
          maxMarks: Number(examForm.maxMarks),
          schoolClass: { id: classId },
          subject: { id: subj.id }
        };
        
        currentDate.setDate(currentDate.getDate() + 1);
        return createExam(payload);
      });

      await Promise.all(promises);

      setShowExamModal(false);
      setExamForm({ name: '', schoolClass: { id: '' }, startDate: '', maxMarks: '' });
      load();
    } catch (err) { 
      console.error(err);
      alert('Failed to schedule exams. Make sure all dates are valid.');
    }
    setSaving(false);
  };

  const handleResultSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createResult({
        exam: { id: Number(selectedExam) },
        student: { id: Number(resultForm.student.id) },
        marksObtained: Number(resultForm.marksObtained),
        grade: resultForm.grade,
        remarks: resultForm.remarks,
      });
      setShowResultModal(false);
      setResultForm({ exam: { id: '' }, student: { id: '' }, marksObtained: '', grade: '', remarks: '' });
      getResultsByExam(selectedExam).then(r => setResults(r.data));
    } catch { }
    setSaving(false);
  };

  if (isStudent) {
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
                Your Academic <span style={{ color: 'var(--primary-light)', textShadow: '0 0 15px var(--primary)' }}>Results</span>
              </h1>
              <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>View your exam performance and grades</p>
            </div>
            
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  padding: '8px 16px', borderRadius: '12px',
                  background: 'rgba(var(--primary-rgb),0.15)', border: `1px solid rgba(var(--primary-rgb),0.3)`,
                  display: 'flex', alignItems: 'center', gap: 8,
                  backdropFilter: 'blur(4px)'
                }}>
                  <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{myResults.length}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Exams Completed</span>
                </div>
            </div>
          </div>
        </div>

         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24, animation: 'slideUp 0.6s ease' }}>
            {myResults.length === 0 ? (
               <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 60, color: 'var(--text-muted)', background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border)' }}>
                 <FiFileText style={{ fontSize: 40, opacity: 0.2, marginBottom: 16 }} />
                 <div>No results published yet</div>
               </div>
            ) : myResults.map(r => (
              <div key={r.id} style={{
                background: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                transition: 'var(--transition)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow), 0 0 15px rgba(var(--primary-rgb), 0.1)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ 
                  padding: '20px 24px', 
                  background: 'rgba(var(--primary-rgb), 0.03)', 
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
                }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>{r.exam?.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{r.exam?.examDate}</div>
                  </div>
                  <span style={{ background: 'var(--primary)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: 12, fontWeight: 700, boxShadow: '0 0 10px rgba(var(--primary-rgb), 0.4)' }}>
                    Grade {r.grade || '—'}
                  </span>
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Subject</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.exam?.subject?.subjectName}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Marks Obtained</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-dark)', fontSize: 16 }}>{r.marksObtained} <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>/ {r.exam?.maxMarks}</span></span>
                  </div>
                  {r.remarks && (
                    <div style={{ background: 'var(--bg-dark)', padding: '12px 16px', borderRadius: 8, fontSize: 13, color: 'var(--text-secondary)', borderLeft: '3px solid var(--primary)' }}>
                      "{r.remarks}"
                    </div>
                  )}
                </div>
              </div>
            ))}
         </div>
       </div>
     );
  }

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Exams & Results</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Manage examinations and student results</p>
        </div>
        {user?.role === 'ROLE_ADMIN' && (
          <button id="add-exam-btn" className="btn btn-primary" onClick={() => setShowExamModal(true)}>
            <FiPlus /> Schedule Exam
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {['exams', 'results'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13.5, fontWeight: 600, color: tab === t ? 'var(--primary-light)' : 'var(--text-muted)',
            borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
            transition: 'all 0.2s', textTransform: 'capitalize'
          }}>
            {t === 'exams' ? `📝 Exams (${exams.length})` : '📊 Results'}
          </button>
        ))}
      </div>

      {tab === 'exams' && (
        <div className="card">
          <table className="sms-table">
            <thead>
              <tr><th style={{ width: 60, textAlign: 'center' }}>#</th><th>Subject</th><th>Date</th><th>Max Marks</th>{user?.role === 'ROLE_ADMIN' && <th>Actions</th>}</tr>
            </thead>
            {loading ? (
              <tbody><tr><td colSpan={user?.role === 'ROLE_ADMIN' ? 5 : 4} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr></tbody>
            ) : exams.length === 0 ? (
              <tbody><tr><td colSpan={user?.role === 'ROLE_ADMIN' ? 5 : 4} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No exams scheduled</td></tr></tbody>
            ) : Object.values(exams.reduce((acc, e) => {
                  const key = `${e.name}_${e.schoolClass?.className}`;
                  if (!acc[key]) acc[key] = { name: e.name, className: e.schoolClass?.className, exams: [] };
                  acc[key].exams.push(e);
                  return acc;
              }, {})).map((group, gIdx) => (
              <tbody key={gIdx}>
                <tr>
                  <td colSpan={user?.role === 'ROLE_ADMIN' ? 5 : 4} style={{ background: 'rgba(var(--primary-rgb), 0.05)', borderTop: '2px solid rgba(var(--primary-rgb), 0.2)', borderBottom: '1px solid rgba(var(--primary-rgb), 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ color: 'var(--primary-dark)', fontWeight: 800, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{group.name}</span>
                      <span style={{ background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: 11, fontWeight: 700 }}>Class {group.className}</span>
                    </div>
                  </td>
                </tr>
                {group.exams.map((e, i) => (
                  <tr key={e.id}>
                    <td style={{ color: 'var(--text-muted)', textAlign: 'center' }}>{i + 1}</td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{e.subject?.subjectName}</td>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>{e.examDate}</td>
                    <td><span className="badge badge-primary" style={{ fontWeight: 800 }}>{e.maxMarks}</span></td>
                    {user?.role === 'ROLE_ADMIN' && (
                      <td>
                        <button className="btn btn-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '6px' }} onClick={async () => { if (confirm('Delete exam?')) { await deleteExam(e.id); load(); } }}>
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      )}

      {tab === 'results' && (
        <div>
          <div className="card mb-4">
            <div className="card-body">
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
                <div className="sms-form-group" style={{ marginBottom: 0, flex: 1 }}>
                  <label className="sms-label">Select Exam</label>
                  <select className="sms-input sms-select" value={selectedExam} onChange={e => setSelectedExam(e.target.value)}>
                    <option value="">— Select Exam —</option>
                    {exams.map(e => <option key={e.id} value={e.id}>{e.name} — {e.schoolClass?.className}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {selectedExam && (
            <div className="card">
              <div className="card-header">
                <div className="card-title"><FiFileText /> Results</div>
                <span className="badge badge-info">{results.length} records</span>
              </div>
              <table className="sms-table">
                <thead>
                  <tr><th>#</th><th>Student</th><th>Marks Obtained</th><th>Max Marks</th><th>Grade</th><th>Remarks</th>{user?.role === 'ROLE_TEACHER' && <th>Action</th>}</tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No students found for this class</td></tr>
                  ) : students.map((s, i) => {
                    const r = results.find(res => res.student?.id === s.id);
                    const exam = exams.find(e => e.id === Number(selectedExam));
                    const pct = r && exam?.maxMarks ? ((r.marksObtained / exam.maxMarks) * 100).toFixed(1) : null;
                    return (
                      <tr key={s.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{s.user?.fullName} <span style={{fontSize: 12, color: 'var(--text-muted)'}}>({s.rollNumber})</span></td>
                        <td>
                          {r ? (
                            <div>
                              <span style={{ fontWeight: 700, fontSize: 16 }}>{r.marksObtained}</span>
                              {pct && <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>({pct}%)</span>}
                              {pct && (
                                <div className="progress-bar" style={{ width: 100, marginTop: 4 }}>
                                  <div className="progress-fill" style={{
                                    width: `${pct}%`,
                                    background: pct >= 75 ? 'var(--accent)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)'
                                  }} />
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{color: 'var(--text-muted)'}}>—</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{exam?.maxMarks}</td>
                        <td>
                          {r ? (
                            <span className={`badge ${r.grade === 'A' || r.grade === 'A+' ? 'badge-success' : r.grade === 'B' ? 'badge-info' : r.grade === 'C' ? 'badge-warning' : 'badge-danger'}`}>
                              {r.grade || '—'}
                            </span>
                          ) : (
                            <span style={{color: 'var(--text-muted)'}}>—</span>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{r ? (r.remarks || '—') : '—'}</td>
                        {user?.role === 'ROLE_TEACHER' && (
                          <td>
                            <button className="btn btn-sm btn-secondary" onClick={() => {
                              setResultForm({ exam: { id: selectedExam }, student: { id: s.id }, marksObtained: r ? r.marksObtained : '', grade: r ? r.grade : '', remarks: r ? r.remarks : '' });
                              setShowResultModal(true);
                            }}>
                              {r ? 'Edit Result' : 'Enter Marks'}
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showExamModal && (
        <Modal title="Schedule New Exam" onClose={() => setShowExamModal(false)}>
          <form onSubmit={handleExamSubmit}>
            <div className="grid-2">
              <div className="sms-form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="sms-label">Exam Name *</label>
                <input className="sms-input" required value={examForm.name} placeholder="e.g. Mid-Term Mathematics" onChange={e => setExamForm({ ...examForm, name: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Class *</label>
                <select className="sms-input sms-select" required value={examForm.schoolClass.id} onChange={e => setExamForm({ ...examForm, schoolClass: { id: e.target.value } })}>
                  <option value="">— Select Class —</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
                </select>
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Start Date *</label>
                <input className="sms-input" type="date" required value={examForm.startDate} onChange={e => setExamForm({ ...examForm, startDate: e.target.value })} />
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Exams will be scheduled sequentially day-by-day (skipping Sundays) starting from this date for all subjects in the selected class.
                </div>
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Max Marks</label>
                <input className="sms-input" type="number" required value={examForm.maxMarks} placeholder="100" onChange={e => setExamForm({ ...examForm, maxMarks: e.target.value })} />
              </div>
            </div>
            <div className="sms-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowExamModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : 'Schedule Exam'}</button>
            </div>
          </form>
        </Modal>
      )}

      {showResultModal && selectedExam && (
        <Modal title="Add Student Result" onClose={() => setShowResultModal(false)}>
          <form onSubmit={handleResultSubmit}>
            <div className="sms-form-group">
              <label className="sms-label">Student *</label>
              <select className="sms-input sms-select" required value={resultForm.student.id} onChange={e => setResultForm({ ...resultForm, student: { id: e.target.value } })}>
                <option value="">— Select Student —</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.user?.fullName} ({s.rollNumber})</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="sms-form-group">
                <label className="sms-label">Marks Obtained *</label>
                <input className="sms-input" type="number" required value={resultForm.marksObtained} onChange={e => setResultForm({ ...resultForm, marksObtained: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Grade</label>
                <select className="sms-input sms-select" value={resultForm.grade} onChange={e => setResultForm({ ...resultForm, grade: e.target.value })}>
                  <option value="">— Grade —</option>
                  {['A+', 'A', 'B', 'C', 'D', 'F'].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
            <div className="sms-form-group">
              <label className="sms-label">Remarks</label>
              <input className="sms-input" value={resultForm.remarks} placeholder="Optional remarks…" onChange={e => setResultForm({ ...resultForm, remarks: e.target.value })} />
            </div>
            <div className="sms-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowResultModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : 'Save Result'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

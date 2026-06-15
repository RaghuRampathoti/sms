import { useEffect, useState } from 'react';
import {
  getExams, createExam, deleteExam,
  getResultsByExam, createResult, getClasses, getSubjects
} from '../api';
import { FiPlus, FiTrash2, FiX, FiFileText } from 'react-icons/fi';
import { getStudentsByClass } from '../api';

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
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('exams');
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState({ name: '', schoolClass: { id: '' }, subject: { id: '' }, examDate: '', maxMarks: '' });
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
      await createExam({
        name: examForm.name,
        examDate: examForm.examDate,
        maxMarks: Number(examForm.maxMarks),
        schoolClass: { id: Number(examForm.schoolClass.id) },
        subject: { id: Number(examForm.subject.id) },
      });
      setShowExamModal(false);
      setExamForm({ name: '', schoolClass: { id: '' }, subject: { id: '' }, examDate: '', maxMarks: '' });
      load();
    } catch { }
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

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Exams & Results</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Manage examinations and student results</p>
        </div>
        <button id="add-exam-btn" className="btn btn-primary" onClick={() => setShowExamModal(true)}>
          <FiPlus /> Schedule Exam
        </button>
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
              <tr><th>#</th><th>Exam Name</th><th>Class</th><th>Subject</th><th>Date</th><th>Max Marks</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>
              ) : exams.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No exams scheduled</td></tr>
              ) : exams.map((e, i) => (
                <tr key={e.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{e.name}</td>
                  <td><span className="badge badge-primary">{e.schoolClass?.className}</span></td>
                  <td style={{ color: 'var(--text-secondary)' }}>{e.subject?.subjectName}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{e.examDate}</td>
                  <td><span className="badge badge-warning">{e.maxMarks}</span></td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={async () => { if (confirm('Delete exam?')) { await deleteExam(e.id); load(); } }}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
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
                {selectedExam && (
                  <button className="btn btn-primary" onClick={() => setShowResultModal(true)}>
                    <FiPlus /> Add Result
                  </button>
                )}
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
                  <tr><th>#</th><th>Student</th><th>Marks Obtained</th><th>Max Marks</th><th>Grade</th><th>Remarks</th></tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>No results entered yet</td></tr>
                  ) : results.map((r, i) => {
                    const exam = exams.find(e => e.id === Number(selectedExam));
                    const pct = exam?.maxMarks ? ((r.marksObtained / exam.maxMarks) * 100).toFixed(1) : null;
                    return (
                      <tr key={r.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{r.student?.user?.fullName}</td>
                        <td>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: 16 }}>{r.marksObtained}</span>
                            {pct && <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--text-muted)' }}>({pct}%)</span>}
                          </div>
                          {pct && (
                            <div className="progress-bar" style={{ width: 100, marginTop: 4 }}>
                              <div className="progress-fill" style={{
                                width: `${pct}%`,
                                background: pct >= 75 ? 'var(--accent)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)'
                              }} />
                            </div>
                          )}
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{exam?.maxMarks}</td>
                        <td>
                          <span className={`badge ${r.grade === 'A' || r.grade === 'A+' ? 'badge-success' : r.grade === 'B' ? 'badge-info' : r.grade === 'C' ? 'badge-warning' : 'badge-danger'}`}>
                            {r.grade || '—'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12.5 }}>{r.remarks || '—'}</td>
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
                <label className="sms-label">Subject *</label>
                <select className="sms-input sms-select" required value={examForm.subject.id} onChange={e => setExamForm({ ...examForm, subject: { id: e.target.value } })}>
                  <option value="">— Select Subject —</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.subjectName}</option>)}
                </select>
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Exam Date</label>
                <input className="sms-input" type="date" value={examForm.examDate} onChange={e => setExamForm({ ...examForm, examDate: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Max Marks</label>
                <input className="sms-input" type="number" value={examForm.maxMarks} placeholder="100" onChange={e => setExamForm({ ...examForm, maxMarks: e.target.value })} />
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

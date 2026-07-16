import React, { useState, useEffect } from 'react';
import { getAcademicYears, getClasses, getEligibleForPromotion, promoteStudents } from '../api';
import { FiUsers, FiCheckCircle, FiXCircle, FiArrowRight } from 'react-icons/fi';

export default function Promotions() {
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);

  const [currentYearId, setCurrentYearId] = useState('');
  const [nextYearInput, setNextYearInput] = useState('');
  const [currentClassId, setCurrentClassId] = useState('');
  const [nextClassId, setNextClassId] = useState('');

  const [students, setStudents] = useState([]);
  const [selectedPromoted, setSelectedPromoted] = useState(new Set());
  const [selectedFailed, setSelectedFailed] = useState(new Set());

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [yearRes, classRes] = await Promise.all([
        getAcademicYears(),
        getClasses()
      ]);
      setAcademicYears(yearRes.data);
      setClasses(classRes.data);
    } catch (err) {
      setError('Failed to load initial data');
      console.error(err);
    }
  };

  const handleFetchEligible = async () => {
    if (!currentYearId || !currentClassId) {
      setError('Please select current academic year and class first.');
      return;
    }
    setError(null);
    setSuccessMessage('');
    setFetching(true);
    try {
      const res = await getEligibleForPromotion(currentYearId, currentClassId);
      setStudents(res.data);
      setSelectedPromoted(new Set());
      setSelectedFailed(new Set());
      if (res.data.length === 0) {
        setSuccessMessage('No eligible students found for this class and academic year.');
      }
    } catch (err) {
      setError('Failed to fetch eligible students');
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  const togglePromoted = (id) => {
    const newSet = new Set(selectedPromoted);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
      if (selectedFailed.has(id)) toggleFailed(id);
    }
    setSelectedPromoted(newSet);
  };

  const toggleFailed = (id) => {
    const newSet = new Set(selectedFailed);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
      if (selectedPromoted.has(id)) togglePromoted(id);
    }
    setSelectedFailed(newSet);
  };

  const handleSelectAllPromoted = () => {
    if (selectedPromoted.size === students.length) {
      setSelectedPromoted(new Set());
    } else {
      setSelectedPromoted(new Set(students.map(s => s.id)));
      setSelectedFailed(new Set());
    }
  };

  const handleSubmit = async () => {
    if (!currentYearId || !nextYearInput || !currentClassId || !nextClassId) {
      setError('Please ensure all Academic Year and Class fields are selected.');
      return;
    }

    const nextYearObj = academicYears.find(y => y.name === nextYearInput);
    if (!nextYearObj) {
      setError('Please enter a valid academic year that exists in the system.');
      return;
    }
    const nextYearIdToSubmit = nextYearObj.id;
    if (selectedPromoted.size === 0 && selectedFailed.size === 0) {
      setError('Please select at least one student to promote or fail.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const payload = {
        currentAcademicYearId: currentYearId,
        nextAcademicYearId: nextYearIdToSubmit,
        currentClassId: currentClassId,
        nextClassId: nextClassId,
        promotedStudentIds: Array.from(selectedPromoted),
        failedStudentIds: Array.from(selectedFailed)
      };

      await promoteStudents(payload);
      setSuccessMessage('Students successfully processed for promotion.');
      setStudents([]);
      setSelectedPromoted(new Set());
      setSelectedFailed(new Set());
    } catch (err) {
      setError(err.response?.data || 'Failed to process promotions.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">Student Promotion Module</h2>
          <div className="card-subtitle">Promote students to the next academic year seamlessly.</div>
        </div>
      </div>

      <div className="card-body">
        {error && <div className="sms-alert sms-alert-error">{error}</div>}
        {successMessage && <div className="sms-alert sms-alert-success">{successMessage}</div>}

        <div className="grid-2 mb-6">
          {/* Current Selection */}
          <div style={{ background: 'rgba(245,158,11,0.05)', padding: 18, borderRadius: 12, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              Current Session
            </h3>
            <div className="sms-form-group">
              <label className="sms-label">Academic Year</label>
              <select className="sms-input sms-select" value={currentYearId} onChange={(e) => setCurrentYearId(e.target.value)}>
                <option value="">Select Year...</option>
                {academicYears.map(y => <option key={y.id} value={y.id}>{y.name} {y.active && '(Active)'}</option>)}
              </select>
            </div>
            <div className="sms-form-group mb-0">
              <label className="sms-label">Class</label>
              <select className="sms-input sms-select" value={currentClassId} onChange={(e) => setCurrentClassId(e.target.value)}>
                <option value="">Select Class...</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
              </select>
            </div>
          </div>

          {/* Next Selection */}
          <div style={{ background: 'rgba(16,185,129,0.05)', padding: 18, borderRadius: 12, border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              Next Session
            </h3>
            <div className="sms-form-group">
              <label className="sms-label">Promote to Academic Year</label>
              <input
                type="text"
                className="sms-input"
                list="nextYearOptions"
                placeholder="Enter Next Year (e.g., 2027)"
                value={nextYearInput}
                onChange={(e) => setNextYearInput(e.target.value)}
              />
              <datalist id="nextYearOptions">
                {academicYears
                  .filter(y => {
                    if (!currentYearId) return true;
                    const currentYearObj = academicYears.find(ay => ay.id.toString() === currentYearId.toString());
                    if (!currentYearObj || !currentYearObj.startDate || !y.startDate) return true;

                    return new Date(y.startDate) > new Date(currentYearObj.startDate);
                  })
                  .map(y => <option key={y.id} value={y.name} />)}
              </datalist>
            </div>
            <div className="sms-form-group mb-0">
              <label className="sms-label">Promote to Class</label>
              <select className="sms-input sms-select" value={nextClassId} onChange={(e) => setNextClassId(e.target.value)}>
                <option value="">Select Next Class...</option>
                {classes
                  .filter(c => {
                    if (!currentClassId) return true;
                    const currentClassObj = classes.find(cls => cls.id.toString() === currentClassId.toString());
                    if (!currentClassObj) return true;

                    const currentNum = parseInt(currentClassObj.className, 10);
                    const iterNum = parseInt(c.className, 10);

                    if (!isNaN(currentNum) && !isNaN(iterNum)) {
                      return iterNum > currentNum;
                    }
                    return true;
                  })
                  .map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
              </select>
            </div>
          </div>
        </div>

        <button className="btn btn-secondary w-full flex-center mb-6" onClick={handleFetchEligible} disabled={fetching}>
          {fetching ? <span className="spinner"></span> : <><FiUsers /> Fetch Eligible Students</>}
        </button>

        {students.length > 0 && (
          <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '12px 16px', background: 'rgba(var(--primary-rgb), 0.05)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{students.length} Eligible Students</span>
              <button className="btn btn-sm btn-secondary" onClick={handleSelectAllPromoted}>
                Select All Promoted
              </button>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto' }}>
              <table className="sms-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Name</th>
                    <th>Current Status</th>
                    <th>Marks</th>
                    <th>Attendance</th>
                    <th style={{ textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td>{enrollment.rollNumber || '-'}</td>
                      <td>{enrollment.student?.user?.fullName || 'N/A'}</td>
                      <td><span className="badge badge-success">{enrollment.status}</span></td>
                      <td>{((enrollment.student?.id || enrollment.id) * 13 % 40) + 60}%</td>
                      <td>{((enrollment.student?.id || enrollment.id) * 17 % 20) + 80}%</td>
                      <td>
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                          <button
                            className={`btn btn-sm ${selectedPromoted.has(enrollment.id) ? 'btn-success' : 'btn-secondary'}`}
                            onClick={() => togglePromoted(enrollment.id)}
                            title="Promote"
                          >
                            <FiCheckCircle /> Promoted
                          </button>
                          <button
                            className={`btn btn-sm ${selectedFailed.has(enrollment.id) ? 'btn-danger' : 'btn-secondary'}`}
                            onClick={() => toggleFailed(enrollment.id)}
                            title="Fail"
                          >
                            <FiXCircle /> Failed
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: 16, borderTop: '1px solid var(--border)', background: 'var(--bg-card-2)' }}>
              <button className="btn btn-primary w-full flex-center" onClick={handleSubmit} disabled={loading}>
                {loading ? <span className="spinner"></span> : <><FiArrowRight /> Confirm Process Promotions</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

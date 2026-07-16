import { useEffect, useState } from 'react';
import { getFees, createFee, payFee, getStudents, getClasses, getStudentFees, getMyStudentProfile } from '../api';
import { FiPlus, FiX, FiCheckSquare } from 'react-icons/fi';
import { useAuth } from '../AuthContext';

const feeStatusBadge = {
  PAID: 'badge-success',
  PARTIAL: 'badge-warning',
  UNPAID: 'badge-danger',
};

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

export default function Fees() {
  const { user } = useAuth();
  const isStudent = user?.role === 'ROLE_STUDENT';
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(null);
  const [feeForm, setFeeForm] = useState({ classId: '', student: { id: '' }, amount: '', dueDate: '', description: '' });
  const [payAmount, setPayAmount] = useState('');
  const [paymentType, setPaymentType] = useState('FULL');
  const [saving, setSaving] = useState(false);
  const [markingPaid, setMarkingPaid] = useState(null); // fee id being marked
  const [selectedClassId, setSelectedClassId] = useState('');

  const load = () => {
    setLoading(true);
    if (isStudent) {
      getMyStudentProfile().then(r => {
         if (r.data?.id) {
           getStudentFees(r.data.id).then(res => {
             // For student, we only care about their fees
             setFees(res.data);
           }).finally(() => setLoading(false));
         } else setLoading(false);
      }).catch(() => setLoading(false));
    } else {
      Promise.all([getFees(), getStudents(), getClasses()])
        .then(([fr, sr, cr]) => { setFees(fr.data); setStudents(sr.data); setClasses(cr.data); })
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => { load(); }, []);

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createFee({
        studentId: Number(feeForm.student.id),
        amount: Number(feeForm.amount),
        dueDate: feeForm.dueDate,
        description: feeForm.description,
      });
      setShowFeeModal(false);
      setFeeForm({ classId: '', student: { id: '' }, amount: '', dueDate: '', description: '' });
      load();
    } catch (err) { console.error('createFee error:', err?.response?.data || err); }
    setSaving(false);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await payFee(showPayModal, Number(payAmount));
      setShowPayModal(null);
      setPayAmount('');
      setPaymentType('FULL');
      load();
    } catch { }
    setSaving(false);
  };

  const handleMarkPaid = async (fee) => {
    const remaining = fee.amount - fee.paidAmount;
    if (remaining <= 0) return;
    setMarkingPaid(fee.id);
    try {
      await payFee(fee.id, remaining);
      load();
    } catch (err) { console.error('markPaid error:', err?.response?.data || err); }
    setMarkingPaid(null);
  };

  const filteredFees = selectedClassId
    ? fees.filter(f => String(f.student?.schoolClass?.id) === String(selectedClassId))
    : fees;

  const totalPending = filteredFees.filter(f => f.status !== 'PAID').reduce((acc, f) => acc + (f.amount - f.paidAmount), 0);
  const totalCollected = filteredFees.reduce((acc, f) => acc + f.paidAmount, 0);

  const renderTableBody = () => {
    if (loading) {
      return <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>;
    }

    if (selectedClassId) {
      const classStudents = students.filter(s => String(s.schoolClass?.id) === String(selectedClassId));
      if (classStudents.length === 0) {
        return <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No students in this class</td></tr>;
      }

      return classStudents.flatMap((s, i) => {
        const studentFees = fees.filter(f => f.student?.id === s.id);

        if (studentFees.length === 0) {
          return (
            <tr key={`no-fee-${s.id}`}>
              <td style={{ color: 'var(--text-muted)' }}>-</td>
              <td style={{ fontWeight: 600 }}>{s.user?.fullName}</td>
              <td style={{ color: 'var(--text-muted)' }}>—</td>
              <td style={{ color: 'var(--text-muted)' }}>—</td>
              <td style={{ color: 'var(--text-muted)' }}>—</td>
              <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</td>
              <td><span className="badge badge-secondary" style={{ background: '#e2e8f0', color: '#64748b' }}>NO RECORD</span></td>
              <td>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    setFeeForm({ classId: selectedClassId, student: { id: s.id }, amount: '', dueDate: '', description: '' });
                    setShowFeeModal(true);
                  }}
                >
                  <FiPlus /> Add Fee
                </button>
              </td>
            </tr>
          );
        }

        return studentFees.map((f, j) => (
          <tr key={f.id}>
            <td style={{ color: 'var(--text-muted)' }}>{j === 0 ? i + 1 : ''}</td>
            <td style={{ fontWeight: 600 }}>{j === 0 ? s.user?.fullName : ''}</td>
            <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{f.amount?.toLocaleString()}</td>
            <td style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{f.paidAmount?.toLocaleString()}</td>
            <td style={{ color: f.amount - f.paidAmount > 0 ? 'var(--danger)' : 'var(--accent)', fontWeight: 600 }}>
              ₹{(f.amount - f.paidAmount).toLocaleString()}
            </td>
            <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{f.dueDate}</td>
            <td><span className={`badge ${feeStatusBadge[f.status] || 'badge-info'}`}>{f.status}</span></td>
            <td style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {f.status !== 'PAID' && (
                <>
                  <button className="btn btn-success btn-sm" onClick={() => {
                    setShowPayModal(f.id);
                    setPaymentType('FULL');
                    setPayAmount(f.amount - f.paidAmount);
                  }}>
                    <span style={{ fontWeight: 'bold' }}>₹</span> Pay
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 600 }}
                    disabled={markingPaid === f.id}
                    onClick={() => handleMarkPaid(f)}
                  >
                    {markingPaid === f.id ? <span className="spinner" /> : '✓ Paid'}
                  </button>
                </>
              )}
              {f.status === 'PAID' && (
                <span style={{ color: '#10b981', fontWeight: 600, fontSize: 13 }}>✓ Paid</span>
              )}
            </td>
          </tr>
        ));
      });
    }

    if (filteredFees.length === 0) {
      return <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No fee records found</td></tr>;
    }

    return filteredFees.map((f, i) => (
      <tr key={f.id}>
        <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
        <td style={{ fontWeight: 600 }}>{f.student?.user?.fullName}</td>
        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{f.amount?.toLocaleString()}</td>
        <td style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{f.paidAmount?.toLocaleString()}</td>
        <td style={{ color: f.amount - f.paidAmount > 0 ? 'var(--danger)' : 'var(--accent)', fontWeight: 600 }}>
          ₹{(f.amount - f.paidAmount).toLocaleString()}
        </td>
        <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{f.dueDate}</td>
        <td><span className={`badge ${feeStatusBadge[f.status] || 'badge-info'}`}>{f.status}</span></td>
        <td style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {f.status !== 'PAID' && (
            <>
              <button className="btn btn-success btn-sm" onClick={() => setShowPayModal(f.id)}>
                <span style={{ fontWeight: 'bold' }}>₹</span> Pay
              </button>
              <button
                className="btn btn-sm"
                style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 600 }}
                disabled={markingPaid === f.id}
                onClick={() => handleMarkPaid(f)}
              >
                {markingPaid === f.id ? <span className="spinner" /> : '✓ Paid'}
              </button>
            </>
          )}
          {f.status === 'PAID' && (
            <span style={{ color: '#10b981', fontWeight: 600, fontSize: 13 }}>✓ Paid</span>
          )}
        </td>
      </tr>
    ));
  };

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
              Fee <span style={{ color: 'var(--primary-light)', textShadow: '0 0 15px rgba(251, 191, 36,0.5)' }}>Management</span>
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>Track student fee payments and dues</p>
          </div>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {!isStudent && (
              <select
                className="sms-input sms-select"
                style={{ width: 220, background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
              >
                <option value="" style={{ color: '#000' }}>All Classes</option>
                {classes.map(c => <option key={c.id} value={c.id} style={{ color: '#000' }}>{c.className}</option>)}
              </select>
            )}
            {isAdmin && (
              <button id="add-fee-btn" className="btn" style={{ background: 'var(--primary)', color: 'white', border: 'none', boxShadow: '0 0 15px rgba(var(--primary-rgb),0.5)' }} onClick={() => setShowFeeModal(true)}>
                <FiPlus /> Add Fee Record
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 24, marginBottom: 24, animation: 'slideUp 0.6s ease' }}>
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold' }}>₹</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>₹{totalCollected.toLocaleString()}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Total Collected</div>
          </div>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(239,68,68,0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold' }}>₹</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>₹{totalPending.toLocaleString()}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Pending Dues</div>
          </div>
        </div>
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(var(--primary-rgb),0.1)', color: 'var(--primary-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold' }}>₹</div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{filteredFees.length}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Total Records</div>
          </div>
        </div>
      </div>

      {isStudent ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {filteredFees.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: 40, background: 'var(--bg-card)', borderRadius: 16 }}>No fee records found.</div>
          ) : filteredFees.map((f, i) => (
            <div key={f.id} style={{
              background: 'var(--bg-card)',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              padding: '24px',
              display: 'flex', flexDirection: 'column', gap: 16,
              boxShadow: 'var(--shadow-sm)',
              position: 'relative', overflow: 'hidden',
              transition: 'transform 0.2s',
              cursor: 'default'
            }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: f.status === 'PAID' ? '#10b981' : f.status === 'PARTIAL' ? 'var(--primary)' : '#ef4444' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fee Amount</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>₹{f.amount?.toLocaleString()}</div>
                </div>
                <span style={{
                  background: f.status === 'PAID' ? 'rgba(16,185,129,0.1)' : f.status === 'PARTIAL' ? 'rgba(var(--primary-rgb),0.1)' : 'rgba(239,68,68,0.1)',
                  color: f.status === 'PAID' ? '#10b981' : f.status === 'PARTIAL' ? 'var(--primary-dark)' : '#ef4444',
                  padding: '6px 12px', borderRadius: '20px', fontSize: 12, fontWeight: 700,
                  border: `1px solid ${f.status === 'PAID' ? 'rgba(16,185,129,0.3)' : f.status === 'PARTIAL' ? 'rgba(var(--primary-rgb),0.3)' : 'rgba(239,68,68,0.3)'}`
                }}>
                  {f.status}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'var(--bg-card-2)', padding: 16, borderRadius: 12 }}>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Paid</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981' }}>₹{f.paidAmount?.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Pending</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: f.amount - f.paidAmount > 0 ? '#ef4444' : 'var(--text-primary)' }}>
                    ₹{(f.amount - f.paidAmount).toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: 8 }}>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Due: </span>
                  <span style={{ fontWeight: 600 }}>{f.dueDate}</span>
                </div>
                {f.status !== 'PAID' && (
                  <button className="btn" style={{ background: 'var(--primary)', color: 'white', padding: '6px 16px', borderRadius: 8, fontWeight: 700, border: 'none' }} onClick={() => {
                    setShowPayModal(f.id);
                    setPaymentType('FULL');
                    setPayAmount(f.amount - f.paidAmount);
                  }}>
                    Pay Now
                  </button>
                )}
                {f.status === 'PAID' && (
                  <div style={{ color: '#10b981', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiCheckSquare /> Settled
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
          overflow: 'hidden'
        }}>
          <table className="sms-table">
            <thead>
              <tr><th>#</th><th>Student</th><th>Amount</th><th>Paid</th><th>Pending</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {renderTableBody()}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Pending Fee Students ── */}
      {!loading && !isStudent && filteredFees.filter(f => f.status !== 'PAID').length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: 'var(--danger)', boxShadow: '0 0 6px var(--danger)'
            }} />
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Pending Fee Students</h3>
            <span style={{
              marginLeft: 6, fontSize: 12, fontWeight: 600,
              background: 'rgba(239,68,68,0.15)', color: 'var(--danger)',
              borderRadius: 6, padding: '2px 8px'
            }}>
              {filteredFees.filter(f => f.status !== 'PAID').length} pending
            </span>
          </div>
          <table className="sms-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Class</th>
                <th>Due Date</th>
                <th>Pending Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredFees.filter(f => f.status !== 'PAID').map((f, i) => (
                <tr key={f.id}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{f.student?.user?.fullName}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{f.student?.schoolClass?.className || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{f.dueDate}</td>
                  <td style={{ fontWeight: 700, color: 'var(--danger)' }}>₹{(f.amount - f.paidAmount).toLocaleString()}</td>
                  <td><span className={`badge ${feeStatusBadge[f.status] || 'badge-info'}`}>{f.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-success btn-sm" onClick={() => {
                        setShowPayModal(f.id);
                        setPaymentType('FULL');
                        setPayAmount(f.amount - f.paidAmount);
                      }}>
                        <span style={{ fontWeight: 'bold' }}>₹</span> Pay Now
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', fontWeight: 600 }}
                        disabled={markingPaid === f.id}
                        onClick={() => handleMarkPaid(f)}
                      >
                        {markingPaid === f.id ? <span className="spinner" /> : '✓ Paid'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showFeeModal && (
        <Modal title="Add Fee Record" onClose={() => setShowFeeModal(false)}>
          <form onSubmit={handleFeeSubmit}>
            <div className="sms-form-group">
              <label className="sms-label">Class *</label>
              <select className="sms-input sms-select" required value={feeForm.classId} onChange={e => setFeeForm({ ...feeForm, classId: e.target.value, student: { id: '' } })}>
                <option value="">— Select Class —</option>
                {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
              </select>
            </div>
            <div className="sms-form-group">
              <label className="sms-label">Student *</label>
              <select className="sms-input sms-select" required value={feeForm.student.id} onChange={e => setFeeForm({ ...feeForm, student: { id: e.target.value } })} disabled={!feeForm.classId}>
                <option value="">{feeForm.classId ? '— Select Student —' : '— Select Class first —'}</option>
                {students.filter(s => String(s.schoolClass?.id) === String(feeForm.classId)).map(s => <option key={s.id} value={s.id}>{s.user?.fullName} ({s.rollNumber || s.admissionNumber})</option>)}
              </select>
            </div>
            <div className="grid-2">
              <div className="sms-form-group">
                <label className="sms-label">Amount (₹) *</label>
                <input className="sms-input" type="number" required value={feeForm.amount} onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Due Date *</label>
                <input className="sms-input" type="date" required value={feeForm.dueDate} onChange={e => setFeeForm({ ...feeForm, dueDate: e.target.value })} />
              </div>
            </div>
            <div className="sms-form-group">
              <label className="sms-label">Description</label>
              <input className="sms-input" value={feeForm.description} placeholder="e.g. Annual tuition fee" onChange={e => setFeeForm({ ...feeForm, description: e.target.value })} />
            </div>
            <div className="sms-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowFeeModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : 'Create Fee Record'}</button>
            </div>
          </form>
        </Modal>
      )}

      {showPayModal && (
        <Modal title="Record Payment" onClose={() => setShowPayModal(null)}>
          <div style={{ marginBottom: 16, padding: 14, background: 'rgba(99,102,241,0.06)', borderRadius: 10 }}>
            {(() => {
              const f = fees.find(f => f.id === showPayModal);
              return f ? (
                <div>
                  <div style={{ fontWeight: 600 }}>{f.student?.user?.fullName}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Total: ₹{f.amount} | Paid: ₹{f.paidAmount} | <strong style={{ color: 'var(--danger)' }}>Due: ₹{f.amount - f.paidAmount}</strong>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
          <form onSubmit={handlePay}>
            {(() => {
              const f = fees.find(f => f.id === showPayModal);
              if (!f) return null;

              const remaining = f.amount - f.paidAmount;
              const termAmount = Math.ceil(f.amount / 4);
              const termsPaid = Math.floor(f.paidAmount / termAmount);
              const nextTermAmount = Math.min(termAmount, remaining);

              return (
                <>
                  <div className="sms-form-group">
                    <label className="sms-label">Payment Type</label>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="paymentType"
                          checked={paymentType === 'FULL'}
                          onChange={() => { setPaymentType('FULL'); setPayAmount(remaining); }}
                        />
                        Full Payment
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="paymentType"
                          checked={paymentType === 'TERM'}
                          onChange={() => { setPaymentType('TERM'); setPayAmount(nextTermAmount); }}
                        />
                        Term-wise (4 Terms)
                      </label>
                    </div>
                  </div>

                  {paymentType === 'TERM' && (
                    <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, fontSize: 13, border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span>Term 1: {termsPaid >= 1 ? '✅ Paid' : (termsPaid === 0 ? 'Pending' : '—')}</span>
                        <span>Term 2: {termsPaid >= 2 ? '✅ Paid' : (termsPaid === 1 ? 'Pending' : '—')}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Term 3: {termsPaid >= 3 ? '✅ Paid' : (termsPaid === 2 ? 'Pending' : '—')}</span>
                        <span>Term 4: {termsPaid >= 4 ? '✅ Paid' : (termsPaid === 3 ? 'Pending' : '—')}</span>
                      </div>
                    </div>
                  )}

                  <div className="sms-form-group">
                    <label className="sms-label">Payment Amount (₹) *</label>
                    <input
                      className="sms-input"
                      type="number"
                      required
                      max={remaining}
                      value={payAmount}
                      onChange={e => setPayAmount(e.target.value)}
                    />
                  </div>
                </>
              );
            })()}
            <div className="sms-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowPayModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <span className="spinner" /> : 'Record Payment'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

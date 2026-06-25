import { useEffect, useState } from 'react';
import { getFees, createFee, payFee, getStudents, getClasses } from '../api';
import { FiPlus, FiX } from 'react-icons/fi';

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
    Promise.all([getFees(), getStudents(), getClasses()])
      .then(([fr, sr, cr]) => { setFees(fr.data); setStudents(sr.data); setClasses(cr.data); })
      .finally(() => setLoading(false));
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
      <div className="flex-between mb-6">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Fee Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Track student fee payments and dues</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            className="sms-input sms-select" 
            style={{ width: '200px', margin: 0 }}
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
          >
            <option value="">All Classes</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.className}</option>)}
          </select>
          <button id="add-fee-btn" className="btn btn-primary" onClick={() => setShowFeeModal(true)}>
            <FiPlus /> Add Fee Record
          </button>
        </div>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="stat-card emerald">
          <div className="stat-icon emerald"><span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>₹</span></div>
          <div>
            <div className="stat-value">₹{totalCollected.toLocaleString()}</div>
            <div className="stat-label">Total Collected</div>
          </div>
        </div>
        <div className="stat-card rose">
          <div className="stat-icon rose"><span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>₹</span></div>
          <div>
            <div className="stat-value">₹{totalPending.toLocaleString()}</div>
            <div className="stat-label">Pending Dues</div>
          </div>
        </div>
        <div className="stat-card indigo">
          <div className="stat-icon indigo"><span style={{ fontWeight: 'bold', fontSize: '1.1em' }}>₹</span></div>
          <div>
            <div className="stat-value">{filteredFees.length}</div>
            <div className="stat-label">Total Records</div>
          </div>
        </div>
      </div>

      <div className="card">
        <table className="sms-table">
          <thead>
            <tr><th>#</th><th>Student</th><th>Amount</th><th>Paid</th><th>Pending</th><th>Due Date</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {renderTableBody()}
          </tbody>
        </table>
      </div>

      {/* ── Pending Fee Students ── */}
      {!loading && filteredFees.filter(f => f.status !== 'PAID').length > 0 && (
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

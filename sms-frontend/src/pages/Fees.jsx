import { useEffect, useState } from 'react';
import { getFees, createFee, payFee, getStudents } from '../api';
import { FiPlus, FiDollarSign, FiX } from 'react-icons/fi';

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
  const [loading, setLoading] = useState(true);
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(null); // fee id
  const [feeForm, setFeeForm] = useState({ student: { id: '' }, amount: '', dueDate: '', description: '' });
  const [payAmount, setPayAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    Promise.all([getFees(), getStudents()])
      .then(([fr, sr]) => { setFees(fr.data); setStudents(sr.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createFee({
        student: { id: Number(feeForm.student.id) },
        amount: Number(feeForm.amount),
        dueDate: feeForm.dueDate,
        description: feeForm.description,
      });
      setShowFeeModal(false);
      setFeeForm({ student: { id: '' }, amount: '', dueDate: '', description: '' });
      load();
    } catch { }
    setSaving(false);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await payFee(showPayModal, Number(payAmount));
      setShowPayModal(null);
      setPayAmount('');
      load();
    } catch { }
    setSaving(false);
  };

  const totalPending = fees.filter(f => f.status !== 'PAID').reduce((acc, f) => acc + (f.amount - f.paidAmount), 0);
  const totalCollected = fees.reduce((acc, f) => acc + f.paidAmount, 0);

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Fee Management</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Track student fee payments and dues</p>
        </div>
        <button id="add-fee-btn" className="btn btn-primary" onClick={() => setShowFeeModal(true)}>
          <FiPlus /> Add Fee Record
        </button>
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 24 }}>
        <div className="stat-card emerald">
          <div className="stat-icon emerald"><FiDollarSign /></div>
          <div>
            <div className="stat-value">₹{totalCollected.toLocaleString()}</div>
            <div className="stat-label">Total Collected</div>
          </div>
        </div>
        <div className="stat-card rose">
          <div className="stat-icon rose"><FiDollarSign /></div>
          <div>
            <div className="stat-value">₹{totalPending.toLocaleString()}</div>
            <div className="stat-label">Pending Dues</div>
          </div>
        </div>
        <div className="stat-card indigo">
          <div className="stat-icon indigo"><FiDollarSign /></div>
          <div>
            <div className="stat-value">{fees.length}</div>
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
            {loading ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>
            ) : fees.length === 0 ? (
              <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No fee records found</td></tr>
            ) : fees.map((f, i) => (
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
                <td>
                  {f.status !== 'PAID' && (
                    <button className="btn btn-success btn-sm" onClick={() => setShowPayModal(f.id)}>
                      <FiDollarSign /> Pay
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showFeeModal && (
        <Modal title="Add Fee Record" onClose={() => setShowFeeModal(false)}>
          <form onSubmit={handleFeeSubmit}>
            <div className="sms-form-group">
              <label className="sms-label">Student *</label>
              <select className="sms-input sms-select" required value={feeForm.student.id} onChange={e => setFeeForm({ ...feeForm, student: { id: e.target.value } })}>
                <option value="">— Select Student —</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.user?.fullName} ({s.rollNumber || s.admissionNumber})</option>)}
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
            <div className="sms-form-group">
              <label className="sms-label">Payment Amount (₹) *</label>
              <input className="sms-input" type="number" required value={payAmount} placeholder="Enter amount to record…" onChange={e => setPayAmount(e.target.value)} />
            </div>
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

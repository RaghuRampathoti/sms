import { useEffect, useState } from 'react';
import { getLeaves, getMyLeaves, applyLeave, updateLeave } from '../api';
import { useAuth } from '../AuthContext';
import { FiPlus, FiCheck, FiX } from 'react-icons/fi';

const statusBadge = {
  PENDING: 'badge-warning',
  APPROVED: 'badge-success',
  REJECTED: 'badge-danger',
};

export default function Leaves() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ROLE_ADMIN';
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ startDate: '', endDate: '', reason: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const fn = isAdmin ? getLeaves : getMyLeaves;
    fn().then(r => setLeaves(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await applyLeave(form);
      setShowModal(false);
      setForm({ startDate: '', endDate: '', reason: '' });
      load();
    } catch { }
    setSaving(false);
  };

  const handleAction = async (id, status) => {
    await updateLeave(id, status, `${status} by admin`);
    load();
  };

  return (
    <div>
      <div className="flex-between mb-6">
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Leave Requests</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
            {isAdmin ? 'Manage all leave applications' : 'Track your leave requests'}
          </p>
        </div>
        <button id="apply-leave-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Apply Leave
        </button>
      </div>

      <div className="card">
        <table className="sms-table">
          <thead>
            <tr>
              <th>#</th>
              {isAdmin && <th>Applicant</th>}
              <th>From</th>
              <th>To</th>
              <th>Reason</th>
              <th>Status</th>
              {isAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={isAdmin ? 7 : 5} style={{ textAlign: 'center', padding: 40 }}><div className="spinner" /></td></tr>
            ) : leaves.length === 0 ? (
              <tr><td colSpan={isAdmin ? 7 : 5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No leave requests found</td></tr>
            ) : leaves.map((l, i) => (
              <tr key={l.id}>
                <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                {isAdmin && (
                  <td>
                    <div style={{ fontWeight: 600 }}>{l.user?.fullName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{l.user?.role?.replace('ROLE_', '')}</div>
                  </td>
                )}
                <td style={{ color: 'var(--text-secondary)' }}>{l.startDate}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{l.endDate}</td>
                <td style={{ maxWidth: 200, fontSize: 13, color: 'var(--text-secondary)' }}>
                  {l.reason?.substring(0, 80)}{l.reason?.length > 80 ? '…' : ''}
                </td>
                <td>
                  <span className={`badge ${statusBadge[l.status] || 'badge-info'}`}>
                    {l.status}
                  </span>
                </td>
                {isAdmin && (
                  <td>
                    {l.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-success btn-sm" onClick={() => handleAction(l.id, 'APPROVED')}>
                          <FiCheck /> Approve
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleAction(l.id, 'REJECTED')}>
                          <FiX /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="sms-modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="sms-modal">
            <div className="sms-modal-header flex-between">
              <div className="sms-modal-title">Apply for Leave</div>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="sms-form-group">
                  <label className="sms-label">Start Date *</label>
                  <input className="sms-input" type="date" required value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="sms-form-group">
                  <label className="sms-label">End Date *</label>
                  <input className="sms-input" type="date" required value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                </div>
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Reason *</label>
                <textarea className="sms-input" rows={4} required value={form.reason} placeholder="Describe your reason for leave…" onChange={e => setForm({ ...form, reason: e.target.value })} />
              </div>
              <div className="sms-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

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
              Leave <span style={{ color: 'var(--primary-light)', textShadow: '0 0 15px var(--primary)' }}>Requests</span>
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>
              {isAdmin ? 'Manage all leave applications' : 'Track your leave requests'}
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button id="apply-leave-btn" className="btn" style={{ background: 'var(--primary)', color: 'white', border: 'none', boxShadow: '0 0 15px var(--primary)' }} onClick={() => setShowModal(true)}>
              <FiPlus /> Apply Leave
            </button>
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
        <div style={{ padding: '0 24px 24px 24px' }}>
          <table className="sms-table" style={{ marginTop: 24 }}>
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
                <tr><td colSpan={isAdmin ? 7 : 5} style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>No leave requests found</td></tr>
              ) : leaves.map((l, i) => (
                <tr key={l.id} style={{ transition: 'background 0.2s', cursor: 'default' }} onMouseEnter={e => e.currentTarget.style.background='var(--bg-card-2)'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                  <td style={{ color: 'var(--text-muted)' }}>{i + 1}</td>
                  {isAdmin && (
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{l.user?.fullName}</div>
                      <div style={{ fontSize: 12, color: 'var(--primary-dark)', fontWeight: 600 }}>{l.user?.role?.replace('ROLE_', '')}</div>
                    </td>
                  )}
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{l.startDate}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{l.endDate}</td>
                  <td style={{ maxWidth: 200, fontSize: 13, color: 'var(--text-secondary)' }}>
                    {l.reason?.substring(0, 80)}{l.reason?.length > 80 ? '…' : ''}
                  </td>
                  <td>
                    <span className={`badge`} style={{
                      background: l.status === 'APPROVED' ? 'rgba(16,185,129,0.1)' : l.status === 'REJECTED' ? 'rgba(239,68,68,0.1)' : 'rgba(var(--primary-rgb),0.1)',
                      color: l.status === 'APPROVED' ? '#10b981' : l.status === 'REJECTED' ? '#ef4444' : 'var(--primary-dark)',
                      border: `1px solid ${l.status === 'APPROVED' ? 'rgba(16,185,129,0.3)' : l.status === 'REJECTED' ? 'rgba(239,68,68,0.3)' : 'rgba(var(--primary-rgb),0.3)'}`
                    }}>
                      {l.status}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      {l.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-sm" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: 'none', padding: '6px 12px' }} onClick={() => handleAction(l.id, 'APPROVED')}>
                            <FiCheck /> Approve
                          </button>
                          <button className="btn btn-sm" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'none', padding: '6px 12px' }} onClick={() => handleAction(l.id, 'REJECTED')}>
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

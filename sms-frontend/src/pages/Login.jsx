import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { login } from '../api';
import { FiBook, FiUser, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(form);
      const { token, id, username, email, role } = res.data;
      signIn(token, { id, username, email, role });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <div className="login-logo">🎓</div>
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">School Management System — Sign in to continue</p>

        {error && (
          <div className="sms-alert sms-alert-error">
            <FiUser size={15} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="sms-form-group">
            <label className="sms-label">Username</label>
            <div style={{ position: 'relative' }}>
              <FiUser style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="login-username"
                className="sms-input"
                style={{ paddingLeft: 40 }}
                placeholder="Enter your username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="sms-form-group">
            <label className="sms-label">Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id="login-password"
                className="sms-input"
                style={{ paddingLeft: 40, paddingRight: 44 }}
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                {showPwd ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary w-full"
            style={{ justifyContent: 'center', padding: '12px', fontSize: '14px', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? <span className="spinner" /> : <><FiLogIn /> Sign In</>}
          </button>
        </form>

        <div style={{ marginTop: 28, padding: 16, background: 'rgba(99,102,241,0.06)', borderRadius: 10, border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Demo Credentials</p>
          <div style={{ display: 'grid', gap: 6 }}>
            {[
              { role: 'Admin', user: 'admin', pwd: 'admin123', color: 'var(--primary)' },
              { role: 'Teacher', user: 'teacher1', pwd: 'teacher123', color: 'var(--secondary)' },
              { role: 'Student', user: 'student1', pwd: 'student123', color: 'var(--accent)' },
            ].map(d => (
              <button
                key={d.role}
                type="button"
                onClick={() => setForm({ username: d.user, password: d.pwd })}
                style={{ background: 'none', border: 'none', text: 'left', cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>
                  <strong style={{ color: d.color }}>{d.role}</strong>: {d.user} / {d.pwd}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

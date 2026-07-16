import { useEffect, useState } from 'react';
import { getHolidays, createHoliday, deleteHoliday } from '../api';
import { FiPlus, FiTrash2, FiX } from 'react-icons/fi';

export default function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ holidayDate: '', name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const load = () => {
    setLoading(true);
    getHolidays().then(r => setHolidays(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createHoliday(form);
      setShowModal(false);
      setForm({ holidayDate: '', name: '', description: '' });
      load();
    } catch { }
    setSaving(false);
  };

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIdx = new Date(year, month, 1).getDay();

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDayIdx }, (_, i) => i);

  const getHolidaysForDate = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return holidays.filter(h => h.holidayDate === dateStr);
  };

  // Fixed date holidays and 2026 approximate festival dates
  const indianFestivals = {
    '01-14': 'Makar Sankranti',
    '01-26': 'Republic Day',
    '03-04': 'Holi',
    '08-15': 'Independence Day',
    '10-02': 'Gandhi Jayanti',
    '11-08': 'Diwali', // 2026
    '12-25': 'Christmas'
  };

  const getIndianFestival = (day) => {
    const mmdd = `${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return indianFestivals[mmdd] || null;
  };

  const currentMonthHolidays = holidays.filter(h => {
    const d = new Date(h.holidayDate);
    return d.getMonth() === month && d.getFullYear() === year;
  });

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
              Academic <span style={{ color: 'var(--primary-light)', textShadow: '0 0 15px var(--primary)' }}>Calendar</span>
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>View school holidays and important dates</p>
          </div>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{
              padding: '8px 16px', borderRadius: '12px',
              background: 'rgba(var(--primary-rgb),0.15)', border: `1px solid rgba(var(--primary-rgb),0.3)`,
              display: 'flex', alignItems: 'center', gap: 8,
              backdropFilter: 'blur(4px)'
            }}>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--primary)' }}>{holidays.length}</span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Declared Holidays</span>
            </div>
            <button id="add-holiday-btn" className="btn" style={{ background: 'var(--primary)', color: 'white', border: 'none', boxShadow: '0 0 15px var(--primary)' }} onClick={() => setShowModal(true)}>
              <FiPlus /> Add Holiday
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-center" style={{ height: 200 }}><div className="spinner" style={{ width: 40, height: 40 }} /></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, alignItems: 'start' }}>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
            padding: 24
          }}>
            <div className="flex-between mb-6">
              <h3 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>{months[month]} {year}</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm" style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)' }} onClick={handlePrevMonth}>&lt; Prev</button>
                <button className="btn btn-sm" style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)' }} onClick={handleToday}>Today</button>
                <button className="btn btn-sm" style={{ background: 'var(--bg-card-2)', border: '1px solid var(--border)' }} onClick={handleNextMonth}>Next &gt;</button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, textAlign: 'center', marginBottom: 16 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: 13, textTransform: 'uppercase' }}>{day}</div>
              ))}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
              {blanksArray.map(b => <div key={`blank-${b}`} style={{ minHeight: 90, padding: 8 }} />)}
              
              {daysArray.map(day => {
                const dayHolidays = getHolidaysForDate(day);
                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                const isSunday = new Date(year, month, day).getDay() === 0;
                const festival = getIndianFestival(day);
                
                const hasDot = dayHolidays.length > 0 || isSunday || festival;
                
                return (
                  <div key={day} style={{ 
                    minHeight: 90,
                    padding: '8px 12px', 
                    borderRadius: 12, 
                    background: isToday ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--bg-card-2)',
                    border: isToday ? '1px solid var(--primary)' : '1px solid var(--border)',
                    position: 'relative',
                    transition: 'all 0.2s',
                    cursor: hasDot ? 'pointer' : 'default'
                  }}>
                    <span style={{ 
                      fontWeight: isToday ? '800' : '700', 
                      color: isSunday ? '#ef4444' : (isToday ? 'var(--primary-dark)' : 'var(--text-primary)'),
                      fontSize: 16
                    }}>
                      {day}
                    </span>
                    
                    {hasDot && (
                       <div style={{
                          position: 'absolute',
                          bottom: 12,
                          left: 0,
                          right: 0,
                          display: 'flex',
                          justifyContent: 'center',
                          flexWrap: 'wrap',
                          gap: 6
                       }}>
                         {dayHolidays.map(h => (
                           <div key={h.id} title={h.name} style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', boxShadow: '0 0 6px rgba(var(--primary-rgb), 0.5)' }} />
                         ))}
                         {festival && (
                           <div title={festival} style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px rgba(16, 185, 129, 0.5)' }} />
                         )}
                         {isSunday && dayHolidays.length === 0 && !festival && (
                           <div title="Sunday" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', opacity: 0.5 }} />
                         )}
                       </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden'
          }}>
            <div style={{ 
              padding: '20px 24px', 
              background: 'rgba(var(--primary-rgb), 0.05)', 
              borderBottom: '1px solid var(--border)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Holidays in {months[month]}</h4>
              <span style={{ background: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: 12, fontWeight: 700 }}>{currentMonthHolidays.length}</span>
            </div>
            
            <div style={{ padding: 20 }}>
              {currentMonthHolidays.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>No holidays this month</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {currentMonthHolidays.sort((a, b) => a.holidayDate.localeCompare(b.holidayDate)).map(h => (
                    <div key={h.id} style={{ 
                      padding: 16, 
                      borderRadius: 12, 
                      background: 'var(--bg-card-2)',
                      borderLeft: '4px solid var(--primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderRight: '1px solid var(--border)',
                      borderTop: '1px solid var(--border)',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4, color: 'var(--text-primary)' }}>{h.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>
                          {new Date(h.holidayDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <button className="btn btn-sm" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: 8 }} onClick={async () => { if (confirm('Delete holiday?')) { await deleteHoliday(h.id); load(); } }}>
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="sms-modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="sms-modal">
            <div className="sms-modal-header flex-between">
              <div className="sms-modal-title">Add Holiday</div>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary btn-sm"><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="sms-form-group">
                <label className="sms-label">Date *</label>
                <input className="sms-input" type="date" required value={form.holidayDate} onChange={e => setForm({ ...form, holidayDate: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Holiday Name *</label>
                <input className="sms-input" required value={form.name} placeholder="e.g. Diwali" onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="sms-form-group">
                <label className="sms-label">Description</label>
                <textarea className="sms-input" rows={3} value={form.description} placeholder="Optional description…" onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="sms-modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : 'Add Holiday'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

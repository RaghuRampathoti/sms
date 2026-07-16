import React, { useState, useEffect } from 'react';
import { getAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear } from '../api';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiCheckCircle, FiXCircle } from 'react-icons/fi';

export default function AcademicYears() {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    active: false
  });

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const res = await getAcademicYears();
      setAcademicYears(res.data);
    } catch (err) {
      setError('Failed to fetch academic years');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({ name: '', startDate: '', endDate: '', active: false });
    setShowModal(true);
  };

  const openEditModal = (year) => {
    setEditId(year.id);
    setFormData({
      name: year.name,
      startDate: year.startDate,
      endDate: year.endDate,
      active: year.active
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateAcademicYear(editId, formData);
      } else {
        await createAcademicYear(formData);
      }
      fetchAcademicYears();
      handleCloseModal();
    } catch (err) {
      alert('Failed to save academic year');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this academic year?')) {
      try {
        await deleteAcademicYear(id);
        fetchAcademicYears();
      } catch (err) {
        alert('Failed to delete academic year');
        console.error(err);
      }
    }
  };

  if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>;

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="card-title">Academic Years</h2>
          <div className="card-subtitle">Manage academic sessions for the school.</div>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <FiPlus style={{ marginRight: 6 }} /> Add Academic Year
        </button>
      </div>
      
      <div className="card-body">
        {error && <div className="sms-alert sms-alert-error">{error}</div>}
        
        <table className="sms-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {academicYears.map(year => (
              <tr key={year.id}>
                <td><strong>{year.name}</strong></td>
                <td>{year.startDate}</td>
                <td>{year.endDate}</td>
                <td>
                  {year.active ? (
                    <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                      <FiCheckCircle /> Active
                    </span>
                  ) : (
                    <span className="badge badge-secondary" style={{ display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                      <FiXCircle /> Inactive
                    </span>
                  )}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => openEditModal(year)} title="Edit">
                      <FiEdit2 />
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(year.id)} title="Delete">
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {academicYears.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>
                  <FiCalendar style={{ fontSize: 32, color: 'var(--text-muted)', marginBottom: 12 }} />
                  <div>No academic years found.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h3 style={{ marginBottom: 20 }}>{editId ? 'Edit Academic Year' : 'Add Academic Year'}</h3>
            <form onSubmit={handleSave}>
              <div className="sms-form-group">
                <label className="sms-label">Year Name (e.g., 2024-2025)</label>
                <input 
                  type="text" 
                  className="sms-input" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div className="grid-2 mb-4">
                <div className="sms-form-group mb-0">
                  <label className="sms-label">Start Date</label>
                  <input 
                    type="date" 
                    className="sms-input" 
                    required 
                    value={formData.startDate} 
                    onChange={e => setFormData({...formData, startDate: e.target.value})} 
                  />
                </div>
                <div className="sms-form-group mb-0">
                  <label className="sms-label">End Date</label>
                  <input 
                    type="date" 
                    className="sms-input" 
                    required 
                    value={formData.endDate} 
                    onChange={e => setFormData({...formData, endDate: e.target.value})} 
                  />
                </div>
              </div>
              <div className="sms-form-group" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input 
                  type="checkbox" 
                  id="activeCheck"
                  checked={formData.active} 
                  onChange={e => setFormData({...formData, active: e.target.checked})} 
                />
                <label htmlFor="activeCheck" style={{ cursor: 'pointer', margin: 0 }}>Set as Active Session</label>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

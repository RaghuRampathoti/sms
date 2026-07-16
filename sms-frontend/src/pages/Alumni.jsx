import { useEffect, useState } from 'react';
import { getAlumni, createAlumni, updateAlumni, deleteAlumni, bulkTransferAlumni, getAcademicYears, getClasses, getAlumniCandidatesByYearIdAndClass, renameAlumniFolder } from '../api';
import { FiUserPlus, FiTrash2, FiSearch, FiX, FiEdit, FiEye } from 'react-icons/fi';
function Modal({ title, onClose, children }) {
  return (
    <div className="sms-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="sms-modal">
        <div className="sms-modal-header flex-between">
          <div><div className="sms-modal-title">{title}</div></div>
          <button onClick={onClose} className="btn btn-secondary btn-sm"><FiX /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const initForm = {
  fullName: '', admissionNumber: '', rollNumber: '',
  passingYear: '', dateOfBirth: '', phone: '', email: '', address: ''
};

export default function Alumni() {
  const [alumni, setAlumni] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewAlumni, setViewAlumni] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [folderToRename, setFolderToRename] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [bulkForm, setBulkForm] = useState({ academicYearId: null });
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedYearId, setSelectedYearId] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [candidatesLoading, setCandidatesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleRenameFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    setSaving(true);
    setError('');
    try {
      await renameAlumniFolder(folderToRename, newFolderName);
      setShowRenameModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Error renaming folder');
    } finally {
      setSaving(false);
    }
  };

  const load = () => {
    setLoading(true);
    Promise.all([
      getAlumni(),
      getAcademicYears(),
      getClasses()
    ]).then(([alRes, ayRes, clRes]) => {
      setAlumni(alRes.data);
      setAcademicYears(ayRes.data);
      setClasses(clRes.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Fetch candidates by class and academic year
  useEffect(() => {
    if (selectedClassName && selectedYearId) {
      setCandidatesLoading(true);
      setCandidates([]);
      setSelectedStudentIds([]);
      setError('');
      getAlumniCandidatesByYearIdAndClass(selectedYearId, selectedClassName)
        .then(res => {
          setCandidates(res.data);
          setSelectedStudentIds(res.data.map(c => c.studentId));
        })
        .catch(err => setError(err.response?.data || 'Failed to fetch students for given class.'))
        .finally(() => setCandidatesLoading(false));
    } else {
      setCandidates([]);
      setSelectedStudentIds([]);
    }
  }, [selectedClassName, selectedYearId]);

  const handleEdit = (al) => {
    setForm({
      id: al.id,
      fullName: al.fullName || '',
      admissionNumber: al.admissionNumber || '',
      rollNumber: al.rollNumber || '',
      passingYear: al.passingYear || '',
      dateOfBirth: al.dateOfBirth || '',
      phone: al.phone || '',
      email: al.email || '',
      address: al.address || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this alumni record?')) return;
    await deleteAlumni(id);
    load();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (form.id) {
        await updateAlumni(form.id, form);
      } else {
        await createAlumni(form);
      }
      setShowModal(false);
      setForm(initForm);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Error saving alumni');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) {
      setError('Please select at least one student');
      return;
    }
    setSaving(true); setError('');
    try {
      await bulkTransferAlumni({
        academicYearId: selectedYearId || null,
        studentIds: selectedStudentIds
      });
      setShowBulkModal(false);
      setBulkForm({ academicYearId: null });
      setSelectedClassName('');
      setSelectedYearId('');
      setCandidates([]);
      setSelectedStudentIds([]);
      load();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Error performing bulk transfer');
    } finally {
      setSaving(false);
    }
  };

  const [openFolder, setOpenFolder] = useState(null);

  const filtered = alumni.filter(a =>
    (a.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    a.admissionNumber?.toLowerCase().includes(search.toLowerCase()) ||
    a.rollNumber?.toLowerCase().includes(search.toLowerCase()))
  );

  const groupedAlumni = filtered.reduce((acc, al) => {
    const clsName = al.className || 'Unassigned';
    if (!acc[clsName]) acc[clsName] = [];
    acc[clsName].push(al);
    return acc;
  }, {});

  return (
    <div>
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
        <div style={{ position: 'absolute', top: '-100px', right: '-50px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(var(--primary-rgb, var(--primary-rgb)), 0.15) 0%, rgba(var(--primary-rgb, var(--primary-rgb)), 0) 70%)' }}></div>
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.2, margin: '0 0 8px 0' }}>
              Alumni <span style={{ color: 'var(--primary-light)', textShadow: '0 0 15px var(--primary)' }}>Directory</span>
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>{alumni.length} alumni records</p>
          </div>
          
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="btn" style={{ background: 'var(--primary)', color: 'white', border: 'none', boxShadow: '0 0 15px var(--primary)', fontWeight: 700 }} onClick={() => {setBulkForm({ academicYearId: null }); setSelectedClassName(''); setSelectedYearId(''); setCandidates([]); setSelectedStudentIds([]); setError(''); setShowBulkModal(true);}}>
              <FiUserPlus /> Bulk Add Alumni
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {openFolder && (
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => setOpenFolder(null)}
                style={{ fontWeight: 'bold' }}
              >
                &larr; Back to Folders
              </button>
            )}
            <div style={{ position: 'relative', width: 280 }}>
              <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="sms-input"
                style={{ paddingLeft: 36 }}
                placeholder="Search alumni..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          {openFolder && (
            <h3 style={{ margin: 0, color: 'var(--primary-dark)' }}>{openFolder}</h3>
          )}
        </div>
        
        <div className="table-responsive" style={{ padding: openFolder ? '0' : '20px' }}>
          {loading ? (
            <div className="text-center" style={{ padding: '40px' }}>Loading...</div>
          ) : !openFolder ? (
            // FOLDER VIEW
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              {Object.keys(groupedAlumni).length === 0 ? (
                <div className="text-center text-muted" style={{ width: '100%', padding: '40px' }}>No alumni found.</div>
              ) : (
                Object.keys(groupedAlumni).sort().map(clsName => (
                  <div 
                    key={clsName}
                    onClick={() => setOpenFolder(clsName)}
                    style={{
                      width: '200px',
                      padding: '24px',
                      background: 'var(--bg-secondary, #f8f9fa)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                  >
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '12px' }}>
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-color)' }}>{clsName}</h3>
                      <button 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 6px', background: 'transparent', border: 'none', color: 'var(--primary)' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setFolderToRename(clsName);
                          setNewFolderName(clsName);
                          setShowRenameModal(true);
                        }}
                        title="Rename Folder"
                      >
                        <FiEdit size={14} />
                      </button>
                    </div>
                    <span className="badge badge-info">{groupedAlumni[clsName].length} Students</span>
                  </div>
                ))
              )}
            </div>
          ) : (
            // LIST VIEW FOR SELECTED FOLDER
            <table className="sms-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Admission No</th>
                  <th>Roll No</th>
                  <th>Passing Year</th>
                  <th>Contact</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupedAlumni[openFolder]?.length === 0 ? (
                  <tr><td colSpan="6" className="text-center text-muted">No alumni found.</td></tr>
                ) : (
                  groupedAlumni[openFolder]?.map(al => (
                    <tr key={al.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{al.fullName}</div>
                        <div className="text-xs text-muted">DOB: {al.dateOfBirth}</div>
                      </td>
                      <td><span className="badge badge-secondary">{al.admissionNumber}</span></td>
                      <td>{al.rollNumber}</td>
                      <td><span className="badge badge-primary">{al.passingYear}</span></td>
                      <td>
                        <div className="text-sm">{al.phone}</div>
                        <div className="text-xs text-muted">{al.email}</div>
                      </td>
                      <td className="text-right">
                        <div className="flex-center" style={{ gap: 8, justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => { setViewAlumni(al); setShowViewModal(true); }} title="View"><FiEye /></button>
                          <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(al)} title="Edit"><FiEdit /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(al.id)} title="Delete"><FiTrash2 /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <Modal title={form.id ? "Edit Alumni" : "Add Alumni"} onClose={() => setShowModal(false)}>
          {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Full Name *</label>
              <input required className="sms-input" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Admission Number *</label>
              <input required className="sms-input" value={form.admissionNumber} onChange={e => setForm({...form, admissionNumber: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Roll Number</label>
              <input className="sms-input" value={form.rollNumber} onChange={e => setForm({...form, rollNumber: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Passing Year *</label>
              <input type="number" required className="sms-input" value={form.passingYear} onChange={e => setForm({...form, passingYear: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input type="date" className="sms-input" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="sms-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="sms-input" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Address</label>
              <textarea className="sms-input" value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows="2" />
            </div>
            
            <div className="sms-modal-footer flex-end" style={{ gridColumn: '1 / -1', marginTop: 16 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Alumni'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showBulkModal && (
        <Modal title="Bulk Transfer to Alumni" onClose={() => setShowBulkModal(false)}>
          {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}
          <form onSubmit={handleBulkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group" style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label className="form-label">Class Name *</label>
                <select
                  className="sms-input"
                  value={selectedClassName}
                  onChange={e => {
                    const clsName = e.target.value;
                    setSelectedClassName(clsName);
                    const selectedClassObj = classes.find(c => c.className === clsName);
                    if (selectedClassObj && selectedClassObj.academicYear) {
                      setSelectedYearId(selectedClassObj.academicYear.id);
                    }
                  }}
                  autoFocus
                  required
                >
                  <option value="">-- Select Class --</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.className}>{c.className}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Assign Academic Year *</label>
                <select
                  className="sms-input"
                  value={selectedYearId}
                  onChange={e => setSelectedYearId(e.target.value)}
                  required
                >
                  <option value="">-- Select Year --</option>
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>
              </div>
            </div>
            {candidatesLoading ? (
              <div className="text-center">Loading students...</div>

            ) : candidates.length > 0 ? (() => {
              // Group by section (className)
              const sections = {};
              candidates.forEach(c => {
                const sec = c.className || 'Unknown';
                if (!sections[sec]) sections[sec] = [];
                sections[sec].push(c);
              });
              const sectionNames = Object.keys(sections).sort();

              return (
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 8, padding: 16, maxHeight: 340, overflowY: 'auto' }}>
                  {/* Select All across all sections */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border-color)' }}>
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.length === candidates.length && candidates.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudentIds(candidates.map(c => c.studentId));
                        } else {
                          setSelectedStudentIds([]);
                        }
                      }}
                    />
                    <span style={{ fontWeight: 700 }}>Select All Sections ({candidates.length} Students)</span>
                  </div>

                  {sectionNames.map(secName => {
                    const secStudents = sections[secName];
                    const secIds = secStudents.map(c => c.studentId);
                    const allSecSelected = secIds.every(id => selectedStudentIds.includes(id));
                    const someSecSelected = secIds.some(id => selectedStudentIds.includes(id));

                    return (
                      <div key={secName} style={{ marginBottom: 16 }}>
                        {/* Section header */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, background: 'var(--bg-secondary, #f9fafb)', borderRadius: 6, padding: '6px 10px' }}>
                          <input
                            type="checkbox"
                            checked={allSecSelected}
                            ref={el => { if (el) el.indeterminate = someSecSelected && !allSecSelected; }}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudentIds(prev => [...new Set([...prev, ...secIds])]);
                              } else {
                                setSelectedStudentIds(prev => prev.filter(id => !secIds.includes(id)));
                              }
                            }}
                          />
                          <span style={{ fontWeight: 700, fontSize: '13px' }}>
                            <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: 4, padding: '2px 8px', marginRight: 8, fontSize: '12px' }}>
                              {secName}
                            </span>
                            {secStudents.length} student{secStudents.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* Students in section */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingLeft: 8 }}>
                          {secStudents.map(c => (
                            <label key={c.studentId} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '5px 8px', borderRadius: 6, transition: 'background 0.15s' }}
                              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary, #f9fafb)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.includes(c.studentId)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedStudentIds(prev => [...prev, c.studentId]);
                                  } else {
                                    setSelectedStudentIds(prev => prev.filter(id => id !== c.studentId));
                                  }
                                }}
                              />
                              <div>
                                <div style={{ fontWeight: 500 }}>{c.fullName}</div>
                                <div className="text-xs text-muted">
                                  Adm No: {c.admissionNumber}
                                  {c.rollNumber && ` | Roll: ${c.rollNumber}`}
                                  {c.academicYear && ` | Year: ${c.academicYear}`}
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })() : (selectedClassName && !candidatesLoading) ? (
              <div className="text-center text-muted">
                No eligible students found for the selected class (they may not be enrolled in the active year or are already alumni).
              </div>
            ) : (!selectedClassName || !selectedYearId) && !candidatesLoading ? (
              <div className="text-center text-muted" style={{ padding: '12px 0' }}>
                Select both a <strong>Class Name</strong> and an <strong>Academic Year</strong> above to see students.
              </div>
            ) : null}

            
            <div className="sms-modal-footer flex-end" style={{ marginTop: 16 }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowBulkModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving || selectedStudentIds.length === 0}>
                {saving ? 'Transferring...' : `Transfer ${selectedStudentIds.length} Students`}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {showRenameModal && (
        <Modal title="Rename Folder" onClose={() => setShowRenameModal(false)}>
          {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}
          <form onSubmit={handleRenameFolder}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Folder Name</label>
              <input 
                required 
                autoFocus
                className="sms-input" 
                value={newFolderName} 
                onChange={e => setNewFolderName(e.target.value)} 
              />
            </div>
            <div className="sms-modal-footer flex-end">
              <button type="button" className="btn btn-secondary" onClick={() => setShowRenameModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving || !newFolderName.trim()}>
                {saving ? 'Renaming...' : 'Rename'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showViewModal && viewAlumni && (
        <Modal title="Alumni Details" onClose={() => setShowViewModal(false)}>
          <div style={{ display: 'grid', gap: 16, gridTemplateColumns: '1fr 1fr' }}>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label text-muted" style={{ fontSize: '12px' }}>Full Name</label>
              <div style={{ fontWeight: 600 }}>{viewAlumni.fullName}</div>
            </div>
            <div className="form-group">
              <label className="form-label text-muted" style={{ fontSize: '12px' }}>Admission Number</label>
              <div>{viewAlumni.admissionNumber}</div>
            </div>
            <div className="form-group">
              <label className="form-label text-muted" style={{ fontSize: '12px' }}>Roll Number</label>
              <div>{viewAlumni.rollNumber || '-'}</div>
            </div>
            <div className="form-group">
              <label className="form-label text-muted" style={{ fontSize: '12px' }}>Passing Year</label>
              <div>{viewAlumni.passingYear}</div>
            </div>
            <div className="form-group">
              <label className="form-label text-muted" style={{ fontSize: '12px' }}>Date of Birth</label>
              <div>{viewAlumni.dateOfBirth || '-'}</div>
            </div>
            <div className="form-group">
              <label className="form-label text-muted" style={{ fontSize: '12px' }}>Phone</label>
              <div>{viewAlumni.phone || '-'}</div>
            </div>
            <div className="form-group">
              <label className="form-label text-muted" style={{ fontSize: '12px' }}>Email</label>
              <div>{viewAlumni.email || '-'}</div>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label text-muted" style={{ fontSize: '12px' }}>Address</label>
              <div>{viewAlumni.address || '-'}</div>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label text-muted" style={{ fontSize: '12px' }}>Folder / Class Name</label>
              <div>{viewAlumni.className || 'Unassigned'}</div>
            </div>
          </div>
          <div className="sms-modal-footer flex-end" style={{ marginTop: 24 }}>
            <button className="btn btn-primary" onClick={() => setShowViewModal(false)}>Close</button>
          </div>
        </Modal>
      )}

    </div>
  );
}

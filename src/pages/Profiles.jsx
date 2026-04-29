import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';

const INPUT_STYLE = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  background: 'var(--bg-secondary)',
  color: 'var(--text-primary)',
  fontSize: '0.8rem',
  outline: 'none',
  width: '100%',
};

const BTN = {
  padding: '8px 16px',
  borderRadius: '8px',
  border: 'none',
  fontSize: '0.8rem',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

export default function Profiles() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  const [filters, setFilters] = useState({
    gender: '', age_group: '', country_id: '', min_age: '', max_age: '',
  });
  const [searchQ, setSearchQ] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeout = useRef(null);

  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Create profile modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', gender: '', age: '', country_id: '' });
  const [creating, setCreating] = useState(false);

  const fetchProfiles = useCallback(async (pg = page, flt = filters) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page: pg,
        limit: LIMIT,
        ...(flt.gender && { gender: flt.gender }),
        ...(flt.age_group && { age_group: flt.age_group }),
        ...(flt.country_id && { country_id: flt.country_id }),
        ...(flt.min_age && { min_age: flt.min_age }),
        ...(flt.max_age && { max_age: flt.max_age }),
      };
      const res = await api.get('/api/profiles', { params });
      const d = res.data;
      setProfiles(d.data || d.profiles || []);
      setTotal(d.total || 0);
      setTotalPages(Math.ceil((d.total || 0) / LIMIT) || 1);
    } catch (err) {
      setError('Failed to load profiles. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    if (!isSearching) {
      fetchProfiles(page, filters);
    }
  }, [page]);

  const handleSearch = (q) => {
    setSearchQ(q);
    clearTimeout(searchTimeout.current);
    if (!q.trim()) {
      setIsSearching(false);
      fetchProfiles(1, filters);
      setPage(1);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      setIsSearching(true);
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/api/profiles/search', { params: { q } });
        const d = res.data;
        setProfiles(d.data || d.profiles || d.results || []);
        setTotal(d.total || 0);
        setTotalPages(1);
        setPage(1);
      } catch (err) {
        setError('Search failed.');
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const applyFilters = () => {
    setIsSearching(false);
    setPage(1);
    fetchProfiles(1, filters);
  };

  const clearFilters = () => {
    const empty = { gender: '', age_group: '', country_id: '', min_age: '', max_age: '' };
    setFilters(empty);
    setSearchQ('');
    setIsSearching(false);
    setPage(1);
    fetchProfiles(1, empty);
  };

  const handleExport = async () => {
    try {
      const res = await api.get('/api/profiles/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `profiles_export_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await api.delete(`/api/profiles/${id}`);
      setDeleteId(null);
      fetchProfiles(page, filters);
    } catch (err) {
      alert('Delete failed. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/api/profiles', {
        ...createForm,
        age: createForm.age ? parseInt(createForm.age) : undefined,
      });
      setShowCreate(false);
      setCreateForm({ name: '', gender: '', age: '', country_id: '' });
      fetchProfiles(1, filters);
      setPage(1);
    } catch (err) {
      alert('Create failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setCreating(false);
    }
  };

  const genderColor = (g) => {
    if (g === 'male') return { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' };
    if (g === 'female') return { color: '#f472b6', bg: 'rgba(244,114,182,0.12)' };
    return { color: 'var(--text-muted)', bg: 'transparent' };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>Profiles</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '4px 0 0' }}>
              {total.toLocaleString()} profiles total
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {isAdmin && (
              <button
                id="create-profile-btn"
                onClick={() => setShowCreate(true)}
                style={{ ...BTN, background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', color: '#fff' }}
              >
                + Create Profile
              </button>
            )}
            <button
              id="export-btn"
              onClick={handleExport}
              style={{ ...BTN, background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            >
              ⬇ Export CSV
            </button>
          </div>
        </div>

        {/* Search + Filter Bar */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '1.25rem',
          marginBottom: '1.25rem',
        }}>
          {/* Search */}
          <div style={{ marginBottom: '1rem' }}>
            <input
              id="search-input"
              type="text"
              placeholder="🔍 Search profiles by name, country, age group..."
              value={searchQ}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ ...INPUT_STYLE, maxWidth: '480px' }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gender</label>
              <select value={filters.gender} onChange={(e) => handleFilterChange('gender', e.target.value)} style={INPUT_STYLE}>
                <option value="">All</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Age Group</label>
              <input type="text" placeholder="e.g. 18-25" value={filters.age_group} onChange={(e) => handleFilterChange('age_group', e.target.value)} style={INPUT_STYLE} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Country ID</label>
              <input type="text" placeholder="e.g. NG" value={filters.country_id} onChange={(e) => handleFilterChange('country_id', e.target.value)} style={INPUT_STYLE} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Min Age</label>
              <input type="number" placeholder="18" value={filters.min_age} onChange={(e) => handleFilterChange('min_age', e.target.value)} style={INPUT_STYLE} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Max Age</label>
              <input type="number" placeholder="65" value={filters.max_age} onChange={(e) => handleFilterChange('max_age', e.target.value)} style={INPUT_STYLE} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={applyFilters} style={{ ...BTN, flex: 1, background: 'var(--accent)', color: '#fff' }}>Apply</button>
              <button onClick={clearFilters} style={{ ...BTN, flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>Clear</button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', padding: '12px 16px', color: '#fca5a5',
            fontSize: '0.875rem', marginBottom: '1rem',
          }}>{error}</div>
        )}

        {/* Table */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem', gap: '1rem', color: 'var(--text-muted)' }}>
              <div style={{ width: '20px', height: '20px', border: '2px solid var(--border)', borderTop: '2px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Loading profiles…
            </div>
          ) : profiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
              No profiles found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                    {['Name', 'Gender', 'Age', 'Age Group', 'Country', 'Actions'].map((h) => (
                      <th key={h} style={{
                        padding: '12px 16px', textAlign: 'left',
                        fontSize: '0.72rem', fontWeight: '600', color: 'var(--text-muted)',
                        textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {profiles.map((p, i) => {
                    const gc = genderColor(p.gender);
                    return (
                      <tr
                        key={p.id || p._id || i}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          transition: 'background 0.15s',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '13px 16px', fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                          {p.name || '—'}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <span style={{
                            padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                            color: gc.color, background: gc.bg, textTransform: 'capitalize',
                          }}>{p.gender || '—'}</span>
                        </td>
                        <td style={{ padding: '13px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{p.age ?? '—'}</td>
                        <td style={{ padding: '13px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{p.age_group || '—'}</td>
                        <td style={{ padding: '13px 16px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                          {p.country_name || p.country_id || '—'}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => navigate(`/profiles/${p.id || p._id}`)}
                              style={{ ...BTN, padding: '5px 12px', background: 'rgba(99,102,241,0.15)', color: 'var(--accent)', border: '1px solid rgba(99,102,241,0.3)' }}
                            >
                              View
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => setDeleteId(p.id || p._id)}
                                style={{ ...BTN, padding: '5px 12px', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && profiles.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1rem 1.5rem', borderTop: '1px solid var(--border)',
              flexWrap: 'wrap', gap: '0.75rem',
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Page {page} of {totalPages} · {total.toLocaleString()} total
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  style={{
                    ...BTN,
                    padding: '6px 14px',
                    background: page <= 1 ? 'var(--bg-secondary)' : 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: page <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: page <= 1 ? 'not-allowed' : 'pointer',
                  }}
                >← Prev</button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  style={{
                    ...BTN,
                    padding: '6px 14px',
                    background: page >= totalPages ? 'var(--bg-secondary)' : 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: page >= totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                    cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                  }}
                >Next →</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '400px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🗑️</div>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: '700', margin: '0 0 0.5rem' }}>Delete Profile?</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 1.5rem' }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={() => setDeleteId(null)}
                style={{ ...BTN, padding: '10px 24px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >Cancel</button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={deleting}
                style={{ ...BTN, padding: '10px 24px', background: '#ef4444', color: '#fff', opacity: deleting ? 0.7 : 1 }}
              >{deleting ? 'Deleting…' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Profile Modal */}
      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '440px',
          }}>
            <h3 style={{ color: 'var(--text-primary)', fontWeight: '700', margin: '0 0 1.5rem' }}>Create Profile</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { key: 'name', label: 'Full Name', placeholder: 'John Doe', type: 'text' },
                { key: 'gender', label: 'Gender', placeholder: 'male / female', type: 'text' },
                { key: 'age', label: 'Age', placeholder: '25', type: 'number' },
                { key: 'country_id', label: 'Country ID', placeholder: 'NG', type: 'text' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key}>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={createForm[key]}
                    onChange={(e) => setCreateForm((f) => ({ ...f, [key]: e.target.value }))}
                    style={{ ...INPUT_STYLE }}
                  />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  style={{ ...BTN, flex: 1, padding: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                >Cancel</button>
                <button
                  type="submit"
                  disabled={creating}
                  style={{ ...BTN, flex: 1, padding: '10px', background: 'linear-gradient(135deg, var(--accent), #8b5cf6)', color: '#fff', opacity: creating ? 0.7 : 1 }}
                >{creating ? 'Creating…' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

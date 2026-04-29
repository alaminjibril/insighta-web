import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function StatCard({ label, value, icon, color }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${color}22`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{
        position: 'absolute', top: 0, right: 0,
        width: '80px', height: '80px',
        background: `radial-gradient(circle at top right, ${color}22, transparent 70%)`,
      }} />
      <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1 }}>
        {value !== null ? value.toLocaleString() : <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>—</span>}
      </div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: null,
    countries: null,
    male: null,
    female: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user info if not already available
        if (!user) {
          const meRes = await api.get('/auth/me');
          updateUser(meRes.data);
        }

        // Parallel fetch of stats
        const [totalRes, maleRes, femaleRes] = await Promise.all([
          api.get('/api/profiles?limit=1'),
          api.get('/api/profiles?gender=male&limit=1'),
          api.get('/api/profiles?gender=female&limit=1'),
        ]);

        const totalData = totalRes.data;
        const maleData = maleRes.data;
        const femaleData = femaleRes.data;

        // Count unique countries
        const countriesRes = await api.get('/api/profiles?limit=1000');
        const profiles = countriesRes.data.data || countriesRes.data.profiles || [];
        const uniqueCountries = new Set(profiles.map((p) => p.country_id).filter(Boolean)).size;

        setStats({
          total: totalData.total ?? totalData.count ?? null,
          countries: uniqueCountries,
          male: maleData.total ?? maleData.count ?? null,
          female: femaleData.total ?? femaleData.count ?? null,
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const roleColor = user?.role === 'admin' ? '#10b981' : '#6366f1';
  const roleBg = user?.role === 'admin' ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        {/* Welcome Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99,102,241,0.08) 100%)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
        }}>
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user.username}
              style={{
                width: '72px', height: '72px', borderRadius: '50%',
                border: '3px solid var(--accent)',
                boxShadow: '0 0 0 4px var(--accent-glow)',
              }}
            />
          ) : (
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', color: '#fff',
            }}>
              {user?.username?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0 0 0.3rem', color: 'var(--text-primary)' }}>
              Welcome back, <span style={{ color: 'var(--accent)' }}>{user?.username || 'User'}</span> 👋
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{
                padding: '3px 12px', borderRadius: '20px', fontSize: '0.78rem',
                fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em',
                background: roleBg, color: roleColor, border: `1px solid ${roleColor}44`,
              }}>
                {user?.role || 'analyst'}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/profiles')}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
              color: '#fff',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'opacity 0.2s, transform 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            View Profiles →
          </button>
        </div>

        {/* Stat Cards */}
        <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
          Overview
        </h2>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
            <div style={{ width: '20px', height: '20px', border: '2px solid var(--border)', borderTop: '2px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading statistics…
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            <StatCard label="Total Profiles" value={stats.total} icon="👥" color="#6366f1" />
            <StatCard label="Total Countries" value={stats.countries} icon="🌍" color="#10b981" />
            <StatCard label="Male Profiles" value={stats.male} icon="👨" color="#3b82f6" />
            <StatCard label="Female Profiles" value={stats.female} icon="👩" color="#ec4899" />
          </div>
        )}

        {/* Quick actions */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '1.5rem',
        }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 1rem' }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/profiles')}
              style={{
                padding: '10px 20px', borderRadius: '10px', border: '1px solid var(--border)',
                background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            >
              📋 Browse Profiles
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

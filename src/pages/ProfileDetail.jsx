import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Navbar from '../components/Navbar';

function Field({ label, value }) {
  return (
    <div style={{
      padding: '1rem',
      background: 'var(--bg-secondary)',
      borderRadius: '10px',
      border: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: '500' }}>
        {value !== null && value !== undefined && value !== '' ? String(value) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
      </div>
    </div>
  );
}

export default function ProfileDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/api/profiles/${id}`)
      .then((res) => {
        setProfile(res.data.data || res.data);
      })
      .catch((err) => {
        setError('Failed to load profile. It may not exist.');
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const genderColor = profile?.gender === 'male' ? '#60a5fa' : profile?.gender === 'female' ? '#f472b6' : 'var(--text-muted)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Back button */}
        <button
          onClick={() => navigate('/profiles')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            fontSize: '0.875rem', fontWeight: '500',
            cursor: 'pointer', marginBottom: '1.5rem',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          ← Back to Profiles
        </button>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6rem', gap: '1rem', color: 'var(--text-muted)' }}>
            <div style={{ width: '24px', height: '24px', border: '2px solid var(--border)', borderTop: '2px solid var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading profile…
          </div>
        ) : error ? (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '12px', padding: '2rem', color: '#fca5a5', textAlign: 'center',
          }}>{error}</div>
        ) : profile && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            overflow: 'hidden',
          }}>
            {/* Profile Header */}
            <div style={{
              padding: '2rem',
              background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.06) 100%)',
              borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '1.5rem',
            }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', color: '#fff', fontWeight: '700', flexShrink: 0,
              }}>
                {(profile.name || '?')[0].toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 0.4rem' }}>
                  {profile.name || 'Unknown'}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {profile.gender && (
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                      color: genderColor, background: `${genderColor}22`, textTransform: 'capitalize',
                    }}>{profile.gender}</span>
                  )}
                  {profile.age && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Age {profile.age}</span>
                  )}
                  {profile.country_name && (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>· {profile.country_name}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Profile Fields Grid */}
            <div style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', marginTop: 0 }}>
                Profile Details
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                <Field label="Name" value={profile.name} />
                <Field label="Gender" value={profile.gender} />
                <Field label="Age" value={profile.age} />
                <Field label="Age Group" value={profile.age_group} />
                <Field label="Country" value={profile.country_name || profile.country_id} />
                <Field label="Country ID" value={profile.country_id} />
                {profile.id && <Field label="Profile ID" value={profile.id} />}
                {profile.created_at && <Field label="Created" value={new Date(profile.created_at).toLocaleDateString()} />}
                {profile.updated_at && <Field label="Updated" value={new Date(profile.updated_at).toLocaleDateString()} />}
                {/* Render any extra fields dynamically */}
                {Object.entries(profile)
                  .filter(([k]) => !['id', '_id', 'name', 'gender', 'age', 'age_group', 'country_id', 'country_name', 'created_at', 'updated_at'].includes(k))
                  .map(([k, v]) => (
                    <Field key={k} label={k.replace(/_/g, ' ')} value={typeof v === 'object' ? JSON.stringify(v) : v} />
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

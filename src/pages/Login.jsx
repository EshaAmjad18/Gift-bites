
// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import authHelper from '../utils/authHelper';

function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
    setError('');
  };

  const handleRoleChange = (role) => {
    setLoginData({ ...loginData, role });
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!loginData.email || !loginData.password) {
        throw new Error('Please enter both email and password');
      }

      let endpoint = '';
      let redirectPath = '';

      switch (loginData.role) {
        case 'user':
          endpoint = '/user/auth/login';
          redirectPath = '/user/home';
          break;
        case 'staff':
          endpoint = '/staff/auth/login';
          redirectPath = '/staff/dashboard';
          break;
        case 'admin':
          endpoint = '/admin/auth/login';
          redirectPath = '/admin/dashboard';
          break;
        default:
          throw new Error('Invalid role selected');
      }

      const response = await axios.post(`/api${endpoint}`, {
        email: loginData.email,
        password: loginData.password
      });

      if (response.data.success && response.data.token) {
        authHelper.setAuthData(
          loginData.role,
          response.data.token,
          response.data.user || response.data.staff || response.data.admin
        );
        navigate(redirectPath);
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials — unchanged
  const demoCredentials = {
    user: { email: '231370057@gift.edu.pk', password: '231370057' },
    staff: { email: 'basement_staff@gmail.com', password: 'Basement@123' },
    admin: { email: 'admin@gmail.com', password: 'Admin@123' },
  };

  const fillDemoCredentials = (role) => {
    setLoginData({ ...demoCredentials[role], role });
    setError('');
  };

  const roleConfig = {
    user:  { label: 'Student',  icon: '🎓', accent: '#38bdf8', bg: 'rgba(56,189,248,0.12)',  border: 'rgba(56,189,248,0.4)'  },
    staff: { label: 'Staff',    icon: '👨‍🍳', accent: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.4)'  },
    admin: { label: 'Admin',    icon: '🛡️', accent: '#f97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.4)'  },
  };

  const active = roleConfig[loginData.role];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .gb-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #090c10;
          font-family: 'DM Sans', sans-serif;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        /* Animated background blobs */
        .gb-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.18;
          animation: blobFloat 8s ease-in-out infinite;
        }
        .gb-blob-1 {
          width: 500px; height: 500px;
          background: #38bdf8;
          top: -150px; left: -150px;
          animation-delay: 0s;
        }
        .gb-blob-2 {
          width: 400px; height: 400px;
          background: #f97316;
          bottom: -100px; right: -100px;
          animation-delay: -4s;
        }
        .gb-blob-3 {
          width: 300px; height: 300px;
          background: #34d399;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          animation-delay: -2s;
          opacity: 0.08;
        }

        /* Subtle grid overlay */
        .gb-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        @keyframes blobFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -20px) scale(1.05); }
          66% { transform: translate(-15px, 15px) scale(0.95); }
        }

        /* Card */
        .gb-card {
          position: relative;
          z-index: 10;
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 44px 40px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06);
          opacity: 0;
          transform: translateY(24px);
          animation: cardIn 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s forwards;
        }

        @keyframes cardIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Header */
        .gb-header { text-align: center; margin-bottom: 36px; }

        .gb-logo-ring {
          width: 64px; height: 64px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 18px;
          display: flex; align-items: center; justify-content: center;
          font-size: 28px;
          margin: 0 auto 16px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }

        .gb-title {
          font-family: 'Syne', sans-serif;
          font-size: 28px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.5px;
          line-height: 1.1;
        }

        .gb-title span {
          background: linear-gradient(90deg, #38bdf8, #818cf8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .gb-subtitle {
          margin-top: 6px;
          font-size: 13px;
          color: rgba(255,255,255,0.35);
          font-weight: 400;
          letter-spacing: 0.3px;
        }

        /* Divider */
        .gb-divider {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 20px;
        }
        .gb-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .gb-divider-text { font-size: 11px; color: rgba(255,255,255,0.25); text-transform: uppercase; letter-spacing: 1px; }

        /* Role Selector */
        .gb-roles {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 28px;
        }

        .gb-role-btn {
          padding: 10px 8px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.45);
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex; flex-direction: column;
          align-items: center; gap: 4px;
        }

        .gb-role-btn:hover {
          background: rgba(255,255,255,0.07);
          color: rgba(255,255,255,0.7);
        }

        .gb-role-btn.active-user  { background: rgba(56,189,248,0.12);  border-color: rgba(56,189,248,0.45);  color: #38bdf8; }
        .gb-role-btn.active-staff { background: rgba(52,211,153,0.12);  border-color: rgba(52,211,153,0.45);  color: #34d399; }
        .gb-role-btn.active-admin { background: rgba(249,115,22,0.12);  border-color: rgba(249,115,22,0.45);  color: #f97316; }

        .gb-role-icon { font-size: 18px; }

        /* Form */
        .gb-form { display: flex; flex-direction: column; gap: 16px; }

        .gb-field { display: flex; flex-direction: column; gap: 6px; }

        .gb-label {
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .gb-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 14px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          color: #fff;
          outline: none;
          transition: all 0.2s ease;
          width: 100%;
        }

        .gb-input::placeholder { color: rgba(255,255,255,0.2); }

        .gb-input:focus {
          border-color: var(--accent);
          background: rgba(255,255,255,0.07);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }

        .gb-input:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Submit Button */
        .gb-submit {
          margin-top: 4px;
          padding: 15px;
          border: none;
          border-radius: 12px;
          background: var(--accent-gradient);
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          letter-spacing: 0.3px;
          transition: all 0.25s ease;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          position: relative;
          overflow: hidden;
        }

        .gb-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.2s;
        }

        .gb-submit:hover::before { background: rgba(255,255,255,0.08); }
        .gb-submit:active { transform: scale(0.98); }
        .gb-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        /* Spinner */
        .gb-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Error */
        .gb-error {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.25);
          border-radius: 10px;
          padding: 12px 14px;
          color: #fca5a5;
          font-size: 13px;
          display: flex; align-items: center; gap: 8px;
        }

        /* Demo Section */
        .gb-demo {
          margin-top: 24px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 16px;
        }

        .gb-demo-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.25);
          text-align: center;
          margin-bottom: 12px;
        }

        .gb-demo-btns {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .gb-demo-btn {
          padding: 9px 6px;
          border-radius: 10px;
          border: 1px solid;
          background: transparent;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex; flex-direction: column;
          align-items: center; gap: 3px;
        }

        .gb-demo-btn-user  { border-color: rgba(56,189,248,0.3);  color: #38bdf8; }
        .gb-demo-btn-staff { border-color: rgba(52,211,153,0.3);  color: #34d399; }
        .gb-demo-btn-admin { border-color: rgba(249,115,22,0.3);  color: #f97316; }

        .gb-demo-btn-user:hover  { background: rgba(56,189,248,0.08); }
        .gb-demo-btn-staff:hover { background: rgba(52,211,153,0.08); }
        .gb-demo-btn-admin:hover { background: rgba(249,115,22,0.08); }

        .gb-demo-btn-icon { font-size: 16px; }

        /* Footer */
        .gb-footer {
          text-align: center;
          margin-top: 20px;
          font-size: 12px;
          color: rgba(255,255,255,0.15);
        }
      `}</style>

      <div className="gb-root">
        {/* Background */}
        <div className="gb-blob gb-blob-1" />
        <div className="gb-blob gb-blob-2" />
        <div className="gb-blob gb-blob-3" />
        <div className="gb-grid" />

        {/* Card */}
        <div className="gb-card" style={{
          '--accent': active.accent,
          '--accent-glow': active.bg,
          '--accent-gradient': loginData.role === 'user'
            ? 'linear-gradient(135deg, #0ea5e9, #2563eb)'
            : loginData.role === 'staff'
            ? 'linear-gradient(135deg, #10b981, #059669)'
            : 'linear-gradient(135deg, #f97316, #dc2626)',
        }}>

          {/* Header */}
          <div className="gb-header">
            <div className="gb-logo-ring">🍔</div>
            <div className="gb-title">GIFT <span>Bites</span></div>
            <div className="gb-subtitle">GIFT University · Cafeteria Portal</div>
          </div>

          {/* Role Selector */}
          <div className="gb-divider">
            <div className="gb-divider-line" />
            <div className="gb-divider-text">Select Role</div>
            <div className="gb-divider-line" />
          </div>

          <div className="gb-roles">
            {[
              { key: 'user',  icon: '🎓', label: 'Student'  },
              { key: 'staff', icon: '👨‍🍳', label: 'Staff'    },
              { key: 'admin', icon: '🛡️', label: 'Admin'    },
            ].map(({ key, icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleRoleChange(key)}
                className={`gb-role-btn${loginData.role === key ? ` active-${key}` : ''}`}
              >
                <span className="gb-role-icon">{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="gb-form">
            <div className="gb-field">
              <label className="gb-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={loginData.email}
                onChange={handleInputChange}
                placeholder={`Enter ${loginData.role} email`}
                required
                className="gb-input"
                disabled={loading}
                style={{ '--accent': active.accent, '--accent-glow': active.bg }}
              />
            </div>

            <div className="gb-field">
              <label className="gb-label">Password</label>
              <input
                type="password"
                name="password"
                value={loginData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                className="gb-input"
                disabled={loading}
                style={{ '--accent': active.accent, '--accent-glow': active.bg }}
              />
            </div>

            <button
              type="submit"
              className="gb-submit"
              disabled={loading}
            >
              {loading ? (
                <><div className="gb-spinner" /> Signing in...</>
              ) : (
                `Sign in as ${roleConfig[loginData.role].label}`
              )}
            </button>

            {error && (
              <div className="gb-error">
                <span>⚠️</span> {error}
              </div>
            )}
          </form>

          {/* Demo Access */}
          <div className="gb-demo">
            <div className="gb-demo-label">✦ Demo Access — Click to explore</div>
            <div className="gb-demo-btns">
              {[
                { key: 'user',  icon: '🎓', label: 'Student'  },
                { key: 'staff', icon: '👨‍🍳', label: 'Staff'    },
                { key: 'admin', icon: '🛡️', label: 'Admin'    },
              ].map(({ key, icon, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => fillDemoCredentials(key)}
                  className={`gb-demo-btn gb-demo-btn-${key}`}
                >
                  <span className="gb-demo-btn-icon">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="gb-footer">GIFT University © 2025 · Internal Use Only</div>
        </div>
      </div>
    </>
  );
}

export default Login;

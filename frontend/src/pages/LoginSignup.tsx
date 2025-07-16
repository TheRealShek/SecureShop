import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Login/Signup Page: Allows users to log in or sign up with basic form validation.
 * If onLogin is provided, uses it for authentication and redirects on success.
 */
type LoginSignupProps = {
  onLogin?: (email: string, password: string) => { success: boolean; message?: string };
};

const LoginSignup: React.FC<LoginSignupProps> = ({ onLogin }) => {
  // Tab state: 'login' or 'signup'
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  // Error message state
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // If onLogin is provided, always force the tab to 'login'
  useEffect(() => {
    if (onLogin && tab !== 'login') {
      setTab('login');
    }
  }, [onLogin, tab]);

  // Email format validation
  const validateEmail = (email: string) => /.+@.+\..+/.test(email);

  // Handle login form submit
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Both fields are required.');
      return;
    }
    if (!validateEmail(loginEmail)) {
      setError('Invalid email format.');
      return;
    }
    if (onLogin) {
      const result = onLogin(loginEmail, loginPassword);
      if (result.success) {
        setError('');
        navigate('/'); // Redirect to Home on success
      } else {
        setError(result.message || 'Login failed.');
      }
    } else {
      setError('Login successful (mock)!');
    }
  };

  // Handle signup form submit (demo only)
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupEmail || !signupPassword || !signupName) {
      setError('All fields are required.');
      return;
    }
    if (!validateEmail(signupEmail)) {
      setError('Invalid email format.');
      return;
    }
    if (signupPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setError('Signup successful (mock)!');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-color)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 400,
        padding: '2.5rem 1.5rem',
        background: 'var(--card-bg)',
        color: 'var(--text-color)',
        borderRadius: 16,
        boxShadow: 'var(--card-shadow)',
        boxSizing: 'border-box',
      }}>
        {/* Tab buttons for switching between Login and Signup */}
        {(typeof onLogin === 'undefined') && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
            <button onClick={() => { setTab('login'); setError(''); }} style={{ flex: 1, padding: 12, background: tab === 'login' ? 'var(--primary)' : 'var(--input-bg)', color: tab === 'login' ? '#fff' : 'var(--text-color)', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 16, boxShadow: tab === 'login' ? '0 2px 8px var(--primary)' : 'none' }}>Login</button>
            <button onClick={() => { setTab('signup'); setError(''); }} style={{ flex: 1, padding: 12, background: tab === 'signup' ? 'var(--primary)' : 'var(--input-bg)', color: tab === 'signup' ? '#fff' : 'var(--text-color)', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 16, boxShadow: tab === 'signup' ? '0 2px 8px var(--primary)' : 'none' }}>Signup</button>
          </div>
        )}
        {/* Title */}
        <h2 style={{ textAlign: 'center', marginBottom: 24, fontWeight: 700, fontSize: 28, letterSpacing: 0.5 }}>Login Page</h2>
        {/* Show error message if present */}
        {error && <div style={{ color: '#e02d2d', marginBottom: 16, fontWeight: 500 }}>{error}</div>}
        {/* Login form */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} autoComplete="on">
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="login-email" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Email</label>
              <input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1.5px solid var(--input-border)',
                  borderRadius: 4,
                  fontSize: 16,
                  background: 'var(--input-bg)',
                  color: 'var(--text-color)',
                  outline: 'none',
                  marginBottom: 0,
                  boxSizing: 'border-box',
                  transition: 'border 0.2s',
                }}
                onFocus={e => (e.target.style.border = '1.5px solid var(--input-focus)')}
                onBlur={e => (e.target.style.border = '1.5px solid var(--input-border)')}
                autoComplete="email"
                required
              />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label htmlFor="login-password" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Password</label>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1.5px solid var(--input-border)',
                  borderRadius: 4,
                  fontSize: 16,
                  background: 'var(--input-bg)',
                  color: 'var(--text-color)',
                  outline: 'none',
                  marginBottom: 0,
                  boxSizing: 'border-box',
                  transition: 'border 0.2s',
                }}
                onFocus={e => (e.target.style.border = '1.5px solid var(--input-focus)')}
                onBlur={e => (e.target.style.border = '1.5px solid var(--input-border)')}
                autoComplete="current-password"
                required
              />
            </div>
            <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center' }}>
              <input
                id="show-password"
                type="checkbox"
                checked={showPassword}
                onChange={e => setShowPassword(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              <label htmlFor="show-password" style={{ fontSize: 15, color: 'var(--text-secondary)', cursor: 'pointer' }}>Show Password</label>
            </div>
            <button type="submit" style={{ width: '100%', padding: 12, background: 'var(--button-bg)', color: 'var(--button-text)', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 16 }}>Login</button>
          </form>
        ) : (
          // Signup form (demo only)
          <form onSubmit={handleSignup} autoComplete="on">
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="signup-name" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Name</label>
              <input
                id="signup-name"
                type="text"
                value={signupName}
                onChange={e => setSignupName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1.5px solid var(--input-border)',
                  borderRadius: 4,
                  fontSize: 16,
                  background: 'var(--input-bg)',
                  color: 'var(--text-color)',
                  outline: 'none',
                  marginBottom: 0,
                  boxSizing: 'border-box',
                  transition: 'border 0.2s',
                }}
                onFocus={e => (e.target.style.border = '1.5px solid var(--input-focus)')}
                onBlur={e => (e.target.style.border = '1.5px solid var(--input-border)')}
                autoComplete="name"
                required
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="signup-email" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Email</label>
              <input
                id="signup-email"
                type="email"
                value={signupEmail}
                onChange={e => setSignupEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1.5px solid var(--input-border)',
                  borderRadius: 4,
                  fontSize: 16,
                  background: 'var(--input-bg)',
                  color: 'var(--text-color)',
                  outline: 'none',
                  marginBottom: 0,
                  boxSizing: 'border-box',
                  transition: 'border 0.2s',
                }}
                onFocus={e => (e.target.style.border = '1.5px solid var(--input-focus)')}
                onBlur={e => (e.target.style.border = '1.5px solid var(--input-border)')}
                autoComplete="email"
                required
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label htmlFor="signup-password" style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Password</label>
              <input
                id="signup-password"
                type="password"
                value={signupPassword}
                onChange={e => setSignupPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1.5px solid var(--input-border)',
                  borderRadius: 4,
                  fontSize: 16,
                  background: 'var(--input-bg)',
                  color: 'var(--text-color)',
                  outline: 'none',
                  marginBottom: 0,
                  boxSizing: 'border-box',
                  transition: 'border 0.2s',
                }}
                onFocus={e => (e.target.style.border = '1.5px solid var(--input-focus)')}
                onBlur={e => (e.target.style.border = '1.5px solid var(--input-border)')}
                autoComplete="new-password"
                required
              />
            </div>
            <button type="submit" style={{ width: '100%', padding: 12, background: 'var(--button-bg)', color: 'var(--button-text)', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600, fontSize: 16 }}>Signup</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginSignup; 
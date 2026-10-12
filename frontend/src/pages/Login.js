import React, { useRef, useState } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

function Login({ onLogin }) {
  const demoLoginLock = useRef(false);
  const [demoLoginBusy, setDemoLoginBusy] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e, demoLoginCredentials) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email: (demoLoginCredentials?.email ?? email), password: (demoLoginCredentials?.password ?? password) });
      toast.success('Welcome to MineOps AI!');
      onLogin(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (event) => {
    event.preventDefault();
    if (demoLoginLock.current) return;

    const demoCredentials = {
      email: process.env.REACT_APP_DEMO_EMAIL || '',
      password: process.env.REACT_APP_DEMO_PASSWORD || '',
    };
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    if (!demoCredentials.email || !demoCredentials.password) {
      setError('Demo credentials are unavailable. Start the local demo with configured credentials.');
      return;
    }

    demoLoginLock.current = true;
    setDemoLoginBusy(true);
    try {
      await handleSubmit(event, demoCredentials);
    } finally {
      demoLoginLock.current = false;
      setDemoLoginBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <div className="icon">M</div>
          <h1>MineOps AI</h1>
          <p>Mining Operations Optimizer</p>
        </div>
        {error && <div className="login-error">{error}</div>}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <button
          type="button"
          disabled={loading || demoLoginBusy}
          className="auto-fill-btn"
          onClick={handleDemoLogin}
        >
          {demoLoginBusy ? 'Logging in…' : 'Log In as Demo'}
        </button>
      </div>
    </div>
  );
}

export default Login;

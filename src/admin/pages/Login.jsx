import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Eye, EyeOff, LogIn } from 'lucide-react';
import SEO from '../../components/SEO';
import useSettings from '../../hooks/useSettings';

// ------------------------------
// API Base URL from environment variable
// ------------------------------
const API_BASE_URL = import.meta.env.VITE_API_URL || '';
// If you use Create React App (CRA), uncomment the line below and comment the one above:
// const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const Login = () => {
  const navigate = useNavigate();
  const { business } = useSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter both email and password'); return; }
    setLoading(true);
    try {
      // ✅ Use environment variable
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminData', JSON.stringify(data.user));
        // Always go directly to the dashboard – no more security questions
        navigate('/admin/dashboard');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to connect to server. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <SEO title="Admin Login" description="DGW Autospa Admin Portal Login - Secure access for administrators" noIndex={true} />
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            {business.logo ? (
              <img src={business.logo} alt={business.businessName || 'DGW Autospa'} className="h-16 w-auto max-w-[200px] object-contain mx-auto mb-4" />
            ) : (
              <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-3 rounded-2xl inline-flex mb-4"><Car className="w-8 h-8 text-white" /></div>
            )}
            <h1 className="text-2xl font-bold text-white">{business.businessName || 'DGW Autospa'} Admin</h1>
            <p className="text-gray-300 text-sm mt-2">Sign in to manage your auto spa</p>
          </div>
          {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-200 text-sm font-medium mb-2">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all" placeholder="admin@yourbusiness.com" required autoComplete="username" />
            </div>
            <div>
              <label className="block text-gray-200 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent pr-12 transition-all" placeholder="Enter your password" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 rounded-xl text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><LogIn size={20} /> Sign In</>}
            </button>
          </form>
          <div className="text-center mt-6">
            <button onClick={() => navigate('/admin/forgot-password')} className="text-gray-400 text-sm hover:text-gray-200 transition-colors">Forgot password?</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
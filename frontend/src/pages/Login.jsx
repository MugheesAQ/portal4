import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [cnic, setCnic] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { cnic, password });
      if (res.data.success) {
        localStorage.setItem('citizen_token', res.data.data.token);
        localStorage.setItem('citizen_user', JSON.stringify(res.data.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-[#1A1A2E] flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-6 left-6 flex items-center space-x-3">
        <Logo className="w-10 h-10 text-[#0A1628]" />
        <span className="text-[#0A1628] font-bold text-xl">Citizen Portal</span>
      </div>
      
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-10 border border-gray-100">
        <h2 className="text-2xl font-bold text-[#0A1628] mb-2">Welcome Back</h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Citizen Login</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#0A1628] mb-1.5">CNIC NUMBER</label>
            <input required type="text" placeholder="e.g. 42101-1234567-1" 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0A1628] outline-none transition-all text-sm"
              value={cnic} onChange={e => setCnic(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0A1628] mb-1.5">PASSWORD</label>
            <input required type="password" placeholder="••••••••" 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0A1628] outline-none transition-all text-sm"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button disabled={loading} type="submit" 
            className="w-full bg-[#0A1628] text-white font-bold py-3.5 rounded-lg hover:bg-[#C9A84C] hover:text-[#0A1628] transition-colors mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <button 
            type="button" 
            onClick={async () => {
              setCnic('42101-1234567-1');
              setPassword('password');
              setLoading(true);
              try {
                const res = await api.post('/auth/login', { cnic: '42101-1234567-1', password: 'password' });
                if (res.data.success) {
                  localStorage.setItem('citizen_token', res.data.data.token);
                  localStorage.setItem('citizen_user', JSON.stringify(res.data.data.user));
                  navigate('/dashboard');
                }
              } catch (err) {
                toast.error(err.response?.data?.error || 'Login failed');
              } finally {
                setLoading(false);
              }
            }}
            className="w-full bg-gray-100 text-[#0A1628] font-bold py-3.5 rounded-lg hover:bg-[#C9A84C]/10 transition-colors mt-2"
          >
            Instant Demo Login
          </button>
        </form>
        <div className="mt-8 text-center text-sm border-t border-gray-100 pt-6">
          <Link to="/register" className="text-[#0A1628] hover:text-[#C9A84C] font-bold">New citizen? Register here</Link>
        </div>
        <div className="mt-4 text-center text-sm">
          <Link to="/officer/login" className="text-gray-400 hover:text-[#0A1628] font-medium">Officer Login</Link>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-[10px] text-gray-400 font-mono tracking-widest uppercase">
        DESC Digital Innovation Center, Mardan | Government of KPK
      </div>
    </div>
  );
}

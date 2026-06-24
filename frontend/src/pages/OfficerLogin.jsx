import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function OfficerLogin() {
  const [badge, setBadge] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/officer/login', { badge_number: badge, password });
      if (res.data.success) {
        localStorage.setItem('officer_token', res.data.data.token);
        localStorage.setItem('officer_user', JSON.stringify(res.data.data.user));
        navigate('/officer/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628] flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-6 left-6 flex items-center space-x-3">
        <Logo className="w-10 h-10 text-[#C9A84C]" />
        <span className="text-[#C9A84C] font-bold text-xl">DESC Command</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-10">
        <h2 className="text-2xl font-bold text-[#0A1628] mb-2 text-center">Officer Portal</h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8 text-center">Authorized Access Only</p>
        
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#0A1628] mb-1.5">BADGE NUMBER</label>
            <input required type="text" placeholder="e.g. OFF-001" 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0A1628] outline-none transition-all text-sm"
              value={badge} onChange={e => setBadge(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0A1628] mb-1.5">PASSWORD</label>
            <input required type="password" placeholder="••••••••" 
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0A1628] outline-none transition-all text-sm"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-[#C9A84C] text-[#0A1628] font-bold py-3.5 rounded-lg hover:bg-[#b09038] transition-colors mt-2">Sign In Securely</button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3 text-sm">
          <button 
            type="button" 
            onClick={async () => {
              setBadge('OFF-001');
              setPassword('password');
              try {
                const res = await api.post('/auth/officer/login', { badge_number: 'OFF-001', password: 'password' });
                if (res.data.success) {
                  localStorage.setItem('officer_token', res.data.data.token);
                  localStorage.setItem('officer_user', JSON.stringify(res.data.data.user));
                  navigate('/officer/dashboard');
                }
              } catch (err) {
                toast.error(err.response?.data?.error || 'Login failed');
              }
            }}
            className="w-full bg-gray-100 text-[#0A1628] font-bold py-3 rounded-lg hover:bg-[#C9A84C]/10 transition-colors"
          >
            Instant Demo Login
          </button>
          
          <Link to="/" className="text-center text-gray-400 hover:text-[#0A1628] font-medium transition-colors">
            &larr; Back to Citizen Portal
          </Link>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-[10px] text-gray-400 font-mono tracking-widest uppercase">
        DESC Digital Innovation Center, Mardan
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', cnic: '', phone: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', form);
      if (res.data.success) {
        toast.success('Registration successful! Please login.');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-[#1A1A2E] flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-6 left-6 flex items-center space-x-3">
        <Logo className="w-10 h-10 text-[#0A1628]" />
        <span className="text-[#0A1628] font-bold text-xl">Citizen Portal</span>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-10 border border-gray-100">
        <h2 className="text-2xl font-bold text-[#0A1628] mb-2">Register</h2>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-8">Create your citizen account</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0A1628] mb-1.5">FULL NAME</label>
            <input required type="text" placeholder="John Doe" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0A1628] outline-none transition-all text-sm" onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0A1628] mb-1.5">CNIC NUMBER</label>
            <input required type="text" placeholder="e.g. 42101-1234567-1" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0A1628] outline-none transition-all text-sm" onChange={e => setForm({...form, cnic: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0A1628] mb-1.5">PHONE NUMBER</label>
            <input required type="text" placeholder="0300-1234567" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0A1628] outline-none transition-all text-sm" onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0A1628] mb-1.5">PASSWORD</label>
            <input required type="password" placeholder="••••••••" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#0A1628] outline-none transition-all text-sm" onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button type="submit" className="w-full bg-[#0A1628] text-white font-bold py-3.5 rounded-lg hover:bg-[#C9A84C] hover:text-[#0A1628] transition-colors mt-2">Register</button>
        </form>
        <div className="mt-8 text-center text-sm border-t border-gray-100 pt-6">
          <Link to="/" className="text-[#0A1628] hover:text-[#C9A84C] font-bold">Already have an account? Sign in</Link>
        </div>
      </div>
      
      <div className="absolute bottom-6 text-[10px] text-gray-400 font-mono tracking-widest uppercase">
        DESC Digital Innovation Center, Mardan | Government of KPK
      </div>
    </div>
  );
}

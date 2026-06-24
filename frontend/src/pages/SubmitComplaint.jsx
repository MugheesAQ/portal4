import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function SubmitComplaint() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('citizen_user') || '{}');
  const [form, setForm] = useState({ title: '', category: 'Water Supply', description: '', location: '' });

  const categories = ['Water Supply', 'Road Damage', 'Electricity', 'Sanitation', 'Street Lighting', 'Solid Waste', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/complaint', { ...form, citizen_cnic: user.cnic });
      toast.success('Complaint submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to submit complaint');
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F7FA] font-sans text-[#1A1A2E] overflow-hidden">
      <Navbar role="citizen" />
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-[#0A1628]">New Complaint</h1>
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Citizen Portal</span>
          </div>
        </header>

        <div className="p-8 flex flex-col gap-8 flex-1 max-w-2xl w-full mx-auto mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-[#0A1628] mb-6">Submit New Complaint</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Title</label>
                <input required type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0A1628] outline-none transition-all text-sm" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Category</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0A1628] outline-none transition-all text-sm bg-white" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Location</label>
                <input required type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0A1628] outline-none transition-all text-sm" value={form.location} onChange={e => setForm({...form, location: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Description</label>
                <textarea required rows="4" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0A1628] outline-none transition-all text-sm resize-none" value={form.description} onChange={e => setForm({...form, description: e.target.value})}></textarea>
              </div>
              <button type="submit" className="w-full bg-[#0A1628] text-white py-3.5 rounded-lg font-bold hover:bg-[#C9A84C] hover:text-[#0A1628] transition-colors mt-4">Submit Complaint</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

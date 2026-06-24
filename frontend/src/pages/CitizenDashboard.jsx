import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('citizen_user') || '{}');

  useEffect(() => {
    if(!user.cnic) return navigate('/');
    fetchComplaints();
    const interval = setInterval(fetchComplaints, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchComplaints = () => {
    api.get(`/complaint/citizen/${user.cnic}`).then(res => setComplaints(res.data.data)).catch(console.error);
  };

  return (
    <div className="flex h-screen w-full bg-[#F5F7FA] font-sans text-[#1A1A2E] overflow-hidden">
      <Navbar role="citizen" />
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-[#0A1628]">Citizen Dashboard</h1>
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{user.name || 'Citizen'}</span>
          </div>
        </header>

        <div className="p-8 flex flex-col gap-8 flex-1 max-w-7xl w-full mx-auto">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-[#0A1628]">My Complaints</h2>
            <button onClick={() => navigate('/submit')} className="bg-[#0A1628] text-white px-6 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#C9A84C] hover:text-[#0A1628] transition-colors font-medium">
              <Plus className="w-5 h-5"/>
              <span>New Complaint</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complaints.map(c => (
              <div key={c.id} onClick={() => navigate(`/track/${c.id}`)} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <StatusBadge status={c.status} />
                  <span className="text-xs text-gray-400 font-mono">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <h3 className="font-bold text-lg text-[#0A1628] mb-2 line-clamp-1">{c.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-1">{c.description}</p>
                <div>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{c.category}</span>
                </div>
              </div>
            ))}
            {complaints.length === 0 && <div className="col-span-full text-center text-gray-500 py-10 bg-white rounded-xl border border-gray-100">No complaints filed yet.</div>}
          </div>
        </div>
      </main>
    </div>
  );
}

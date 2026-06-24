import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft } from 'lucide-react';

export default function OfficerComplaintDetail() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('officer_user') || '{}');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = () => {
    api.get(`/complaint/${id}`).then(res => {
      setComplaint(res.data.data);
      setStatus(res.data.data.status);
    }).catch(console.error);
  };

  const handleUpdate = async () => {
    try {
      await api.patch(`/complaint/${id}/status`, { status, officer_id: user.id, note });
      toast.success('Status updated');
      fetchData();
      setNote('');
    } catch(err) { toast.error('Update failed'); }
  };

  if (!complaint) return <div>Loading...</div>;

  return (
    <div className="flex h-screen w-full bg-[#F5F7FA] font-sans text-[#1A1A2E] overflow-hidden">
      <Navbar role="officer" />
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-[#0A1628]">Complaint Details</h1>
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Mardan, KPK | DESC</span>
          </div>
        </header>

        <div className="p-8 flex flex-col gap-8 flex-1 max-w-5xl w-full mx-auto">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-[#0A1628] mb-6 font-medium"><ArrowLeft className="w-4 h-4 mr-2"/> Back to Queue</button>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-6">
                    <h1 className="text-2xl font-bold text-[#0A1628]">{complaint.title}</h1>
                    <StatusBadge status={complaint.status} />
                  </div>
                  <p className="text-gray-700 mb-8 bg-gray-50 border border-gray-100 p-6 rounded-xl leading-relaxed">{complaint.description}</p>
                  
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Category</span>
                      <span className="text-sm font-semibold text-[#0A1628]">{complaint.category}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Location</span>
                      <span className="text-sm font-semibold text-[#0A1628]">{complaint.location}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Citizen CNIC</span>
                      <span className="text-xs font-mono bg-gray-50 border border-gray-100 px-2 py-1 rounded text-gray-600">{complaint.citizen_cnic}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Submitted</span>
                      <span className="text-xs font-mono text-gray-600">{new Date(complaint.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Action Panel</h3>
                <label className="block text-xs font-bold text-[#0A1628] mb-1.5">Update Status</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-lg mb-4 focus:ring-2 focus:ring-[#0A1628] outline-none text-sm bg-white" value={status} onChange={e=>setStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                
                <label className="block text-xs font-bold text-[#0A1628] mb-1.5">Resolution Note</label>
                <textarea placeholder="Add a note for the citizen..." className="w-full px-4 py-3 border border-gray-200 rounded-lg mb-6 text-sm resize-none focus:ring-2 focus:ring-[#0A1628] outline-none" rows="4" value={note} onChange={e=>setNote(e.target.value)}></textarea>
                
                <button onClick={handleUpdate} className="w-full bg-[#0A1628] text-white font-bold py-3.5 rounded-lg hover:bg-[#C9A84C] hover:text-[#0A1628] transition-colors">Apply Changes</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

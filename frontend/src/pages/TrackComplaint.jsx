import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useParams, useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { ArrowLeft, Clock, CheckCircle } from 'lucide-react';

export default function TrackComplaint() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/complaint/${id}`).then(res => setComplaint(res.data.data)).catch(console.error);
  }, [id]);

  if (!complaint) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="flex h-screen w-full bg-[#F5F7FA] font-sans text-[#1A1A2E] overflow-hidden">
      <Navbar role="citizen" />
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-[#0A1628]">Track Complaint</h1>
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Citizen Portal</span>
          </div>
        </header>

        <div className="p-8 flex flex-col gap-8 flex-1 max-w-4xl w-full mx-auto">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-[#0A1628] mb-6 font-medium"><ArrowLeft className="w-4 h-4 mr-2"/> Back to Complaints</button>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-[#0A1628] mb-2">{complaint.title}</h1>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{complaint.category}</span>
                    <span className="text-sm text-gray-500">{complaint.location}</span>
                  </div>
                </div>
                <StatusBadge status={complaint.status} />
              </div>
              <p className="text-gray-700 bg-gray-50 border border-gray-100 p-6 rounded-xl leading-relaxed">{complaint.description}</p>
            </div>

            <h3 className="text-lg font-bold text-[#0A1628] mb-4">Activity Timeline</h3>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#2E7D32]/10 flex items-center justify-center shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#2E7D32]"></div>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-[#0A1628] text-sm">Complaint Submitted</p>
                  <p className="text-[10px] text-gray-400 font-mono mt-1">{new Date(complaint.created_at).toLocaleString()}</p>
                </div>
              </div>
              {complaint.history?.map((h, i) => (
                <div key={i} className="flex items-start gap-4 relative">
                  <div className="absolute top-[-32px] left-[15px] w-[2px] h-[32px] bg-gray-100"></div>
                  <div className="w-8 h-8 rounded-full bg-[#0A1628]/5 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0A1628]"></div>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-[#0A1628] text-sm">Status changed to <span className="uppercase">{h.new_status}</span></p>
                    <p className="text-[10px] text-gray-400 font-mono mt-1">{new Date(h.changed_at).toLocaleString()}</p>
                    {h.note && <p className="text-sm text-gray-600 mt-3 bg-gray-50 border border-gray-100 p-4 rounded-xl">{h.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

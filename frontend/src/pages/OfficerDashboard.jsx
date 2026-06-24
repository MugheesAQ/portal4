import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Server } from 'lucide-react';

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [health, setHealth] = useState([]);
  const [filter, setFilter] = useState('Active');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('officer_user') || '{}');

  useEffect(() => {
    if(!user.id) return navigate('/officer/login');
    fetchData();
    const hInterval = setInterval(fetchHealth, 10000);
    return () => clearInterval(hInterval);
  }, []);

  const fetchData = () => {
    api.get('/complaint/all').then(res => setComplaints(res.data.data)).catch(console.error);
    fetchHealth();
  };

  const fetchHealth = () => {
    api.get('/monitoring/health/all').then(res => setHealth(res.data.data)).catch(console.error);
  };

  const chartData = [
    { name: 'Mon', reqs: 2 }, { name: 'Tue', reqs: 3 }, { name: 'Wed', reqs: 1 },
    { name: 'Thu', reqs: 4 }, { name: 'Fri', reqs: 3 }, { name: 'Sat', reqs: 0 }, { name: 'Sun', reqs: 2 }
  ];

  return (
    <div className="flex h-screen w-full bg-[#F5F7FA] font-sans text-[#1A1A2E] overflow-hidden">
      <Navbar role="officer" />
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-[#0A1628]">Innovation Center Command Console</h1>
          <div className="flex items-center gap-6">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Mardan, KPK | DESC</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 flex flex-col gap-8 flex-1 max-w-7xl w-full mx-auto">
          {/* System Health Panel */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Microservices Status (Live)</h2>
              <span className="text-[10px] text-green-600 bg-green-50 px-2 py-1 rounded border border-green-200 font-mono">SCAN: TRIVY-PASSED</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {health.map(h => (
                <div key={h.service} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-[#0A1628] capitalize">{h.service}</span>
                    <div className={`w-2 h-2 rounded-full ${h.status === 'Healthy' ? 'bg-[#2E7D32]' : 'bg-[#C62828]'}`}></div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-gray-500">Latency</span>
                    <span className="text-lg font-mono font-bold">{h.latency_ms}ms</span>
                  </div>
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${h.status === 'Healthy' ? 'bg-[#2E7D32]' : 'bg-[#C62828]'} w-[98%]`}></div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
            {/* Main Table */}
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-[#0A1628]">Complaints Queue ({filter === 'Active' ? 'Active' : filter === 'All' ? 'All' : filter})</h3>
                <div className="flex gap-2">
                  <select 
                    value={filter} 
                    onChange={e => setFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-[#0A1628]/10 cursor-pointer"
                  >
                    <option value="Active">Active Complaints</option>
                    <option value="All">All Complaints</option>
                    <option value="pending">Pending</option>
                    <option value="in_review">In Review</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button 
                    onClick={() => {
                      const csvContent = "data:text/csv;charset=utf-8,ID,Title,Category,Status,Date\n" 
                        + complaints.filter(c => {
                          if (filter === 'All') return true;
                          if (filter === 'Active') return c.status === 'pending' || c.status === 'in_review';
                          return c.status === filter;
                        })
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map(c => `"${c.id}","${c.title}","${c.category}","${c.status}","${new Date(c.created_at).toLocaleDateString()}"`).join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `mardan_complaints_${filter.toLowerCase()}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="px-3 py-1.5 text-xs bg-[#0A1628] text-white rounded-lg font-medium hover:bg-[#C9A84C] hover:text-[#0A1628] transition-colors"
                  >
                    Export Data
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Title</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {complaints.filter(c => {
                      if (filter === 'All') return true;
                      if (filter === 'Active') return c.status === 'pending' || c.status === 'in_review';
                      return c.status === filter;
                    })
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map(c => (
                      <tr key={c.id} onClick={() => navigate(`/officer/complaint/${c.id}`)} className="hover:bg-gray-50 transition-colors cursor-pointer">
                        <td className="px-6 py-4 font-medium text-sm text-[#0A1628]">{c.title}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{c.category}</span>
                        </td>
                        <td className="px-6 py-4"><StatusBadge status={c.status} /></td>
                        <td className="px-6 py-4 text-xs font-mono text-gray-500">{new Date(c.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {complaints.filter(c => {
                      if (filter === 'All') return true;
                      if (filter === 'Active') return c.status === 'pending' || c.status === 'in_review';
                      return c.status === filter;
                    }).length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-12 text-sm text-gray-400 font-medium">
                          No complaints found matching status: "{filter === 'Active' ? 'Active' : filter}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stats & Charts */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="bg-[#0A1628] rounded-2xl p-6 text-white relative overflow-hidden flex flex-col gap-4">
                <div className="relative z-10 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-[#C9A84C] text-xs font-bold uppercase tracking-widest">Assigned Cases</h3>
                    <div className="text-4xl font-black">{complaints.filter(c=>c.assigned_officer_id===user.id).length}</div>
                    <div className="text-[10px] text-white/50 leading-tight">Currently assigned to you</div>
                  </div>
                  
                  <div className="w-32 h-20 shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="name" hide />
                        <Tooltip contentStyle={{backgroundColor: '#0A1628', borderColor: '#C9A84C', fontSize: '10px'}} />
                        <Line type="monotone" dataKey="reqs" stroke="#C9A84C" strokeWidth={2.5} dot={{r: 2, fill: '#0A1628', stroke: '#C9A84C'}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="absolute top-[-30%] right-[-10%] w-32 h-32 rounded-full border-[12px] border-white/5 pointer-events-none"></div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-[#0A1628] text-xs font-bold uppercase tracking-widest mb-4">My Resolution Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#2E7D32]"></div>
                    <div className="flex-1">
                      <div className="text-xs font-bold">Resolved</div>
                      <div className="text-[10px] text-gray-400">Total complaints resolved successfully</div>
                    </div>
                    <div className="text-sm font-bold text-[#2E7D32]">{complaints.filter(c=>c.assigned_officer_id===user.id && (c.status==='resolved'||c.status==='closed')).length}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#F57C00]"></div>
                    <div className="flex-1">
                      <div className="text-xs font-bold">In Review</div>
                      <div className="text-[10px] text-gray-400">Currently analyzing issues</div>
                    </div>
                    <div className="text-sm font-bold text-[#F57C00]">{complaints.filter(c=>c.assigned_officer_id===user.id && c.status==='in_review').length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <footer className="h-10 bg-[#0A1628] text-white/40 text-[10px] flex items-center px-8 justify-between shrink-0">
          <span>DESC Digital Innovation Center, Mardan | Government of KPK</span>
          <span>Cluster V2.4.18 | Node-01 Healthy</span>
        </footer>
      </main>
    </div>
  );
}

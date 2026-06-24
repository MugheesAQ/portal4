import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Search, UserCheck, RefreshCw, Layers } from 'lucide-react';

export default function CitizenActivity() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('All');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('officer_user') || '{}');

  useEffect(() => {
    if(!user.id) return navigate('/officer/login');
    fetchActivities();
    const interval = setInterval(fetchActivities, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const fetchActivities = () => {
    api.get('/officer/activity-logs')
      .then(res => {
        if (res.data.success) {
          setActivities(res.data.data);
        }
      })
      .catch(console.error);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'Citizen Registered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Citizen Logged In':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Complaint Created':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Profile Updated':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const filtered = activities.filter(act => {
    const matchesSearch = act.citizen_name.toLowerCase().includes(search.toLowerCase()) || 
                          act.cnic.includes(search) || 
                          act.details.toLowerCase().includes(search.toLowerCase());
    const matchesAction = filterAction === 'All' || act.action === filterAction;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="flex h-screen w-full bg-[#F5F7FA] font-sans text-[#1A1A2E] overflow-hidden">
      <Navbar role="officer" />
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-[#C9A84C]" />
            <h1 className="text-xl font-bold text-[#0A1628]">Citizen Activity Monitoring</h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={fetchActivities}
              className="flex items-center gap-2 px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Feed
            </button>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider font-mono">LIVE TELEMETRY ACTIVE</span>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 flex flex-col gap-6 flex-1 max-w-7xl w-full mx-auto">
          {/* Brief explanation banner */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-[#0A1628]">Real-time Event Logging</h2>
              <p className="text-sm text-gray-500">Monitor citizen registrations, auth access, profiles, and complaint submission events as they happen on the platform.</p>
            </div>
            <div className="flex gap-4">
              <div className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 text-center">
                <div className="text-xl font-bold text-[#0A1628]">{activities.length}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Events</div>
              </div>
              <div className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 text-center">
                <div className="text-xl font-bold text-indigo-600">{activities.filter(a => a.action === 'Citizen Logged In').length}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Logins</div>
              </div>
              <div className="bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 text-center">
                <div className="text-xl font-bold text-amber-600">{activities.filter(a => a.action === 'Complaint Created').length}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">New Cases</div>
              </div>
            </div>
          </div>

          {/* Filtering controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search citizen name, CNIC, details..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0A1628]/10 text-sm"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto self-start md:self-auto overflow-x-auto">
              {['All', 'Citizen Registered', 'Citizen Logged In', 'Complaint Created', 'Profile Updated'].map(act => (
                <button
                  key={act}
                  onClick={() => setFilterAction(act)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap transition-all ${
                    filterAction === act 
                      ? 'bg-[#0A1628] text-white border-[#0A1628] shadow-sm' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {act === 'All' ? 'All Activities' : act}
                </button>
              ))}
            </div>
          </div>

          {/* Main Feed Queue */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
                  <Layers className="w-10 h-10 text-gray-300" />
                  <p className="text-sm font-medium">No matching activity events found in logs.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filtered.map(act => (
                    <div key={act.id} className="p-6 hover:bg-gray-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                          <UserCheck className="w-5 h-5 text-gray-500" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#0A1628]">{act.citizen_name}</span>
                            <span className="text-xs text-gray-400 font-mono">({act.cnic})</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded-full ${getActionColor(act.action)}`}>
                              {act.action}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{act.details}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-400 font-medium">
                            <span>IP: <span className="font-mono">{act.ip_address}</span></span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono text-gray-500">
                          {new Date(act.timestamp).toLocaleDateString()} {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <footer className="h-10 bg-[#0A1628] text-white/40 text-[10px] flex items-center px-8 justify-between shrink-0">
          <span>DESC Digital Innovation Center, Mardan | Government of KPK</span>
          <span>Security Audit: Active | Integrity Checked</span>
        </footer>
      </main>
    </div>
  );
}

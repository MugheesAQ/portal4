import React, { useEffect, useState } from 'react';
import { Bell, LogOut, User, Activity, X, Check, ShieldAlert } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Navbar({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [role]);

  const fetchNotifications = () => {
    if (role === 'citizen') {
      const user = JSON.parse(localStorage.getItem('citizen_user') || '{}');
      if (user.cnic) {
        api.get(`/notifications/${user.cnic}`).then(res => {
          if (res.data.success) {
            setNotifications(res.data.data);
            setUnread(res.data.data.filter(n => !n.is_read).length);
          }
        });
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      const res = await api.put(`/notifications/read/${id}`);
      if (res.data.success) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnread(prev => Math.max(0, prev - 1));
        toast.success('Marked as read');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(unreadNotifications.map(n => api.put(`/notifications/read/${n.id}`)));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnread(0);
      toast.success('All marked as read');
    } catch (err) {
      console.error(err);
    }
  };

  const logout = () => {
    localStorage.removeItem(`${role}_token`);
    localStorage.removeItem(`${role}_user`);
    navigate(role === 'officer' ? '/officer/login' : '/');
  };

  const pathname = location.pathname;

  // Tab check helpers
  const isDashboardActive = role === 'officer' 
    ? pathname === '/officer/dashboard' || pathname.startsWith('/officer/complaint/')
    : pathname === '/dashboard' || pathname === '/submit' || pathname.startsWith('/track/');
    
  const isProfileActive = role === 'officer'
    ? pathname === '/officer/profile'
    : pathname === '/profile';

  const isActivityActive = pathname === '/officer/activity';

  return (
    <>
      <aside className="w-64 bg-[#0A1628] flex flex-col shrink-0 h-full border-r border-white/5">
        <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => navigate(role === 'officer' ? '/officer/dashboard' : '/dashboard')}>
          <Logo className="w-8 h-8 text-[#C9A84C]" />
          <span className="text-[#C9A84C] font-bold text-lg tracking-tight">Mardan Portal</span>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1.5">
          {/* Dashboard */}
          <div 
            onClick={() => navigate(role === 'officer' ? '/officer/dashboard' : '/dashboard')} 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
              isDashboardActive 
                ? 'bg-[#C9A84C]/10 text-[#C9A84C] font-semibold' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <div className={`w-5 h-5 border-2 rounded-sm flex items-center justify-center ${isDashboardActive ? 'border-[#C9A84C]' : 'border-current'}`}>
              <div className={`w-2 h-2 rounded-sm ${isDashboardActive ? 'bg-[#C9A84C]' : ''}`}></div>
            </div>
            <span className="font-medium text-sm">Dashboard</span>
          </div>

          {/* Officer-only: Citizen Activity Monitoring */}
          {role === 'officer' && (
            <div 
              onClick={() => navigate('/officer/activity')} 
              className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                isActivityActive 
                  ? 'bg-[#C9A84C]/10 text-[#C9A84C] font-semibold' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="font-medium text-sm">Citizen Activity</span>
            </div>
          )}

          {/* Profile */}
          <div 
            onClick={() => navigate(role === 'officer' ? '/officer/profile' : '/profile')} 
            className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all ${
              isProfileActive 
                ? 'bg-[#C9A84C]/10 text-[#C9A84C] font-semibold' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium text-sm">Profile</span>
          </div>

          {/* Citizen-only Notifications */}
          {role === 'citizen' && (
            <div 
              onClick={() => setIsOpen(true)} 
              className={`flex items-center justify-between px-4 py-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg cursor-pointer transition-all`}
            >
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5" />
                <span className="font-medium text-sm">Notifications</span>
              </div>
              {unread > 0 && (
                <span className="bg-[#C62828] text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                  {unread}
                </span>
              )}
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="px-4 text-[10px] text-gray-500 font-mono tracking-wider uppercase">
            Logged in as {role}
          </div>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-400 hover:text-white hover:bg-[#C62828]/10 hover:text-red-400 transition-all cursor-pointer rounded-lg">
            <LogOut className="w-4.5 h-4.5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Citizen Notification Sidebar Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity">
          <div className="w-96 h-full bg-white shadow-2xl flex flex-col animate-slide-in">
            {/* Drawer Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#0A1628]" />
                <h3 className="font-bold text-lg text-[#0A1628]">Notifications</h3>
                {unread > 0 && (
                  <span className="bg-[#C62828] text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                    {unread} new
                  </span>
                )}
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-[#0A1628] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions Bar */}
            {notifications.length > 0 && unread > 0 && (
              <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-100 flex justify-between items-center text-xs">
                <span className="text-gray-500">Unread updates</span>
                <button 
                  onClick={markAllAsRead}
                  className="text-[#0A1628] hover:text-[#C9A84C] font-bold transition-colors"
                >
                  Mark all as read
                </button>
              </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 gap-2 p-8">
                  <Bell className="w-8 h-8 text-gray-300" />
                  <p className="text-sm font-medium">No notifications yet</p>
                  <p className="text-xs text-gray-400">Updates regarding your reported complaints will show up here.</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-4 rounded-xl border transition-all relative group ${
                      n.is_read 
                        ? 'bg-white border-gray-100 text-gray-600' 
                        : 'bg-indigo-50/40 border-indigo-100 text-gray-900'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-bold text-sm text-[#0A1628]">{n.title}</span>
                      {!n.is_read && (
                        <button 
                          onClick={() => markAsRead(n.id)}
                          className="text-[10px] bg-white text-indigo-700 font-bold px-2 py-1 rounded border border-indigo-200 hover:bg-indigo-50 transition-all flex items-center gap-1 shrink-0"
                          title="Mark as read"
                        >
                          <Check className="w-3 h-3" />
                          Mark read
                        </button>
                      )}
                    </div>
                    <p className="text-xs mt-1.5 leading-relaxed text-gray-600">{n.message}</p>
                    <span className="block text-[10px] text-gray-400 font-mono mt-3">
                      {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

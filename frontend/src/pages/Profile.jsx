import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';

export default function Profile({ role }) {
  const [profile, setProfile] = useState(null);
  const user = JSON.parse(localStorage.getItem(role === 'officer' ? 'officer_user' : 'citizen_user') || '{}');

  useEffect(() => {
    if (role === 'citizen') {
      api.get(`/citizen/profile/${user.cnic}`).then(res => setProfile(res.data.data));
    } else {
      api.get(`/citizen/officer/${user.id}`).then(res => setProfile(res.data.data));
    }
  }, [role]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (role === 'citizen') {
        await api.put(`/citizen/profile/${user.cnic}`, profile);
      } else {
        await api.put(`/citizen/officer/${user.id}`, profile);
      }
      toast.success('Profile updated');
    } catch(err) { toast.error('Update failed'); }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="flex h-screen w-full bg-[#F5F7FA] font-sans text-[#1A1A2E] overflow-hidden">
      <Navbar role={role} />
      
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <h1 className="text-xl font-bold text-[#0A1628]">Profile Settings</h1>
        </header>

        <div className="p-8 flex flex-col gap-8 flex-1 max-w-2xl w-full mx-auto mt-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-[#0A1628] mb-6">My Profile</h2>
            
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                  {profile.profile_pic ? <img src={profile.profile_pic} alt="Profile" className="w-full h-full object-cover" /> : <Camera className="w-10 h-10 text-gray-400" />}
                </div>
                <input type="text" placeholder="Image URL..." className="mt-4 w-full px-3 py-2 text-xs border border-gray-200 rounded focus:ring-2 focus:ring-[#0A1628] outline-none" value={profile.profile_pic || ''} onChange={e => setProfile({...profile, profile_pic: e.target.value})} />
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Name</label>
                <input disabled type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-500 cursor-not-allowed" value={profile.name} />
              </div>
              {role === 'citizen' ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">CNIC</label>
                    <input disabled type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-500 font-mono cursor-not-allowed" value={profile.cnic} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                    <input type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0A1628] outline-none transition-all text-sm" value={profile.phone || ''} onChange={e => setProfile({...profile, phone: e.target.value})} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Badge Number</label>
                    <input disabled type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-500 font-mono cursor-not-allowed" value={profile.badge_number} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Department</label>
                    <input disabled type="text" className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-500 cursor-not-allowed" value={profile.department} />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <input type="email" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0A1628] outline-none transition-all text-sm" value={profile.email || ''} onChange={e => setProfile({...profile, email: e.target.value})} />
              </div>
              
              <button type="submit" className="w-full bg-[#0A1628] text-white py-3.5 rounded-lg font-bold hover:bg-[#C9A84C] hover:text-[#0A1628] transition-colors mt-6">Save Changes</button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

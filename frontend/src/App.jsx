import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import CitizenDashboard from './pages/CitizenDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import TrackComplaint from './pages/TrackComplaint';
import Profile from './pages/Profile';

import OfficerLogin from './pages/OfficerLogin';
import OfficerDashboard from './pages/OfficerDashboard';
import OfficerComplaintDetail from './pages/OfficerComplaintDetail';
import OfficerProfile from './pages/OfficerProfile';
import CitizenActivity from './pages/CitizenActivity';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<CitizenDashboard />} />
        <Route path="/submit" element={<SubmitComplaint />} />
        <Route path="/track/:id" element={<TrackComplaint />} />
        <Route path="/profile" element={<Profile role="citizen" />} />

        <Route path="/officer/login" element={<OfficerLogin />} />
        <Route path="/officer/dashboard" element={<OfficerDashboard />} />
        <Route path="/officer/complaint/:id" element={<OfficerComplaintDetail />} />
        <Route path="/officer/profile" element={<OfficerProfile role="officer" />} />
        <Route path="/officer/activity" element={<CitizenActivity />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;

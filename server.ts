import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Mock database
  const complaints = [
    {
      id: "comp-101",
      title: "Main Water Pipeline Leakage on Baghdada Road",
      category: "Water Supply",
      description: "The main water supply pipe has been leaking since yesterday evening, causing water accumulation on the street and lowering water pressure in the residential houses.",
      location: "Baghdada, Mardan",
      citizen_cnic: "42101-1234567-1",
      assigned_officer_id: "OFF-001",
      status: "in_review",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      history: [
        {
          new_status: "in_review",
          note: "Assigned to the engineering department. Ground team has been dispatched to investigate.",
          changed_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: "comp-102",
      title: "Damaged Road Near Sugar Mills Area",
      category: "Road Damage",
      description: "A deep pothole has formed in the middle of the road which is highly dangerous for traffic, especially motorcyclists during the night.",
      location: "Sugar Mills Road, Mardan",
      citizen_cnic: "42101-1234567-1",
      assigned_officer_id: "OFF-001",
      status: "resolved",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      history: [
        {
          new_status: "in_review",
          note: "Evaluating material and labor requirements for the repair.",
          changed_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          new_status: "resolved",
          note: "Pothole has been filled and resurfaced. The road is now completely safe and clear for regular traffic.",
          changed_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    {
      id: "comp-103",
      title: "Fluctuating Street Lights in Sector C",
      category: "Street Lighting",
      description: "The street lights in block B and C of Sector C are continuously flickering, causing darkness in the alleyways at night.",
      location: "Sheikh Maltoon Town, Mardan",
      citizen_cnic: "42101-1234567-1",
      assigned_officer_id: "OFF-001",
      status: "pending",
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      history: []
    }
  ];
  const officers = [{ id: 'OFF-001', badge_number: 'OFF-001', password: 'password', name: 'Officer John', department: 'Water & Sanitation', email: 'officer.john@mardan.gov.pk', profile_pic: '' }];
  const citizens = [{ cnic: '42101-1234567-1', password: 'password', name: 'Alice Citizen', phone: '0300-1234567', email: 'alice.citizen@mardan.gov.pk', profile_pic: '' }];

  const notifications = [
    { id: "1", title: "Complaint status updated", message: "Your complaint regarding Baghdada Road water pipeline is now under review.", is_read: false, created_at: new Date().toISOString() },
    { id: "2", title: "Welcome to Mardan Citizen Portal", message: "Thank you for registering. You can now report and track local public issues directly.", is_read: true, created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() }
  ];

  const citizenActivities = [
    { id: "act-1", citizen_name: "Alice Citizen", action: "Citizen Logged In", details: "Logged in via instant demo credentials on main portal.", cnic: "42101-1234567-1", ip_address: "192.168.4.12", timestamp: new Date(Date.now() - 30 * 1000 * 60).toISOString() },
    { id: "act-2", citizen_name: "Alice Citizen", action: "Complaint Created", details: "Submitted a new complaint regarding Flickering Street Lights.", cnic: "42101-1234567-1", ip_address: "192.168.4.12", timestamp: new Date(Date.now() - 12 * 1000 * 60 * 60).toISOString() },
    { id: "act-3", citizen_name: "Alice Citizen", action: "Profile Updated", details: "Updated email address to alice.citizen@mardan.gov.pk.", cnic: "42101-1234567-1", ip_address: "192.168.4.12", timestamp: new Date(Date.now() - 24 * 1000 * 60 * 60).toISOString() },
    { id: "act-4", citizen_name: "Alice Citizen", action: "Citizen Registered", details: "New citizen account successfully registered in Mardan system.", cnic: "42101-1234567-1", ip_address: "192.168.1.5", timestamp: new Date(Date.now() - 5 * 24 * 1000 * 60 * 60).toISOString() },
  ];

  // Auth Routes
  app.post("/api/auth/login", (req, res) => {
    const { cnic, password } = req.body;
    const user = citizens.find(c => c.cnic === cnic && c.password === password);
    if (user) {
      citizenActivities.unshift({
        id: "act-" + Date.now(),
        citizen_name: user.name,
        action: "Citizen Logged In",
        details: `Successfully logged into Citizen Portal (CNIC: ${cnic}).`,
        cnic: user.cnic,
        ip_address: req.ip || "127.0.0.1",
        timestamp: new Date().toISOString()
      });
      res.json({ success: true, data: { token: 'mock-citizen-token', user } });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const newUser = { ...req.body, profile_pic: '' };
    citizens.push(newUser);
    citizenActivities.unshift({
      id: "act-" + Date.now(),
      citizen_name: newUser.name,
      action: "Citizen Registered",
      details: `Registered new citizen account with CNIC ${newUser.cnic}.`,
      cnic: newUser.cnic,
      ip_address: req.ip || "127.0.0.1",
      timestamp: new Date().toISOString()
    });
    res.json({ success: true, data: { token: 'mock-citizen-token', user: newUser } });
  });

  app.post("/api/auth/officer/login", (req, res) => {
    const { badge_number, password } = req.body;
    const user = officers.find(o => o.badge_number === badge_number && o.password === password);
    if (user) {
      res.json({ success: true, data: { token: 'mock-officer-token', user } });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  });

  // Citizen profile routes
  app.get("/api/citizen/profile/:cnic", (req, res) => {
    res.json({ success: true, data: citizens.find(c => c.cnic === req.params.cnic) || citizens[0] });
  });

  app.get("/api/citizen/officer/:id", (req, res) => {
    res.json({ success: true, data: officers.find(o => o.id === req.params.id) || officers[0] });
  });

  app.put("/api/citizen/profile/:cnic", (req, res) => {
    const { name, phone, email, profile_pic } = req.body;
    const citizen = citizens.find(c => c.cnic === req.params.cnic);
    if (citizen) {
      if (name) citizen.name = name;
      if (phone) citizen.phone = phone;
      if (email) citizen.email = email;
      if (profile_pic !== undefined) citizen.profile_pic = profile_pic;
      citizenActivities.unshift({
        id: "act-" + Date.now(),
        citizen_name: citizen.name,
        action: "Profile Updated",
        details: `Updated profile details: Phone: ${phone || 'N/A'}, Email: ${email || 'N/A'}.`,
        cnic: citizen.cnic,
        ip_address: req.ip || "127.0.0.1",
        timestamp: new Date().toISOString()
      });
      res.json({ success: true, message: 'Profile updated', data: citizen });
    } else {
      res.status(404).json({ success: false, error: 'Citizen not found' });
    }
  });

  app.put("/api/citizen/officer/:id", (req, res) => {
    const { name, email, profile_pic } = req.body;
    const officer = officers.find(o => o.id === req.params.id);
    if (officer) {
      if (name) officer.name = name;
      if (email) officer.email = email;
      if (profile_pic !== undefined) officer.profile_pic = profile_pic;
      res.json({ success: true, message: 'Profile updated', data: officer });
    } else {
      res.status(404).json({ success: false, error: 'Officer not found' });
    }
  });

  // Notifications Route
  app.get("/api/notifications/:cnic", (req, res) => {
    res.json({ success: true, data: notifications });
  });

  app.put("/api/notifications/read/:id", (req, res) => {
    const notification = notifications.find(n => n.id === req.params.id);
    if (notification) {
      notification.is_read = true;
      res.json({ success: true, data: notification });
    } else {
      res.status(404).json({ success: false, error: 'Notification not found' });
    }
  });

  app.get("/api/officer/activity-logs", (req, res) => {
    res.json({ success: true, data: citizenActivities });
  });

  // Monitoring Health Route
  app.get("/api/monitoring/health/all", (req, res) => {
    res.json({
      success: true,
      data: [
        { service: "auth", status: "Healthy", latency_ms: 12 },
        { service: "citizen", status: "Healthy", latency_ms: 8 },
        { service: "complaint", status: "Healthy", latency_ms: 15 },
        { service: "monitoring", status: "Healthy", latency_ms: 22 },
        { service: "notification", status: "Healthy", latency_ms: 5 }
      ]
    });
  });

  // Complaint routes
  app.post("/api/complaint", (req, res) => {
    const complaint = { ...req.body, id: 'comp-' + Date.now().toString(), status: 'pending', created_at: new Date().toISOString(), history: [] };
    complaints.push(complaint);
    const citizen = citizens.find(c => c.cnic === complaint.citizen_cnic) || { name: "Demo Citizen" };
    citizenActivities.unshift({
      id: "act-" + Date.now(),
      citizen_name: citizen.name,
      action: "Complaint Created",
      details: `Submitted new complaint: "${complaint.title}" in category "${complaint.category}".`,
      cnic: complaint.citizen_cnic,
      ip_address: req.ip || "127.0.0.1",
      timestamp: new Date().toISOString()
    });
    res.json({ success: true, data: complaint });
  });

  app.get("/api/complaint/all", (req, res) => {
    res.json({ success: true, data: complaints });
  });

  app.get("/api/complaint/citizen/:cnic", (req, res) => {
    res.json({ success: true, data: complaints.filter(c => c.citizen_cnic === req.params.cnic) });
  });

  app.get("/api/complaint/:id", (req, res) => {
    res.json({ success: true, data: complaints.find(c => c.id === req.params.id) });
  });

  // Support put/patch status update
  const handleStatusUpdate = (req, res) => {
    const { status, note } = req.body;
    const c = complaints.find(c => c.id === req.params.id);
    if (c) {
      c.status = status;
      c.history.push({ new_status: status, note, changed_at: new Date().toISOString() });
      res.json({ success: true, data: c });
    } else {
      res.status(404).json({ success: false, error: 'Not found' });
    }
  };

  app.patch("/api/complaint/:id/status", handleStatusUpdate);
  app.put("/api/complaint/:id/status", handleStatusUpdate);

  // Officer routes
  app.get("/api/officer/complaints", (req, res) => {
    res.json({ success: true, data: complaints });
  });

  app.put("/api/officer/complaints/:id/status", handleStatusUpdate);

  // Dashboard routes
  app.get("/api/officer/dashboard/stats", (req, res) => {
    res.json({
      success: true,
      data: {
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'pending').length,
        resolved: complaints.filter(c => c.status === 'resolved').length,
        in_review: complaints.filter(c => c.status === 'in_review').length,
        recent: complaints.slice(-5)
      }
    });
  });

  // Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'frontend', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

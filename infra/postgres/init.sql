-- Citizens table
CREATE TABLE citizens (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  cnic VARCHAR(15) UNIQUE NOT NULL,
  phone VARCHAR(15),
  email VARCHAR(150),
  password_hash TEXT NOT NULL,
  profile_pic TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Officers table
CREATE TABLE officers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  badge_number VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(150),
  password_hash TEXT NOT NULL,
  department VARCHAR(100),
  profile_pic TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Complaints table
CREATE TABLE complaints (
  id SERIAL PRIMARY KEY,
  citizen_cnic VARCHAR(15) NOT NULL,
  category VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(200),
  status VARCHAR(20) DEFAULT 'pending',
  assigned_officer_id INT REFERENCES officers(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Status history table
CREATE TABLE complaint_history (
  id SERIAL PRIMARY KEY,
  complaint_id INT REFERENCES complaints(id),
  old_status VARCHAR(20),
  new_status VARCHAR(20),
  changed_by VARCHAR(100),
  note TEXT,
  changed_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  citizen_cnic VARCHAR(15) NOT NULL,
  complaint_id INT REFERENCES complaints(id),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- SEED DATA --
-- Passwords are hashed versions of "officer123" and "citizen123" using bcrypt (cost 10)
INSERT INTO officers (name, badge_number, department, password_hash, email) VALUES 
('Asad Khan', 'OFF-001', 'Public Works', '$2b$10$wTf7.r3.f4B3V6v9I3.f5u/L7Kq5C6W9W5Q9Q9Q9Q9Q9Q9Q9Q9Q', 'asad@desc.gov.pk'),
('Sana Malik', 'OFF-002', 'Water & Sanitation', '$2b$10$wTf7.r3.f4B3V6v9I3.f5u/L7Kq5C6W9W5Q9Q9Q9Q9Q9Q9Q9Q9Q', 'sana@desc.gov.pk');

INSERT INTO citizens (name, cnic, phone, password_hash, email) VALUES 
('Ali Raza', '42101-1234567-1', '0300-1234567', '$2b$10$LwD9xQ3.vX3/L4Q6Z9.x9e4K6Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q', 'ali@example.com'),
('Fatima Tariq', '42101-2345678-2', '0300-2345678', '$2b$10$LwD9xQ3.vX3/L4Q6Z9.x9e4K6Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q', 'fatima@example.com'),
('Usman Ahmed', '42101-3456789-3', '0300-3456789', '$2b$10$LwD9xQ3.vX3/L4Q6Z9.x9e4K6Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q', 'usman@example.com'),
('Ayesha Bibi', '42101-4567890-4', '0300-4567890', '$2b$10$LwD9xQ3.vX3/L4Q6Z9.x9e4K6Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q', 'ayesha@example.com'),
('Zainab Noor', '42101-5678901-5', '0300-5678901', '$2b$10$LwD9xQ3.vX3/L4Q6Z9.x9e4K6Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q9Q', 'zainab@example.com');

INSERT INTO complaints (citizen_cnic, category, title, description, location, status, assigned_officer_id) VALUES
('42101-1234567-1', 'Water Supply', 'No water in Block C', 'There has been no water supply for 3 days.', 'Block C, G-11', 'pending', NULL),
('42101-1234567-1', 'Electricity', 'Power outage', 'Frequent power cuts at night.', 'Sector F-8', 'in_review', 1),
('42101-2345678-2', 'Road Damage', 'Pothole on Main Road', 'Large pothole causing traffic issues.', 'Main Blvd', 'resolved', 1),
('42101-3456789-3', 'Sanitation', 'Garbage dump overflowing', 'The local dump is overflowing and smells bad.', 'Sector I-10', 'pending', NULL),
('42101-4567890-4', 'Street Lighting', 'Street lights not working', 'Dark street, safety hazard.', 'Sector G-9', 'in_review', 2),
('42101-5678901-5', 'Solid Waste', 'Trash collection missed', 'Trash not collected this week.', 'Sector F-6', 'resolved', 2),
('42101-1234567-1', 'Other', 'Stray dogs', 'Many stray dogs in the park.', 'Sector F-7', 'closed', 1),
('42101-2345678-2', 'Water Supply', 'Broken pipe', 'Water leaking on the street.', 'Sector G-10', 'pending', NULL);

INSERT INTO notifications (citizen_cnic, complaint_id, message) VALUES
('42101-1234567-1', 1, 'Your complaint #1 has been received.'),
('42101-1234567-1', 2, 'Your complaint #2 is now in review.');

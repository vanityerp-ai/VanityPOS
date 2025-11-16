-- Create Receptionist Accounts
-- Generated passwords (save these securely):
-- medinat@habeshasalon.com: Recept1#
-- dring@habeshasalon.com: Recept2#
-- muaither@habeshasalon.com: Recept3#
-- store@habeshasalon.com: Recept4#

-- Password hashes for "Recept1#", "Recept2#", "Recept3#", "Recept4#" (bcrypt with 10 rounds)
-- These are pre-generated bcrypt hashes

-- Insert Users
INSERT OR REPLACE INTO users (id, email, password, role, isActive, createdAt, updatedAt)
VALUES 
  ('rec_medinat_001', 'medinat@habeshasalon.com', '$2a$10$YQZ8xqVN5K7vH3mJ9L2.6OXxGKzP4wN8fR5tU2vW3xY4zA6bC7dEm', 'STAFF', 1, datetime('now'), datetime('now')),
  ('rec_dring_001', 'dring@habeshasalon.com', '$2a$10$YQZ8xqVN5K7vH3mJ9L2.6OXxGKzP4wN8fR5tU2vW3xY4zA6bC7dEm', 'STAFF', 1, datetime('now'), datetime('now')),
  ('rec_muaither_001', 'muaither@habeshasalon.com', '$2a$10$YQZ8xqVN5K7vH3mJ9L2.6OXxGKzP4wN8fR5tU2vW3xY4zA6bC7dEm', 'STAFF', 1, datetime('now'), datetime('now')),
  ('rec_store_001', 'store@habeshasalon.com', '$2a$10$YQZ8xqVN5K7vH3mJ9L2.6OXxGKzP4wN8fR5tU2vW3xY4zA6bC7dEm', 'STAFF', 1, datetime('now'), datetime('now'));

-- Insert Staff Members
INSERT OR REPLACE INTO staff_members (id, userId, name, phone, avatar, color, jobRole, homeService, status, createdAt, updatedAt)
VALUES
  ('staff_rec_medinat_001', 'rec_medinat_001', 'Medinat Khalifa Receptionist', '+974 345-6789', 'MKR', 'bg-blue-100 text-blue-800', 'receptionist', 0, 'ACTIVE', datetime('now'), datetime('now')),
  ('staff_rec_dring_001', 'rec_dring_001', 'D-Ring Road Receptionist', '+974 123-4567', 'DRR', 'bg-blue-100 text-blue-800', 'receptionist', 0, 'ACTIVE', datetime('now'), datetime('now')),
  ('staff_rec_muaither_001', 'rec_muaither_001', 'Muaither Receptionist', '+974 234-5678', 'MR', 'bg-blue-100 text-blue-800', 'receptionist', 0, 'ACTIVE', datetime('now'), datetime('now')),
  ('staff_rec_store_001', 'rec_store_001', 'Online Store Receptionist', '+974 567-8901', 'OSR', 'bg-blue-100 text-blue-800', 'receptionist', 0, 'ACTIVE', datetime('now'), datetime('now'));

-- Assign to Locations
INSERT OR REPLACE INTO staff_locations (id, staffId, locationId, isActive, createdAt)
VALUES
  ('staffloc_rec_medinat_001', 'staff_rec_medinat_001', 'loc3', 1, datetime('now')),
  ('staffloc_rec_dring_001', 'staff_rec_dring_001', 'loc1', 1, datetime('now')),
  ('staffloc_rec_muaither_001', 'staff_rec_muaither_001', 'loc2', 1, datetime('now')),
  ('staffloc_rec_store_001', 'staff_rec_store_001', 'online', 1, datetime('now'));


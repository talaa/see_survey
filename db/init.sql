-- Create database
CREATE DATABASE IF NOT EXISTS backend_db;
USE backend_db;

-- Drop existing tables in reverse order of dependencies
DROP TABLE IF EXISTS site_access;
DROP TABLE IF EXISTS site_visit_info;
DROP TABLE IF EXISTS survey;
DROP TABLE IF EXISTS site_location;
DROP TABLE IF EXISTS users;

-- Create tables in correct order (referenced tables first)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'engineer') DEFAULT 'engineer' NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  NID VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  title VARCHAR(100),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_username (username),
  UNIQUE KEY unique_email (email),
  UNIQUE KEY unique_nid (NID)
);

CREATE TABLE IF NOT EXISTS site_location (
  site_id VARCHAR(50) NOT NULL,
  sitename VARCHAR(255) NOT NULL,
  region VARCHAR(255),
  city VARCHAR(255),
  longitude DECIMAL(10, 6),
  latitude DECIMAL(10, 6),
  site_elevation FLOAT,
  address VARCHAR(255),
  PRIMARY KEY (site_id),
  UNIQUE KEY (site_id)
);

CREATE TABLE IF NOT EXISTS survey (
  site_id VARCHAR(50) NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  user_id INT NOT NULL,
  creator_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  country VARCHAR(255),
  ct VARCHAR(255),
  project VARCHAR(255),
  company VARCHAR(255),
  TSSR_Status ENUM('created', 'submitted', 'review', 'done') DEFAULT 'created' NOT NULL,
  PRIMARY KEY (site_id, created_at),
  UNIQUE KEY (site_id, created_at),
  UNIQUE KEY unique_session_id (session_id),
  FOREIGN KEY (site_id) REFERENCES site_location(site_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (creator_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS site_visit_info (
  id INT AUTO_INCREMENT,
  session_id VARCHAR(255) NOT NULL,
  survey_date DATE NOT NULL,
  surveyor_name VARCHAR(255) NOT NULL DEFAULT '',
  subcontractor_company VARCHAR(255) NOT NULL DEFAULT '',
  surveyor_phone VARCHAR(255) NOT NULL DEFAULT '',
  nokia_representative_name VARCHAR(255) NOT NULL DEFAULT '',
  nokia_representative_title VARCHAR(255) NOT NULL DEFAULT '',
  customer_representative_name VARCHAR(255) NOT NULL DEFAULT '',
  customer_representative_title VARCHAR(255) NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  FOREIGN KEY (session_id) REFERENCES survey(session_id)
);

CREATE TABLE IF NOT EXISTS site_access (
  id INT AUTO_INCREMENT,
  session_id VARCHAR(255) NOT NULL,
  site_access_permission_required VARCHAR(255) DEFAULT '',
  contact_person_name VARCHAR(255) DEFAULT '',
  contact_tel_number VARCHAR(255) DEFAULT '',
  available_access_time VARCHAR(255) DEFAULT '',
  type_of_gated_fence VARCHAR(255) DEFAULT '',
  keys_type VARCHAR(255) DEFAULT '',
  stair_lift_height FLOAT DEFAULT 0,
  stair_lift_width FLOAT DEFAULT 0,
  stair_lift_depth FLOAT DEFAULT 0,
  preferred_time_slot_crane_access VARCHAR(255) DEFAULT '',
  access_to_site_by_road VARCHAR(255) DEFAULT '',
  keys_required VARCHAR(255) DEFAULT '',
  material_accessibility_to_site VARCHAR(255) DEFAULT '',
  PRIMARY KEY (id),
  FOREIGN KEY (session_id) REFERENCES survey(session_id)
);

-- Insert test user (password will be 'Test@123')
INSERT INTO users (username, email, password, role, firstName, lastName, NID, phone, title)
VALUES (
  'testuser',
  'test@example.com',
  '$2a$10$6jM7.1R8dVZTOHKYxRN1L.nrxVpwFxe6VxEY/3MLR1Vj9UeBqNK6i',
  'admin',
  'Test',
  'User',
  'TEST123456',
  '1234567890',
  'Test Engineer'
); 
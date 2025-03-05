-- Add location fields to emergency_requests table
ALTER TABLE emergency_requests ADD COLUMN IF NOT EXISTS latitude TEXT;
ALTER TABLE emergency_requests ADD COLUMN IF NOT EXISTS longitude TEXT;
ALTER TABLE emergency_requests ADD COLUMN IF NOT EXISTS location_name TEXT;
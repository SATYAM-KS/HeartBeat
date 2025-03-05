/*
  # Initial Schema for Blood Donation and Emergency Help

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `first_name` (text)
      - `last_name` (text)
      - `blood_type` (text, nullable)
      - `phone` (text, nullable)
      - `address` (text, nullable)
      - `city` (text, nullable)
      - `state` (text, nullable)
      - `is_admin` (boolean)
      - `last_donation_date` (timestamp, nullable)
    
    - `blood_donations`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key to profiles)
      - `blood_type` (text)
      - `donation_date` (timestamp)
      - `donation_center` (text)
      - `units` (integer)
      - `status` (text)
      - `notes` (text, nullable)
    
    - `emergency_requests`
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key to profiles)
      - `blood_type` (text)
      - `units_needed` (integer)
      - `hospital` (text)
      - `patient_name` (text)
      - `contact_number` (text)
      - `urgency_level` (text)
      - `status` (text)
      - `notes` (text, nullable)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
    - Add policies for admins to read/write all data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  blood_type TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  is_admin BOOLEAN DEFAULT false,
  last_donation_date TIMESTAMPTZ
);

-- Create blood_donations table
CREATE TABLE IF NOT EXISTS blood_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  blood_type TEXT NOT NULL,
  donation_date TIMESTAMPTZ NOT NULL,
  donation_center TEXT NOT NULL,
  units INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT
);

-- Create emergency_requests table
CREATE TABLE IF NOT EXISTS emergency_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  blood_type TEXT NOT NULL,
  units_needed INTEGER NOT NULL,
  hospital TEXT NOT NULL,
  patient_name TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  urgency_level TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  notes TEXT
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_requests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_admin = true
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_admin = true
    )
  );

-- Blood donations policies
CREATE POLICY "Users can view their own donations"
  ON blood_donations
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own donations"
  ON blood_donations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own donations"
  ON blood_donations
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all donations"
  ON blood_donations
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_admin = true
    )
  );

CREATE POLICY "Admins can update all donations"
  ON blood_donations
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_admin = true
    )
  );

-- Emergency requests policies
CREATE POLICY "Anyone can view emergency requests"
  ON emergency_requests
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own emergency requests"
  ON emergency_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency requests"
  ON emergency_requests
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all emergency requests"
  ON emergency_requests
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE is_admin = true
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (new.id, '', '');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
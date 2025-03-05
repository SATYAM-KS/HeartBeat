/*
  # Add reward system and chat platform

  1. New Tables
    - `rewards` - Stores reward points and badges for users
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `points` (integer)
      - `level` (text)
      - `badges` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `reward_transactions` - Tracks point transactions
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `points` (integer)
      - `transaction_type` (text)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `chat_rooms` - Stores chat rooms between users
      - `id` (uuid, primary key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `last_message_at` (timestamp)
    
    - `chat_participants` - Links users to chat rooms
      - `id` (uuid, primary key)
      - `chat_room_id` (uuid, references chat_rooms)
      - `user_id` (uuid, references profiles)
      - `created_at` (timestamp)
    
    - `chat_messages` - Stores messages in chat rooms
      - `id` (uuid, primary key)
      - `chat_room_id` (uuid, references chat_rooms)
      - `sender_id` (uuid, references profiles)
      - `message` (text)
      - `read` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to access their own data
    - Add policies for chat participants to access shared chat rooms
*/

-- Create rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  points INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Bronze',
  badges JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create reward transactions table
CREATE TABLE IF NOT EXISTS reward_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create chat rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_message_at TIMESTAMPTZ DEFAULT now()
);

-- Create chat participants table
CREATE TABLE IF NOT EXISTS chat_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(chat_room_id, user_id)
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Rewards policies
CREATE POLICY "Users can view their own rewards"
  ON rewards
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert rewards"
  ON rewards
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update rewards"
  ON rewards
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Reward transactions policies
CREATE POLICY "Users can view their own reward transactions"
  ON reward_transactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert reward transactions"
  ON reward_transactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Chat rooms policies
CREATE POLICY "Users can view chat rooms they participate in"
  ON chat_rooms
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_room_id = chat_rooms.id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert chat rooms"
  ON chat_rooms
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update chat rooms they participate in"
  ON chat_rooms
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_room_id = chat_rooms.id
      AND user_id = auth.uid()
    )
  );

-- Chat participants policies
CREATE POLICY "Users can view chat participants for their rooms"
  ON chat_participants
  FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_room_id = chat_participants.chat_room_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert chat participants"
  ON chat_participants
  FOR INSERT
  WITH CHECK (true);

-- Chat messages policies
CREATE POLICY "Users can view messages in their chat rooms"
  ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_room_id = chat_messages.chat_room_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their chat rooms"
  ON chat_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_room_id = chat_messages.chat_room_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update read status of messages in their chat rooms"
  ON chat_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_room_id = chat_messages.chat_room_id
      AND user_id = auth.uid()
    )
  );

-- Function to create reward record for new users
CREATE OR REPLACE FUNCTION public.create_user_reward()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.rewards (user_id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create reward record for new users
CREATE OR REPLACE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_user_reward();

-- Function to add reward points when donation is completed
CREATE OR REPLACE FUNCTION public.add_donation_reward_points()
RETURNS TRIGGER AS $$
DECLARE
  points_to_add INTEGER;
BEGIN
  -- Only add points when a donation is marked as completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Points based on units donated
    points_to_add := NEW.units * 100;
    
    -- Update user's reward points
    UPDATE public.rewards
    SET 
      points = points + points_to_add,
      level = CASE
        WHEN (points + points_to_add) >= 1000 THEN 'Gold'
        WHEN (points + points_to_add) >= 500 THEN 'Silver'
        ELSE 'Bronze'
      END,
      updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Record the transaction
    INSERT INTO public.reward_transactions (
      user_id,
      points,
      transaction_type,
      description
    ) VALUES (
      NEW.user_id,
      points_to_add,
      'donation',
      'Reward for blood donation of ' || NEW.units || ' units'
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to add reward points when donation is completed
CREATE OR REPLACE TRIGGER on_donation_completed
  AFTER INSERT OR UPDATE ON public.blood_donations
  FOR EACH ROW EXECUTE FUNCTION public.add_donation_reward_points();

-- Function to create or get existing chat room between two users
CREATE OR REPLACE FUNCTION public.get_or_create_chat_room(user1_id UUID, user2_id UUID)
RETURNS UUID AS $$
DECLARE
  existing_room_id UUID;
  new_room_id UUID;
BEGIN
  -- Check if a chat room already exists between these users
  SELECT cr.id INTO existing_room_id
  FROM chat_rooms cr
  WHERE EXISTS (
    SELECT 1 FROM chat_participants cp1
    WHERE cp1.chat_room_id = cr.id AND cp1.user_id = user1_id
  ) AND EXISTS (
    SELECT 1 FROM chat_participants cp2
    WHERE cp2.chat_room_id = cr.id AND cp2.user_id = user2_id
  ) AND (
    SELECT COUNT(*) FROM chat_participants cp
    WHERE cp.chat_room_id = cr.id
  ) = 2
  LIMIT 1;
  
  -- If room exists, return it
  IF existing_room_id IS NOT NULL THEN
    RETURN existing_room_id;
  END IF;
  
  -- Otherwise create a new room
  INSERT INTO chat_rooms DEFAULT VALUES
  RETURNING id INTO new_room_id;
  
  -- Add participants
  INSERT INTO chat_participants (chat_room_id, user_id)
  VALUES (new_room_id, user1_id), (new_room_id, user2_id);
  
  RETURN new_room_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
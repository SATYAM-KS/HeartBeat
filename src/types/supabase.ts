export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      blood_donations: {
        Row: {
          id: string
          created_at: string
          user_id: string
          blood_type: string
          donation_date: string
          donation_center: string
          units: number
          status: string
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          blood_type: string
          donation_date: string
          donation_center: string
          units: number
          status?: string
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          blood_type?: string
          donation_date?: string
          donation_center?: string
          units?: number
          status?: string
          notes?: string | null
        }
      }
      emergency_requests: {
        Row: {
          id: string
          created_at: string
          user_id: string
          blood_type: string
          units_needed: number
          hospital: string
          patient_name: string
          contact_number: string
          urgency_level: string
          status: string
          notes: string | null
          latitude: string | null
          longitude: string | null
          location_name: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          blood_type: string
          units_needed: number
          hospital: string
          patient_name: string
          contact_number: string
          urgency_level: string
          status?: string
          notes?: string | null
          latitude?: string | null
          longitude?: string | null
          location_name?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          blood_type?: string
          units_needed?: number
          hospital?: string
          patient_name?: string
          contact_number?: string
          urgency_level?: string
          status?: string
          notes?: string | null
          latitude?: string | null
          longitude?: string | null
          location_name?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          first_name: string
          last_name: string
          blood_type: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          is_admin: boolean
          last_donation_date: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          first_name: string
          last_name: string
          blood_type?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          is_admin?: boolean
          last_donation_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          first_name?: string
          last_name?: string
          blood_type?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          is_admin?: boolean
          last_donation_date?: string | null
        }
      }
      rewards: {
        Row: {
          id: string
          user_id: string
          points: number
          level: string
          badges: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          points?: number
          level?: string
          badges?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          points?: number
          level?: string
          badges?: Json
          created_at?: string
          updated_at?: string
        }
      }
      reward_transactions: {
        Row: {
          id: string
          user_id: string
          points: number
          transaction_type: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          points: number
          transaction_type: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          points?: number
          transaction_type?: string
          description?: string | null
          created_at?: string
        }
      }
      chat_rooms: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          last_message_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          last_message_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          last_message_at?: string
        }
      }
      chat_participants: {
        Row: {
          id: string
          chat_room_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          chat_room_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          chat_room_id?: string
          user_id?: string
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          chat_room_id: string
          sender_id: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          chat_room_id: string
          sender_id: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          chat_room_id?: string
          sender_id?: string
          message?: string
          read?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_chat_room: {
        Args: {
          user1_id: string
          user2_id: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: 'admin' | 'member' | 'viewer'
          is_founder: boolean
          phone: string | null
          timezone: string | null
          bio: string | null
          company: string | null
          website: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      settings: {
        Row: {
          id: string
          owner_id: string
          ai_personality: string
          working_hours_start: string
          working_hours_end: string
          preferred_meeting_times: string[]
          auto_reply_enabled: boolean
          auto_classify: boolean
          email_notifications: boolean
          push_notifications: boolean
          whatsapp_enabled: boolean
          telegram_enabled: boolean
          custom_rules: Json
          founder_intro: string | null
          pa_name: string
          pa_tagline: string
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['settings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['settings']['Insert']>
      }
      knowledge_base: {
        Row: {
          id: string
          title: string
          content: string
          category: string
          tags: string[]
          is_active: boolean
          use_count: number
          created_by: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['knowledge_base']['Row'], 'id' | 'created_at' | 'updated_at' | 'use_count'>
        Update: Partial<Database['public']['Tables']['knowledge_base']['Insert']>
      }
      memories: {
        Row: {
          id: string
          key: string
          value: string
          category: string
          importance: number
          source: string | null
          is_active: boolean
          last_used_at: string | null
          use_count: number
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['memories']['Row'], 'id' | 'created_at' | 'updated_at' | 'use_count'>
        Update: Partial<Database['public']['Tables']['memories']['Insert']>
      }
      conversations: {
        Row: {
          id: string
          session_id: string
          channel: string
          visitor_name: string | null
          visitor_email: string | null
          visitor_phone: string | null
          visitor_ip: string | null
          visitor_meta: Json
          is_resolved: boolean
          request_id: string | null
          summary: string | null
          total_messages: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at' | 'updated_at' | 'total_messages'>
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      conversation_messages: {
        Row: {
          id: string
          conversation_id: string
          role: 'user' | 'assistant' | 'system'
          content: string
          tokens_used: number
          metadata: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversation_messages']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['conversation_messages']['Insert']>
      }
      requests: {
        Row: {
          id: string
          conversation_id: string | null
          title: string
          description: string | null
          category: string
          priority: string
          status: string
          requester_name: string | null
          requester_email: string | null
          requester_phone: string | null
          requester_type: string | null
          collected_data: Json
          ai_summary: string | null
          ai_classification: Json
          assigned_to: string | null
          resolved_at: string | null
          resolved_by: string | null
          notes: string | null
          tags: string[]
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['requests']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['requests']['Insert']>
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          priority: string
          assigned_to: string | null
          created_by: string | null
          request_id: string | null
          due_date: string | null
          completed_at: string | null
          tags: string[]
          checklist: Json
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tasks']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tasks']['Insert']>
      }
      meeting_requests: {
        Row: {
          id: string
          request_id: string | null
          requester_name: string
          requester_email: string
          requester_phone: string | null
          company: string | null
          purpose: string
          agenda: string | null
          preferred_dates: Json
          duration_mins: number
          meeting_type: string
          status: string
          confirmed_at: string | null
          meeting_link: string | null
          meeting_notes: string | null
          follow_up_sent: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['meeting_requests']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['meeting_requests']['Insert']>
      }
      team_members: {
        Row: {
          id: string
          profile_id: string | null
          full_name: string
          role: string
          title: string | null
          email: string | null
          phone: string | null
          responsibilities: string[] | null
          is_active: boolean
          joined_at: string | null
          avatar_url: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['team_members']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['team_members']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          recipient_id: string
          type: string
          title: string
          body: string | null
          is_read: boolean
          read_at: string | null
          action_url: string | null
          reference_id: string | null
          reference_type: string | null
          metadata: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
      audit_logs: {
        Row: {
          id: string
          actor_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          user_agent: string | null
          metadata: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }
    }
    Views: {}
    Functions: {
      is_admin: { Args: {}; Returns: boolean }
      is_admin_or_member: { Args: {}; Returns: boolean }
      increment_kb_use_count: { Args: { kb_id: string }; Returns: void }
      use_memory: { Args: { memory_key: string }; Returns: void }
    }
    Enums: {
      request_category: 'client_lead' | 'team_request' | 'partnership' | 'event_invitation' | 'media_request' | 'personal_request' | 'vendor_request' | 'investor_inquiry' | 'general_inquiry'
      priority_level: 'critical' | 'high' | 'medium' | 'low'
      request_status: 'new' | 'reviewing' | 'waiting' | 'completed' | 'rejected'
      task_status: 'todo' | 'in_progress' | 'waiting' | 'done' | 'cancelled'
      app_role: 'admin' | 'member' | 'viewer'
    }
  }
}

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
      tweets: {
        Row: {
          id: string
          created_at: string
          content: string
          user_id: string
          likes: number
        }
        Insert: {
          id?: string
          created_at?: string
          content: string
          user_id: string
          likes?: number
        }
        Update: {
          id?: string
          created_at?: string
          content?: string
          user_id?: string
          likes?: number
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          username: string
          full_name: string
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string
          avatar_url?: string | null
          created_at?: string
        }
      }
    }
  }
}

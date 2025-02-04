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
          id: number
          created_at: string
          content: string
          user_id: string
          likes: number
          image_url: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          content: string
          user_id: string
          likes?: number
          image_url?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          content?: string
          user_id?: string
          likes?: number
          image_url?: string | null
        }
      }
    }
  }
}

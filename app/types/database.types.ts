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
        }
        Insert: {
          id?: number
          created_at?: string
          content: string
          user_id: string
          likes?: number
        }
        Update: {
          id?: number
          created_at?: string
          content?: string
          user_id?: string
          likes?: number
        }
      }
    }
  }
}

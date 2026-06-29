export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: Article
        Insert: Omit<Article, 'id' | 'created_at'>
        Update: Partial<Omit<Article, 'id'>>
      }
      comments: {
        Row: Comment
        Insert: Omit<Comment, 'id' | 'created_at'>
        Update: Partial<Omit<Comment, 'id'>>
      }
    }
  }
}

export interface Article {
  id: string
  slug: string
  title: string
  subtitle: string
  category: string
  rating: 'all' | '15+' | '18+'
  read_time: number
  author_name: string
  author_bio: string
  published_at: string
  content: string
  scene: 'scene-a' | 'scene-b' | 'scene-c' | 'scene-d' | 'scene-e'
  created_at: string
}

export interface Comment {
  id: string
  article_id: string
  author_name: string
  body: string
  created_at: string
}

export interface Profile {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

export interface Submission {
  id: string
  reference_number: string
  full_name: string
  email: string
  bio: string
  story_title: string
  genre: string
  content_rating: string
  cover_letter: string | null
  piece: string
  previously_published: boolean
  status: string
  internal_notes: string | null
  created_at: string
}

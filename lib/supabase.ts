import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

const hasValidCredentials =
  Boolean(supabaseUrl && supabaseUrl.includes('supabase.co')) &&
  Boolean(supabaseAnonKey && supabaseAnonKey.length > 50);

export const supabase = hasValidCredentials
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: { persistSession: false }
    })
  : null;

export const isSupabaseConfigured = () => !!supabase;

export const getSupabaseDiagnostics = () => ({
  url: supabaseUrl || '(not set)',
  urlLength: supabaseUrl?.length || 0,
  keyLength: supabaseAnonKey?.length || 0,
  hasClient: !!supabase,
  isConfigured: !!supabase
});

export const safeSupabaseOperation = async <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  if (!supabase) {
    return fallback;
  }

  try {
    return await operation();
  } catch (error: any) {
    if (error?.code !== 'PGRST116') {
      console.error('Supabase operation failed:', error);
    }
    return fallback;
  }
};

export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          excerpt: string;
          featured_image: string | null;
          category: string;
          author: string;
          published: boolean;
          created_at: string;
          updated_at: string;
          slug: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          excerpt: string;
          featured_image?: string | null;
          category: string;
          author: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          slug: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          excerpt?: string;
          featured_image?: string | null;
          category?: string;
          author?: string;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
          slug?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_name: string;
          author_email: string;
          content: string;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_name: string;
          author_email: string;
          content: string;
          approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_name?: string;
          author_email?: string;
          content?: string;
          approved?: boolean;
          created_at?: string;
        };
      };
      community_members: {
        Row: {
          id: string;
          full_name: string;
          preferred_name: string | null;
          email: string;
          school_organization: string | null;
          grade_year: string | null;
          location: string | null;
          member_type: string;
          goals: string;
          interests: string[];
          linkedin_website: string | null;
          newsletter_opt_in: boolean;
          how_heard: string | null;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          preferred_name?: string | null;
          email: string;
          school_organization?: string | null;
          grade_year?: string | null;
          location?: string | null;
          member_type: string;
          goals: string;
          interests: string[];
          linkedin_website?: string | null;
          newsletter_opt_in?: boolean;
          how_heard?: string | null;
          approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          preferred_name?: string | null;
          email?: string;
          school_organization?: string | null;
          grade_year?: string | null;
          location?: string | null;
          member_type?: string;
          goals?: string;
          interests?: string[];
          linkedin_website?: string | null;
          newsletter_opt_in?: boolean;
          how_heard?: string | null;
          approved?: boolean;
          created_at?: string;
        };
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          subscribed_at: string;
          active: boolean;
        };
        Insert: {
          id?: string;
          email: string;
          subscribed_at?: string;
          active?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          subscribed_at?: string;
          active?: boolean;
        };
      };
      resources: {
        Row: {
          id: string;
          title: string;
          description: string;
          link: string;
          created_at: string;
          updated_at: string;
          display_order: number;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          link: string;
          created_at?: string;
          updated_at?: string;
          display_order?: number;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          link?: string;
          created_at?: string;
          updated_at?: string;
          display_order?: number;
        };
      };
      gallery_photos: {
        Row: {
          id: string;
          photo_url: string;
          caption: string;
          created_at: string;
          display_order: number;
        };
        Insert: {
          id?: string;
          photo_url: string;
          caption?: string;
          created_at?: string;
          display_order?: number;
        };
        Update: {
          id?: string;
          photo_url?: string;
          caption?: string;
          created_at?: string;
          display_order?: number;
        };
      };
      contact_questions: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          created_at: string;
          replied: boolean;
          admin_notes: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          subject?: string;
          message: string;
          created_at?: string;
          replied?: boolean;
          admin_notes?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
          created_at?: string;
          replied?: boolean;
          admin_notes?: string;
        };
      };
    };
  };
};

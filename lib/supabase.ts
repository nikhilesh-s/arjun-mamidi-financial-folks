import { createClient } from '@supabase/supabase-js';

// Use environment variables with fallbacks for build time
// Supabase disconnected - set these to empty/null to disable connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key exists:', !!supabaseAnonKey);
console.log('Environment check:', {
  url: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  isValidUrl: supabaseUrl?.includes('supabase.co'),
  isValidKey: supabaseAnonKey && supabaseAnonKey.length > 50
});

// Only create client if we have valid credentials
export const supabase = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_url_here' && 
  supabaseAnonKey !== 'your_supabase_anon_key_here'
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false // Disable auth for public access
      }
    })
  : null;

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const isConfigured = supabase !== null && 
    supabaseUrl && 
    supabaseAnonKey &&
    supabaseUrl.includes('supabase.co') &&
    supabaseAnonKey.length > 50; // Basic validation
  
  console.log('Supabase configured:', isConfigured);
  console.log('Configuration details:', {
    hasSupabaseClient: !!supabase,
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlValid: supabaseUrl?.includes('supabase.co'),
    keyValid: supabaseAnonKey && supabaseAnonKey.length > 50
  });
  
  return isConfigured;
};

// Helper function to safely execute Supabase operations
export const safeSupabaseOperation = async <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  if (!supabase || !isSupabaseConfigured()) {
    console.warn('Supabase not configured properly, using fallback');
    return fallback;
  }
  
  try {
    const result = await operation();
    console.log('Supabase operation successful');
    return result;
  } catch (error: any) {
    // Don't log PGRST116 errors as they're expected when no rows are found
    if (error?.code !== 'PGRST116') {
      console.error('Supabase operation failed:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
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
    };
  };
};
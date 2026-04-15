'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, safeSupabaseOperation, getSupabaseDiagnostics } from '@/lib/supabase';
import { SimpleBlogEditor } from '@/components/simple-blog-editor';
import {
  DEFAULT_RESOURCE_STYLE,
  parseResourceStyle,
  RESOURCE_STYLE_OPTIONS,
  ResourceStyleKey,
  serializeResourceDescription,
} from '@/lib/resource-style';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  published: boolean;
  created_at: string;
  slug: string;
  content?: string;
  featured_image?: string;
}

interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  author_email: string;
  content: string;
  approved: boolean;
  created_at: string;
}

interface CommunityMember {
  id: string;
  full_name: string;
  email: string;
  member_type: string;
  approved: boolean;
  created_at: string;
}

interface ContactQuestion {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  replied: boolean;
  admin_notes: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  link: string;
  created_at: string;
  updated_at: string;
  display_order: number;
}

interface GalleryPhoto {
  id: string;
  photo_url: string;
  caption: string;
  created_at: string;
  display_order: number;
}

interface AdminPageProps {
  isActive: boolean;
}

export function AdminPage({ isActive }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [questions, setQuestions] = useState<ContactQuestion[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingNewsletter, setSendingNewsletter] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    excerpt: '',
    featured_image: '',
    category: '',
    author: 'Arjun Mamidi',
    slug: '',
    created_at: new Date().toISOString().split('T')[0]
  });
  const [savingPost, setSavingPost] = useState(false);
  const [showCreateResource, setShowCreateResource] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    link: '',
    styleKey: DEFAULT_RESOURCE_STYLE as ResourceStyleKey,
  });
  const [savingResource, setSavingResource] = useState(false);
  const [showCreatePhoto, setShowCreatePhoto] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [newPhoto, setNewPhoto] = useState({ photo_url: '', caption: '' });
  const [savingPhoto, setSavingPhoto] = useState(false);

  // Simple admin password - in production, use proper authentication
  const ADMIN_PASSWORD = 'mangorocks!';

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured()) return;

    try {
      const [postsResult, commentsResult, questionsResult, resourcesResult, galleryResult] = await Promise.all([
        safeSupabaseOperation(
          async () => {
            const res = await supabase!.from('blog_posts').select('*').order('created_at', { ascending: false });
            return res;
          },
          { data: [], error: null, count: null, status: 200, statusText: 'OK' }
        ),
        safeSupabaseOperation(
          async () => {
            const res = await supabase!.from('comments').select('*').order('created_at', { ascending: false });
            return res;
          },
          { data: [], error: null, count: null, status: 200, statusText: 'OK' }
        ),
        safeSupabaseOperation(
          async () => {
            const res = await supabase!.from('contact_questions').select('*').order('created_at', { ascending: false });
            return res;
          },
          { data: [], error: null, count: null, status: 200, statusText: 'OK' }
        ),
        safeSupabaseOperation(
          async () => {
            const res = await supabase!.from('resources').select('*').order('display_order', { ascending: true });
            return res;
          },
          { data: [], error: null, count: null, status: 200, statusText: 'OK' }
        ),
        safeSupabaseOperation(
          async () => {
            const res = await supabase!.from('gallery_photos').select('*').order('display_order', { ascending: true });
            return res;
          },
          { data: [], error: null, count: null, status: 200, statusText: 'OK' }
        )
      ]);

      if (postsResult.data) setPosts(postsResult.data);
      if (commentsResult.data) setComments(commentsResult.data);
      if (questionsResult.data) setQuestions(questionsResult.data);
      if (resourcesResult.data) setResources(resourcesResult.data);
      if (galleryResult.data) setGalleryPhotos(galleryResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  const checkConnection = useCallback(async () => {
    setLoading(true);
    setConnectionStatus('checking');
    
    if (!isSupabaseConfigured()) {
      setConnectionStatus('disconnected');
      setLoading(false);
      return;
    }

    try {
      // Test the connection by trying to fetch from a table
      const result = await safeSupabaseOperation(
        async () => {
          const { data, error } = await supabase!.from('blog_posts').select('count').limit(1);
          if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found" which is fine
            throw error;
          }
          return true;
        },
        false
      );
      
      if (result !== false) {
        setConnectionStatus('connected');
        await fetchData();
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    if (isActive) {
      // Check if already authenticated
      const savedAuth = localStorage.getItem('financial_folks_admin_auth');
      if (savedAuth === 'authenticated') {
        setIsAuthenticated(true);
        checkConnection();
      } else {
        setLoading(false);
      }
    }
  }, [isActive, checkConnection]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setAuthError('');
      localStorage.setItem('financial_folks_admin_auth', 'authenticated');
      checkConnection();
    } else {
      setAuthError('Invalid password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('financial_folks_admin_auth');
    setPassword('');
    setAuthError('');
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return new Date().toISOString().split('T')[0];

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }

    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().split('T')[0];
  };

  const getPostTimestamp = (dateInput: string) => {
    if (!dateInput) {
      return new Date().toISOString();
    }

    return new Date(`${dateInput}T12:00:00`).toISOString();
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConfigured()) {
      alert('Blog post creation is not available at the moment.');
      return;
    }

    setSavingPost(true);

    try {
      const slug = newPost.slug || generateSlug(newPost.title);
      
      const postData = {
        ...newPost,
        slug,
        published: false, // Always create as draft initially
        created_at: getPostTimestamp(newPost.created_at)
      };

      const result = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('blog_posts')
            .insert(postData);
          if (error) throw error;
          return true;
        },
        false
      );

      if (result) {
        alert('Blog post created successfully as a draft!');
        setNewPost({
          title: '',
          content: '',
          excerpt: '',
          featured_image: '',
          category: 'Basics',
          author: 'Arjun Mamidi',
          slug: '',
          created_at: new Date().toISOString().split('T')[0]
        });
        setShowCreatePost(false);
        fetchData();
      } else {
        alert('Error creating blog post. Please try again.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Error creating blog post. Please try again.');
    } finally {
      setSavingPost(false);
    }
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setNewPost({
      title: post.title,
      content: post.content || '',
      excerpt: post.excerpt,
      featured_image: post.featured_image || '',
      category: post.category,
      author: post.author,
      slug: post.slug,
      created_at: formatDateForInput(post.created_at)
    });
  };

  const handleUpdatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConfigured() || !editingPost) {
      alert('Blog post update is not available at the moment.');
      return;
    }

    setSavingPost(true);

    try {
      const slug = newPost.slug || generateSlug(newPost.title);
      
      const postData = {
        ...newPost,
        slug,
        created_at: getPostTimestamp(newPost.created_at),
        updated_at: new Date().toISOString()
      };

      const result = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('blog_posts')
            .update(postData)
            .eq('id', editingPost.id);
          if (error) throw error;
          return true;
        },
        false
      );

      if (result) {
        alert('Blog post updated successfully!');
        setNewPost({
          title: '',
          content: '',
          excerpt: '',
          featured_image: '',
          category: 'Basics',
          author: 'Arjun Mamidi',
          slug: '',
          created_at: new Date().toISOString().split('T')[0]
        });
        setEditingPost(null);
        fetchData();
      } else {
        alert('Error updating blog post. Please try again.');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating blog post. Please try again.');
    } finally {
      setSavingPost(false);
    }
  };

  const cancelEdit = () => {
    setEditingPost(null);
    setNewPost({
      title: '',
      content: '',
      excerpt: '',
      featured_image: '',
      category: 'Basics',
      author: 'Nikhilesh Suravarjala',
      slug: '',
      created_at: new Date().toISOString().split('T')[0]
    });
  };

  const toggleCommentApproved = async (commentId: string, currentStatus: boolean) => {
    if (!isSupabaseConfigured()) {
      alert('Comment moderation is not available at the moment.');
      return;
    }

    try {
      const result = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('comments')
            .update({ approved: !currentStatus })
            .eq('id', commentId);
          if (error) throw error;
          return true;
        },
        false
      );

      if (!result) {
        alert('Error updating comment status');
        return;
      }

      fetchData();
    } catch (error) {
      console.error('Error updating comment:', error);
      alert('Error updating comment status');
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!isSupabaseConfigured()) {
      alert('Comment moderation is not available at the moment.');
      return;
    }

    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const result = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('comments')
            .delete()
            .eq('id', commentId);
          if (error) throw error;
          return true;
        },
        false
      );

      if (!result) {
        alert('Error deleting comment');
        return;
      }

      fetchData();
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Error deleting comment');
    }
  };

  const togglePostPublished = async (postId: string, currentStatus: boolean) => {
    if (!isSupabaseConfigured()) {
      alert('Admin functions are not available at the moment.');
      return;
    }

    try {
      const result = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('blog_posts')
            .update({ published: !currentStatus })
            .eq('id', postId);
          if (error) throw error;
          return true;
        },
        false
      );

      if (!result) {
        alert('Error updating post status');
        return;
      }

      fetchData();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Error updating post status');
    }
  };

  const deletePost = async (postId: string) => {
    if (!isSupabaseConfigured()) {
      alert('Admin functions are not available at the moment.');
      return;
    }

    if (!confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('blog_posts')
            .delete()
            .eq('id', postId);
          if (error) throw error;
          return true;
        },
        false
      );

      if (result) {
        alert('Blog post deleted successfully!');
        fetchData();
      } else {
        alert('Error deleting blog post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting blog post');
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!isSupabaseConfigured()) {
      alert('Admin functions are not available at the moment.');
      return;
    }

    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const result = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('contact_questions')
            .delete()
            .eq('id', questionId);
          if (error) throw error;
          return true;
        },
        false
      );

      if (result) {
        alert('Question deleted successfully!');
        fetchData();
      } else {
        alert('Error deleting question');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Error deleting question');
    }
  };

  const toggleQuestionReplied = async (questionId: string, currentStatus: boolean) => {
    if (!isSupabaseConfigured()) {
      alert('Admin functions are not available at the moment.');
      return;
    }

    try {
      const result = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('contact_questions')
            .update({ replied: !currentStatus })
            .eq('id', questionId);
          if (error) throw error;
          return true;
        },
        false
      );

      if (result) {
        fetchData();
      } else {
        alert('Error updating question status');
      }
    } catch (error) {
      console.error('Error updating question:', error);
      alert('Error updating question status');
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      alert('Resource creation is not available at the moment.');
      return;
    }

    setSavingResource(true);
    try {
      const resourcePayload = {
        title: newResource.title,
        description: serializeResourceDescription(newResource.description, newResource.styleKey),
        link: newResource.link,
      };

      const result = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('resources')
            .insert(resourcePayload);
          if (error) throw error;
          return true;
        },
        false
      );

      if (result) {
        alert('Resource created successfully!');
        setNewResource({ title: '', description: '', link: '', styleKey: DEFAULT_RESOURCE_STYLE });
        setShowCreateResource(false);
        fetchData();
      } else {
        alert('Error creating resource. Please try again.');
      }
    } catch (error) {
      console.error('Error creating resource:', error);
      alert('Error creating resource. Please try again.');
    } finally {
      setSavingResource(false);
    }
  };

  const handleUpdateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured() || !editingResource) {
      alert('Resource update is not available at the moment.');
      return;
    }

    setSavingResource(true);
    try {
      const resourcePayload = {
        title: newResource.title,
        description: serializeResourceDescription(newResource.description, newResource.styleKey),
        link: newResource.link,
        updated_at: new Date().toISOString(),
      };

      const result = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('resources')
            .update(resourcePayload)
            .eq('id', editingResource.id);
          if (error) throw error;
          return true;
        },
        false
      );

      if (result) {
        alert('Resource updated successfully!');
        setNewResource({ title: '', description: '', link: '', styleKey: DEFAULT_RESOURCE_STYLE });
        setEditingResource(null);
        fetchData();
      } else {
        alert('Error updating resource. Please try again.');
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      alert('Error updating resource. Please try again.');
    } finally {
      setSavingResource(false);
    }
  };

  const deleteResource = async (resourceId: string) => {
    if (!isSupabaseConfigured()) {
      alert('Admin functions are not available at the moment.');
      return;
    }

    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const result = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('resources')
            .delete()
            .eq('id', resourceId);
          if (error) throw error;
          return true;
        },
        false
      );

      if (result) {
        alert('Resource deleted successfully!');
        fetchData();
      } else {
        alert('Error deleting resource');
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Error deleting resource');
    }
  };

  const handleCreatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured()) {
      alert('Photo upload is not available at the moment.');
      return;
    }

    setSavingPhoto(true);
    try {
      const result = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('gallery_photos')
            .insert(newPhoto);
          if (error) throw error;
          return true;
        },
        false
      );

      if (result) {
        alert('Photo added successfully!');
        setNewPhoto({ photo_url: '', caption: '' });
        setShowCreatePhoto(false);
        fetchData();
      } else {
        alert('Error adding photo. Please try again.');
      }
    } catch (error) {
      console.error('Error adding photo:', error);
      alert('Error adding photo. Please try again.');
    } finally {
      setSavingPhoto(false);
    }
  };

  const handleUpdatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseConfigured() || !editingPhoto) {
      alert('Photo update is not available at the moment.');
      return;
    }

    setSavingPhoto(true);
    try {
      const result = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('gallery_photos')
            .update(newPhoto)
            .eq('id', editingPhoto.id);
          if (error) throw error;
          return true;
        },
        false
      );

      if (result) {
        alert('Photo updated successfully!');
        setNewPhoto({ photo_url: '', caption: '' });
        setEditingPhoto(null);
        fetchData();
      } else {
        alert('Error updating photo. Please try again.');
      }
    } catch (error) {
      console.error('Error updating photo:', error);
      alert('Error updating photo. Please try again.');
    } finally {
      setSavingPhoto(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (!isSupabaseConfigured()) {
      alert('Admin functions are not available at the moment.');
      return;
    }

    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const result = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('gallery_photos')
            .delete()
            .eq('id', photoId);
          if (error) throw error;
          return true;
        },
        false
      );

      if (result) {
        alert('Photo deleted successfully!');
        fetchData();
      } else {
        alert('Error deleting photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Error deleting photo');
    }
  };

  if (!isActive) return null;

  // Show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <section id="page-admin" className="page-section active py-16 md:py-24 bg-[var(--bg-soft-light)]">
        <div className="content-container max-w-md mx-auto">
          <div className="bg-[var(--bg-light)] rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <i className="ti ti-shield-lock text-4xl text-[var(--accent-primary)] mb-4"></i>
              <h1 className="text-2xl font-bold text-[var(--text-heading-light)]">Admin Access</h1>
              <p className="text-[var(--text-secondary-light)] mt-2">Enter the admin password to continue</p>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-[var(--text-primary-light)] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="admin-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input w-full"
                  placeholder="Enter admin password"
                  required
                />
              </div>
              
              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {authError}
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-lighter)] text-white font-semibold py-3 px-4 rounded-full transition duration-300"
              >
                Access Admin Dashboard
              </button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-[var(--border-light)] text-center">
              <a href="#home" className="page-link text-[var(--text-secondary-light)] hover:text-[var(--accent-primary)] text-sm">
                ← Back to Home
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (connectionStatus === 'checking') {
    return (
      <section id="page-admin" className="page-section active py-16 md:py-24 bg-[var(--bg-soft-light)]">
        <div className="content-container max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-heading-light)]">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="text-[var(--text-secondary-light)] hover:text-[var(--accent-primary)] text-sm"
            >
              <i className="ti ti-logout mr-1"></i> Logout
            </button>
          </div>
          <div className="text-center py-12">
            <div className="bg-[var(--bg-light)] rounded-lg shadow-lg p-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)] mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">Checking Database Connection</h2>
              <p className="text-secondary">Please wait while we verify your Supabase connection...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (connectionStatus === 'disconnected') {
    const diagnostics = getSupabaseDiagnostics();

    return (
      <section id="page-admin" className="page-section active py-16 md:py-24 bg-[var(--bg-soft-light)]">
        <div className="content-container max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--text-heading-light)]">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="text-[var(--text-secondary-light)] hover:text-[var(--accent-primary)] text-sm"
            >
              <i className="ti ti-logout mr-1"></i> Logout
            </button>
          </div>
          <div className="text-center py-12">
            <div className="bg-[var(--bg-light)] rounded-lg shadow-lg p-8">
              <i className="ti ti-database-off text-4xl text-secondary opacity-30 mb-4"></i>
              <h2 className="text-xl font-semibold mb-2">Database Not Connected</h2>
              <p className="text-secondary mb-6">
                Unable to connect to Supabase. Check the diagnostics below for details.
              </p>
              <div className="text-left max-w-2xl mx-auto space-y-4">
                <div className="bg-[var(--bg-soft-light)] p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🔍 Environment Diagnostics</h3>
                  <div className="text-sm text-secondary space-y-1 font-mono">
                    <div className="flex justify-between">
                      <span>Supabase URL:</span>
                      <span className={diagnostics.url === '(not set)' ? 'text-red-600' : 'text-green-600'}>
                        {diagnostics.url === '(not set)' ? '❌ Not Set' : `✅ ${diagnostics.url.substring(0, 30)}...`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>URL Length:</span>
                      <span className={diagnostics.urlLength === 0 ? 'text-red-600' : 'text-green-600'}>
                        {diagnostics.urlLength === 0 ? '❌ 0' : `✅ ${diagnostics.urlLength}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Anon Key Length:</span>
                      <span className={diagnostics.keyLength === 0 ? 'text-red-600' : 'text-green-600'}>
                        {diagnostics.keyLength === 0 ? '❌ 0' : `✅ ${diagnostics.keyLength}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Client Created:</span>
                      <span className={diagnostics.hasClient ? 'text-green-600' : 'text-red-600'}>
                        {diagnostics.hasClient ? '✅ Yes' : '❌ No'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="bg-[var(--bg-soft-light)] p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🔄 Troubleshooting</h3>
                  <ul className="text-sm text-secondary space-y-1">
                    {diagnostics.urlLength === 0 && (
                      <li className="text-red-600">• <strong>Environment variables are missing!</strong> Configure NEXT_PUBLIC_SUPABASE_URL in deployment settings</li>
                    )}
                    {diagnostics.keyLength === 0 && (
                      <li className="text-red-600">• <strong>API key is missing!</strong> Configure NEXT_PUBLIC_SUPABASE_ANON_KEY in deployment settings</li>
                    )}
                    {diagnostics.urlLength > 0 && diagnostics.keyLength > 0 && (
                      <>
                        <li>• Check your Supabase project status at supabase.com</li>
                        <li>• Verify your API keys are correct</li>
                        <li>• Ensure your database is running</li>
                        <li>• Check browser console for detailed error messages</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
              <button
                onClick={checkConnection}
                className="mt-6 inline-flex items-center justify-center bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-lighter)] text-white font-semibold px-6 py-2.5 rounded-full shadow-md text-sm transition duration-300"
              >
                <i className="ti ti-refresh mr-2"></i>
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="page-admin" className="page-section active py-16 md:py-24 bg-[var(--bg-soft-light)]">
      <div className="content-container max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-heading-light)]">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-[var(--text-secondary-light)] hover:text-[var(--accent-primary)] text-sm"
          >
            <i className="ti ti-logout mr-1"></i> Logout
          </button>
        </div>
        
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'posts'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-light)] text-[var(--text-primary-light)] hover:bg-[var(--accent-primary)]/10'
              }`}
            >
              Blog Posts ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'comments'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-light)] text-[var(--text-primary-light)] hover:bg-[var(--accent-primary)]/10'
              }`}
            >
              Comment Approval ({comments.length})
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'questions'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-light)] text-[var(--text-primary-light)] hover:bg-[var(--accent-primary)]/10'
              }`}
            >
              Questions ({questions.length})
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'resources'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-light)] text-[var(--text-primary-light)] hover:bg-[var(--accent-primary)]/10'
              }`}
            >
              Resources ({resources.length})
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'gallery'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-light)] text-[var(--text-primary-light)] hover:bg-[var(--accent-primary)]/10'
              }`}
            >
              Gallery ({galleryPhotos.length})
            </button>
          </div>
          <p className="text-center text-sm text-[var(--text-secondary-light)]">
            Approve visitor comments in the <span className="font-semibold text-[var(--text-heading-light)]">Comment Approval</span> tab. Change a blog post&apos;s display date in the <span className="font-semibold text-[var(--text-heading-light)]">Post Date</span> field when creating or editing a post.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
            <p className="mt-4 text-secondary">Loading...</p>
          </div>
        ) : (
          <>
            {activeTab === 'posts' && (
              <div className="bg-[var(--bg-light)] rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-[var(--border-light)] flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">Blog Posts Management</h2>
                    <p className="text-sm text-secondary mt-1">Create, edit, and manage blog posts</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreatePost(true);
                      setEditingPost(null);
                      setNewPost({
                        title: '',
                        content: '',
                        excerpt: '',
                        featured_image: '',
                        category: 'Basics',
                        author: 'Arjun Mamidi',
                        slug: '',
                        created_at: new Date().toISOString().split('T')[0]
                      });
                    }}
                    className="inline-flex items-center bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-lighter)] text-white font-semibold px-4 py-2 rounded-full text-sm transition duration-300"
                  >
                    <i className="ti ti-plus mr-2"></i>
                    Create New Post
                  </button>
                </div>

                {(showCreatePost || editingPost) && (
                  <div className="p-6 border-b border-[var(--border-light)] bg-[var(--bg-soft-light)]">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold">
                        {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowCreatePost(false);
                          cancelEdit();
                        }}
                        className="text-[var(--text-secondary-light)] hover:text-[var(--text-primary-light)]"
                      >
                        <i className="ti ti-x text-xl"></i>
                      </button>
                    </div>
                    
                    <form onSubmit={editingPost ? handleUpdatePost : handleCreatePost} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="form-label">Title *</label>
                          <input
                            type="text"
                            required
                            className="form-input"
                            value={newPost.title}
                            onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                            placeholder="Enter an engaging blog post title"
                          />
                        </div>
                        <div>
                          <label className="form-label">Category (Optional - not used for filtering)</label>
                          <input
                            type="text"
                            className="form-input"
                            value={newPost.category}
                            onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                            placeholder="Optional category tag"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="form-label">Excerpt *</label>
                        <textarea
                          required
                          rows={2}
                          className="form-textarea"
                          value={newPost.excerpt}
                          onChange={(e) => setNewPost({...newPost, excerpt: e.target.value})}
                          placeholder="Write a compelling summary that will appear in the blog listing"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Featured Image URL</label>
                        <input
                          type="url"
                          className="form-input"
                          value={newPost.featured_image}
                          onChange={(e) => setNewPost({...newPost, featured_image: e.target.value})}
                          placeholder="https://i.imgur.com/YvVx8kT.png"
                        />
                      </div>
                      
                      <div>
                        <label className="form-label">Content *</label>
                        <SimpleBlogEditor
                          value={newPost.content}
                          onChange={(content) => setNewPost({...newPost, content})}
                          placeholder="Start writing your blog post here..."
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="form-label">Author</label>
                          <input
                            type="text"
                            className="form-input"
                            value={newPost.author}
                            onChange={(e) => setNewPost({...newPost, author: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="form-label">Post Date (editable)</label>
                          <input
                            type="date"
                            className="form-input"
                            value={newPost.created_at}
                            onChange={(e) => setNewPost({...newPost, created_at: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="form-label">Custom Slug (optional)</label>
                          <input
                            type="text"
                            className="form-input"
                            value={newPost.slug}
                            onChange={(e) => setNewPost({...newPost, slug: e.target.value})}
                            placeholder="custom-url-slug (auto-generated if empty)"
                          />
                        </div>
                      </div>
                      
                      <div className="flex gap-3 pt-4 border-t border-[var(--border-light)]">
                        <button
                          type="submit"
                          disabled={savingPost}
                          className="inline-flex items-center bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-lighter)] text-white font-semibold px-6 py-2.5 rounded-full text-sm transition duration-300 disabled:opacity-50"
                        >
                          {savingPost ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {editingPost ? 'Updating...' : 'Creating Draft...'}
                            </>
                          ) : (
                            <>
                              <i className="ti ti-device-floppy mr-2"></i>
                              {editingPost ? 'Update Post' : 'Save as Draft'}
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreatePost(false);
                            cancelEdit();
                          }}
                          className="px-6 py-2.5 border border-[var(--border-light)] text-[var(--text-primary-light)] rounded-lg hover:bg-[var(--bg-soft-light)] transition duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--bg-soft-light)]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-light)]">
                      {posts.map((post) => (
                        <tr key={post.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-[var(--text-heading-light)]">{post.title}</div>
                            <div className="text-sm text-[var(--text-secondary-light)]">{post.excerpt.substring(0, 100)}...</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary-light)]">
                            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              post.published 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300'
                            }`}>
                              {post.published ? 'Published' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary-light)]">
                            {new Date(post.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm space-x-2">
                            <button
                              onClick={() => handleEditPost(post)}
                              className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/60 dark:text-blue-300 rounded text-xs font-medium transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => togglePostPublished(post.id, post.published)}
                              disabled={sendingNewsletter}
                              className={`px-3 py-1 rounded text-xs font-medium transition ${
                                post.published
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/60 dark:text-yellow-300'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/60 dark:text-green-300'
                              } disabled:opacity-50`}
                            >
                              {sendingNewsletter ? 'Publishing...' : (post.published ? 'Unpublish' : 'Publish & Send')}
                            </button>
                            <button
                              onClick={() => deletePost(post.id)}
                              className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/60 dark:text-red-300 rounded text-xs font-medium transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="bg-[var(--bg-light)] rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-[var(--border-light)]">
                  <h2 className="text-xl font-semibold">Comment Approval</h2>
                  <p className="text-sm text-secondary mt-1">Approve, unapprove, or delete blog comments before they appear on the public site</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--bg-soft-light)]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Post</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Comment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-light)]">
                      {comments.map((comment) => {
                        const relatedPost = posts.find((post) => post.slug === comment.post_id);

                        return (
                          <tr key={comment.id}>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-[var(--text-heading-light)]">{comment.author_name}</div>
                              <div className="text-sm text-[var(--text-secondary-light)]">{comment.author_email}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-[var(--text-secondary-light)]">
                              {relatedPost?.title || comment.post_id}
                            </td>
                            <td className="px-6 py-4 text-sm text-[var(--text-secondary-light)]">
                              {comment.content.substring(0, 120)}{comment.content.length > 120 ? '...' : ''}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                comment.approved
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300'
                              }`}>
                                {comment.approved ? 'Approved' : 'Pending'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-[var(--text-secondary-light)]">
                              {new Date(comment.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm space-x-2">
                              <button
                                onClick={() => toggleCommentApproved(comment.id, comment.approved)}
                                className={`px-3 py-1 rounded text-xs font-medium transition ${
                                  comment.approved
                                    ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/60 dark:text-yellow-300'
                                    : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/60 dark:text-green-300'
                                }`}
                              >
                                {comment.approved ? 'Unapprove' : 'Approve'}
                              </button>
                              <button
                                onClick={() => deleteComment(comment.id)}
                                className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/60 dark:text-red-300 rounded text-xs font-medium transition"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'questions' && (
              <div className="bg-[var(--bg-light)] rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-[var(--border-light)]">
                  <h2 className="text-xl font-semibold">Questions</h2>
                  <p className="text-sm text-secondary mt-1">View and manage questions from visitors</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--bg-soft-light)]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Message</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Submitted</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-light)]">
                      {questions.map((question) => (
                        <tr key={question.id}>
                          <td className="px-6 py-4 text-sm font-medium text-[var(--text-heading-light)]">{question.name}</td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary-light)]">
                            <a
                              href={`mailto:${question.email}?subject=${encodeURIComponent(`Re: ${question.subject || 'Your Financial Folks question'}`)}`}
                              className="page-link text-[var(--accent-primary)] hover:text-[var(--accent-primary-lighter)]"
                            >
                              {question.email}
                            </a>
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary-light)]">{question.subject}</td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary-light)]">
                            {question.message.substring(0, 100)}{question.message.length > 100 ? '...' : ''}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              question.replied
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300'
                            }`}>
                              {question.replied ? 'Replied' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary-light)]">
                            {new Date(question.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm space-x-2">
                            <a
                              href={`mailto:${question.email}?subject=${encodeURIComponent(`Re: ${question.subject || 'Your Financial Folks question'}`)}`}
                              className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/60 dark:text-blue-300 rounded text-xs font-medium transition"
                            >
                              Email
                            </a>
                            <button
                              onClick={() => toggleQuestionReplied(question.id, question.replied)}
                              className={`px-3 py-1 rounded text-xs font-medium transition ${
                                question.replied
                                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/60 dark:text-yellow-300'
                                  : 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/60 dark:text-green-300'
                              }`}
                            >
                              {question.replied ? 'Mark Pending' : 'Mark Replied'}
                            </button>
                            <button
                              onClick={() => deleteQuestion(question.id)}
                              className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/60 dark:text-red-300 rounded text-xs font-medium transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'resources' && (
              <div className="bg-[var(--bg-light)] rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-[var(--border-light)] flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">Resources Management</h2>
                    <p className="text-sm text-secondary mt-1">Add and manage educational resources</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreateResource(true);
                      setEditingResource(null);
                      setNewResource({ title: '', description: '', link: '', styleKey: DEFAULT_RESOURCE_STYLE });
                    }}
                    className="inline-flex items-center bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-lighter)] text-white font-semibold px-4 py-2 rounded-full text-sm transition duration-300"
                  >
                    <i className="ti ti-plus mr-2"></i>
                    Add Resource
                  </button>
                </div>

                {(showCreateResource || editingResource) && (
                  <div className="p-6 border-b border-[var(--border-light)] bg-[var(--bg-soft-light)]">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold">
                        {editingResource ? 'Edit Resource' : 'Add New Resource'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowCreateResource(false);
                          setEditingResource(null);
                          setNewResource({ title: '', description: '', link: '', styleKey: DEFAULT_RESOURCE_STYLE });
                        }}
                        className="text-[var(--text-secondary-light)] hover:text-[var(--text-primary-light)]"
                      >
                        <i className="ti ti-x text-xl"></i>
                      </button>
                    </div>

                    <form onSubmit={editingResource ? handleUpdateResource : handleCreateResource} className="space-y-4">
                      <div>
                        <label className="form-label">Title *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={newResource.title}
                          onChange={(e) => setNewResource({...newResource, title: e.target.value})}
                          placeholder="Resource title"
                        />
                      </div>

                      <div>
                        <label className="form-label">Description *</label>
                        <textarea
                          required
                          rows={4}
                          className="form-textarea"
                          value={newResource.description}
                          onChange={(e) => setNewResource({...newResource, description: e.target.value})}
                          placeholder="Detailed description of the resource"
                        />
                      </div>

                      <div>
                        <label className="form-label">Icon Style</label>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                          {Object.values(RESOURCE_STYLE_OPTIONS).map((option) => {
                            const isSelected = newResource.styleKey === option.key;

                            return (
                              <button
                                key={option.key}
                                type="button"
                                onClick={() => setNewResource({ ...newResource, styleKey: option.key })}
                                className={`rounded-xl border p-4 text-left transition ${
                                  isSelected
                                    ? 'border-[var(--accent-primary)] bg-white shadow-sm'
                                    : 'border-[var(--border-light)] bg-[var(--bg-light)] hover:border-[var(--accent-primary)]/40'
                                }`}
                              >
                                <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full ${option.iconBgClass}`}>
                                  <i className={`ti ${option.iconClass} text-xl ${option.key === 'brain' ? 'text-[#333333]' : 'text-white'}`}></i>
                                </div>
                                <div className="text-sm font-semibold text-[var(--text-heading-light)]">{option.label}</div>
                                <div className="text-xs text-[var(--text-secondary-light)]">
                                  {option.key === 'classic' && 'Green book style'}
                                  {option.key === 'games' && 'Blue video game style'}
                                  {option.key === 'brain' && 'Yellow brain style'}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="form-label">Link (Google Doc or URL) *</label>
                        <input
                          type="url"
                          required
                          className="form-input"
                          value={newResource.link}
                          onChange={(e) => setNewResource({...newResource, link: e.target.value})}
                          placeholder="https://docs.google.com/..."
                        />
                      </div>

                      <div className="flex gap-3 pt-4 border-t border-[var(--border-light)]">
                        <button
                          type="submit"
                          disabled={savingResource}
                          className="inline-flex items-center bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-lighter)] text-white font-semibold px-6 py-2.5 rounded-full text-sm transition duration-300 disabled:opacity-50"
                        >
                          {savingResource ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {editingResource ? 'Updating...' : 'Creating...'}
                            </>
                          ) : (
                            <>
                              <i className="ti ti-device-floppy mr-2"></i>
                              {editingResource ? 'Update Resource' : 'Add Resource'}
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreateResource(false);
                            setEditingResource(null);
                            setNewResource({ title: '', description: '', link: '', styleKey: DEFAULT_RESOURCE_STYLE });
                          }}
                          className="px-6 py-2.5 border border-[var(--border-light)] text-[var(--text-primary-light)] rounded-lg hover:bg-[var(--bg-soft-light)] transition duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--bg-soft-light)]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Style</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Link</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-light)]">
                      {resources.map((resource) => {
                        const { plainDescription, styleKey } = parseResourceStyle(resource.description);
                        const style = RESOURCE_STYLE_OPTIONS[styleKey];

                        return (
                        <tr key={resource.id}>
                          <td className="px-6 py-4 text-sm">
                            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${style.iconBgClass}`}>
                              <i className={`ti ${style.iconClass} text-lg ${styleKey === 'brain' ? 'text-[#333333]' : 'text-white'}`}></i>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-[var(--text-heading-light)]">{resource.title}</td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary-light)]">
                            {plainDescription.substring(0, 100)}{plainDescription.length > 100 ? '...' : ''}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <a href={resource.link} target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:underline">
                              View Link
                            </a>
                          </td>
                          <td className="px-6 py-4 text-sm space-x-2">
                            <button
                              onClick={() => {
                                const { plainDescription, styleKey } = parseResourceStyle(resource.description);
                                setEditingResource(resource);
                                setNewResource({
                                  title: resource.title,
                                  description: plainDescription,
                                  link: resource.link,
                                  styleKey,
                                });
                              }}
                              className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/60 dark:text-blue-300 rounded text-xs font-medium transition"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteResource(resource.id)}
                              className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/60 dark:text-red-300 rounded text-xs font-medium transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="bg-[var(--bg-light)] rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-[var(--border-light)] flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">Gallery Management</h2>
                    <p className="text-sm text-secondary mt-1">Add and manage gallery photos</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowCreatePhoto(true);
                      setEditingPhoto(null);
                      setNewPhoto({ photo_url: '', caption: '' });
                    }}
                    className="inline-flex items-center bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-lighter)] text-white font-semibold px-4 py-2 rounded-full text-sm transition duration-300"
                  >
                    <i className="ti ti-plus mr-2"></i>
                    Add Photo
                  </button>
                </div>

                {(showCreatePhoto || editingPhoto) && (
                  <div className="p-6 border-b border-[var(--border-light)] bg-[var(--bg-soft-light)]">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-semibold">
                        {editingPhoto ? 'Edit Photo' : 'Add New Photo'}
                      </h3>
                      <button
                        onClick={() => {
                          setShowCreatePhoto(false);
                          setEditingPhoto(null);
                          setNewPhoto({ photo_url: '', caption: '' });
                        }}
                        className="text-[var(--text-secondary-light)] hover:text-[var(--text-primary-light)]"
                      >
                        <i className="ti ti-x text-xl"></i>
                      </button>
                    </div>

                    <form onSubmit={editingPhoto ? handleUpdatePhoto : handleCreatePhoto} className="space-y-4">
                      <div>
                        <label className="form-label">Photo URL (Imgur or other) *</label>
                        <input
                          type="url"
                          required
                          className="form-input"
                          value={newPhoto.photo_url}
                          onChange={(e) => setNewPhoto({...newPhoto, photo_url: e.target.value})}
                          placeholder="https://i.imgur.com/..."
                        />
                      </div>

                      <div>
                        <label className="form-label">Caption</label>
                        <textarea
                          rows={3}
                          className="form-textarea"
                          value={newPhoto.caption}
                          onChange={(e) => setNewPhoto({...newPhoto, caption: e.target.value})}
                          placeholder="Optional caption for the photo"
                        />
                      </div>

                      {newPhoto.photo_url && (
                        <div className="mt-4">
                          <label className="form-label">Preview</label>
                          <img
                            src={newPhoto.photo_url}
                            alt="Preview"
                            className="max-w-md rounded-lg shadow-md"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      <div className="flex gap-3 pt-4 border-t border-[var(--border-light)]">
                        <button
                          type="submit"
                          disabled={savingPhoto}
                          className="inline-flex items-center bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-lighter)] text-white font-semibold px-6 py-2.5 rounded-full text-sm transition duration-300 disabled:opacity-50"
                        >
                          {savingPhoto ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              {editingPhoto ? 'Updating...' : 'Adding...'}
                            </>
                          ) : (
                            <>
                              <i className="ti ti-device-floppy mr-2"></i>
                              {editingPhoto ? 'Update Photo' : 'Add Photo'}
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCreatePhoto(false);
                            setEditingPhoto(null);
                            setNewPhoto({ photo_url: '', caption: '' });
                          }}
                          className="px-6 py-2.5 border border-[var(--border-light)] text-[var(--text-primary-light)] rounded-lg hover:bg-[var(--bg-soft-light)] transition duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {galleryPhotos.map((photo) => (
                    <div key={photo.id} className="bg-[var(--bg-soft-light)] rounded-lg overflow-hidden shadow-md">
                      <img
                        src={photo.photo_url}
                        alt={photo.caption}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <p className="text-sm text-[var(--text-secondary-light)] mb-3 min-h-[40px]">
                          {photo.caption || 'No caption'}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingPhoto(photo);
                              setNewPhoto({
                                photo_url: photo.photo_url,
                                caption: photo.caption
                              });
                            }}
                            className="flex-1 px-3 py-1.5 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/60 dark:text-blue-300 rounded text-xs font-medium transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deletePhoto(photo.id)}
                            className="flex-1 px-3 py-1.5 bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/60 dark:text-red-300 rounded text-xs font-medium transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

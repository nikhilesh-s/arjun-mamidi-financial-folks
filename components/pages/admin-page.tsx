'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, safeSupabaseOperation } from '@/lib/supabase';
import { SimpleBlogEditor } from '@/components/simple-blog-editor';

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

interface CommunityMember {
  id: string;
  full_name: string;
  email: string;
  member_type: string;
  approved: boolean;
  created_at: string;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribed_at: string;
  active: boolean;
}

interface AdminPageProps {
  isActive: boolean;
}

export function AdminPage({ isActive }: AdminPageProps) {
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
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
    slug: ''
  });
  const [savingPost, setSavingPost] = useState(false);

  // Simple admin password - in production, use proper authentication
  const ADMIN_PASSWORD = 'mangorocks!';

  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured()) return;

    try {
      const [postsResult, membersResult, subscribersResult] = await Promise.all([
        safeSupabaseOperation(
          async () => {
            const res = await supabase!.from('blog_posts').select('*').order('created_at', { ascending: false });
            return res;
          },
          { data: [], error: null, count: null, status: 200, statusText: 'OK' }
        ),
        safeSupabaseOperation(
          async () => {
            const res = await supabase!.from('community_members').select('*').order('created_at', { ascending: false });
            return res;
          },
          { data: [], error: null, count: null, status: 200, statusText: 'OK' }
        ),
        safeSupabaseOperation(
          async () => {
            const res = await supabase!.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false });
            return res;
          },
          { data: [], error: null, count: null, status: 200, statusText: 'OK' }
        )
      ]);

      if (postsResult.data) setPosts(postsResult.data);
      if (membersResult.data) setMembers(membersResult.data);
      if (subscribersResult.data) setSubscribers(subscribersResult.data);
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
        published: false // Always create as draft initially
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
          author: 'Nikhilesh Suravarjala',
          slug: ''
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
      slug: post.slug
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
          author: 'Nikhilesh Suravarjala',
          slug: ''
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
      slug: ''
    });
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

      // If publishing a post, send newsletter emails
      if (!currentStatus) {
        const post = posts.find(p => p.id === postId);
        if (post) {
          await sendNewsletterEmails(post);
        }
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

  const sendNewsletterEmails = async (post: BlogPost) => {
    if (!isSupabaseConfigured()) return;

    setSendingNewsletter(true);
    try {
      const activeSubscribers = subscribers.filter(sub => sub.active);
      let successCount = 0;
      
      for (const subscriber of activeSubscribers) {
        try {
          const result = await safeSupabaseOperation(
            async () => {
              const { error } = await supabase!.functions.invoke('send-newsletter-email', {
                body: {
                  email: subscriber.email,
                  blogTitle: post.title,
                  blogSlug: post.slug
                }
              });
              if (error) throw error;
              return true;
            },
            false
          );
          
          if (result) successCount++;
        } catch (error) {
          console.error(`Failed to send email to ${subscriber.email}:`, error);
        }
      }
      
      alert(`Newsletter sent to ${successCount} out of ${activeSubscribers.length} subscribers!`);
    } catch (error) {
      console.error('Error sending newsletter:', error);
      alert('Error sending newsletter emails');
    } finally {
      setSendingNewsletter(false);
    }
  };

  const approveMember = async (memberId: string) => {
    if (!isSupabaseConfigured()) {
      alert('Admin functions are not available at the moment.');
      return;
    }

    try {
      const result = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('community_members')
            .update({ approved: true })
            .eq('id', memberId);
          if (error) throw error;
          return true;
        },
        false
      );

      if (result) {
        fetchData();
      } else {
        alert('Error approving member');
      }
    } catch (error) {
      console.error('Error approving member:', error);
      alert('Error approving member');
    }
  };

  const deleteMember = async (memberId: string) => {
    if (!isSupabaseConfigured()) {
      alert('Admin functions are not available at the moment.');
      return;
    }

    if (!confirm('Are you sure you want to delete this member?')) return;
    
    try {
      const result = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('community_members')
            .delete()
            .eq('id', memberId);
          if (error) throw error;
          return true;
        },
        false
      );

      if (result) {
        fetchData();
      } else {
        alert('Error deleting member');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Error deleting member');
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
                To use admin functions, you need to connect to Supabase. The database appears to be properly configured but not responding.
              </p>
              <div className="text-left max-w-2xl mx-auto space-y-4">
                <div className="bg-[var(--bg-soft-light)] p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">✅ Configuration Status</h3>
                  <p className="text-sm text-secondary">
                    Environment variables are properly set. The issue may be temporary.
                  </p>
                </div>
                <div className="bg-[var(--bg-soft-light)] p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">🔄 Troubleshooting</h3>
                  <ul className="text-sm text-secondary space-y-1">
                    <li>• Check your Supabase project status</li>
                    <li>• Verify your API keys are correct</li>
                    <li>• Ensure your database is running</li>
                    <li>• Check for any service outages</li>
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
              onClick={() => setActiveTab('members')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'members'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-light)] text-[var(--text-primary-light)] hover:bg-[var(--accent-primary)]/10'
              }`}
            >
              Members ({members.filter(m => !m.approved).length} pending)
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'subscribers'
                  ? 'bg-[var(--accent-primary)] text-white'
                  : 'bg-[var(--bg-light)] text-[var(--text-primary-light)] hover:bg-[var(--accent-primary)]/10'
              }`}
            >
              Newsletter ({subscribers.filter(s => s.active).length} active)
            </button>
          </div>
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
                        author: 'Nikhilesh Suravarjala',
                        slug: ''
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

            {activeTab === 'members' && (
              <div className="bg-[var(--bg-light)] rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-[var(--border-light)]">
                  <h2 className="text-xl font-semibold">Community Members</h2>
                  <p className="text-sm text-secondary mt-1">Review and approve member applications</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--bg-soft-light)]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Applied</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-light)]">
                      {members.map((member) => (
                        <tr key={member.id}>
                          <td className="px-6 py-4 text-sm font-medium text-[var(--text-heading-light)]">{member.full_name}</td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary-light)]">{member.email}</td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary-light)] capitalize">{member.member_type}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              member.approved 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/60 dark:text-yellow-300'
                            }`}>
                              {member.approved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary-light)]">
                            {new Date(member.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm space-x-2">
                            {!member.approved && (
                              <button
                                onClick={() => approveMember(member.id)}
                                className="px-3 py-1 bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/60 dark:text-green-300 rounded text-xs font-medium transition"
                              >
                                Approve
                              </button>
                            )}
                            <button
                              onClick={() => deleteMember(member.id)}
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

            {activeTab === 'subscribers' && (
              <div className="bg-[var(--bg-light)] rounded-lg shadow-lg overflow-hidden">
                <div className="p-6 border-b border-[var(--border-light)]">
                  <h2 className="text-xl font-semibold">Newsletter Subscribers</h2>
                  <p className="text-sm text-secondary mt-1">View and manage newsletter subscriptions</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--bg-soft-light)]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-secondary-light)] uppercase tracking-wider">Subscribed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-light)]">
                      {subscribers.map((subscriber) => (
                        <tr key={subscriber.id}>
                          <td className="px-6 py-4 text-sm font-medium text-[var(--text-heading-light)]">{subscriber.email}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              subscriber.active 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/60 dark:text-green-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/60 dark:text-gray-300'
                            }`}>
                              {subscriber.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-[var(--text-secondary-light)]">
                            {new Date(subscriber.subscribed_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
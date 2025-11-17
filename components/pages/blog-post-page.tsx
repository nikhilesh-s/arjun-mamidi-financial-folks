'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, safeSupabaseOperation } from '@/lib/supabase';
import Image from 'next/image';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  featured_image: string | null;
  category: string;
  author: string;
  created_at: string;
  slug: string;
}

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
  approved: boolean;
}

interface BlogPostPageProps {
  isActive: boolean;
  postSlug: string;
}

export function BlogPostPage({ isActive, postSlug }: BlogPostPageProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentForm, setCommentForm] = useState({
    author_name: '',
    author_email: '',
    content: ''
  });
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchPost = useCallback(async () => {
    try {
      if (!isSupabaseConfigured()) {
        // No placeholder posts
        setPost(null);
        setLoading(false);
        return;
      }

      const result = await safeSupabaseOperation(
        async () => {
          const { data, error } = await supabase!
            .from('blog_posts')
            .select('*')
            .eq('slug', postSlug)
            .eq('published', true)
            .single()
            .then(res => res);
          if (error) throw error;
          return data;
        },
        null
      );

      setPost(result);
    } catch (error) {
      console.error('Error fetching post:', error);
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [postSlug]);

  const fetchComments = useCallback(async () => {
    try {
      if (!isSupabaseConfigured()) {
        setComments([]);
        return;
      }

      const result = await safeSupabaseOperation(
        async () => {
          const { data, error } = await supabase!
            .from('comments')
            .select('*')
            .eq('post_id', postSlug)
            .eq('approved', true)
            .order('created_at', { ascending: true })
            .then(res => res);
          if (error) throw error;
          return data || [];
        },
        []
      );

      setComments(result);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setComments([]);
    }
  }, [postSlug]);

  useEffect(() => {
    if (isActive && postSlug) {
      fetchPost();
      fetchComments();
    }
  }, [isActive, postSlug, fetchPost, fetchComments]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConfigured()) {
      alert('Comments are not available at the moment.');
      return;
    }

    setSubmittingComment(true);

    try {
      const result = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('comments')
            .insert({
              post_id: postSlug,
              author_name: commentForm.author_name,
              author_email: commentForm.author_email,
              content: commentForm.content,
              approved: false // Comments need approval
            })
            .then(res => res);
          if (error) throw error;
          return true;
        },
        false
      );

      if (result) {
        setCommentForm({ author_name: '', author_email: '', content: '' });
        alert('Comment submitted! It will appear after approval.');
      } else {
        alert('Error submitting comment. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Error submitting comment. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!isActive) return null;

  if (loading) {
    return (
      <section id="page-blog-post" className="page-section active py-16 md:py-24 bg-[var(--bg-soft-light)]">
        <div className="content-container max-w-4xl mx-auto text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
          <p className="mt-4 text-secondary">Loading post...</p>
        </div>
      </section>
    );
  }

  if (!post) {
    return (
      <section id="page-blog-post" className="page-section active py-16 md:py-24 bg-[var(--bg-soft-light)]">
        <div className="content-container max-w-4xl mx-auto">
          <a href="#blog" className="page-link back-link"><i className="ti ti-arrow-left"></i> Back to Blog</a>
          <div className="placeholder-content">
            <h1 className="text-2xl md:text-3xl font-bold mb-4">Post Not Found</h1>
            <p className="text-secondary">The requested blog post could not be found.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="page-blog-post" className="page-section active py-16 md:py-24 bg-[var(--bg-soft-light)]">
      <div className="content-container max-w-4xl mx-auto">
        <a href="#blog" className="page-link back-link"><i className="ti ti-arrow-left"></i> Back to Blog</a>
        
        <article className="bg-[var(--bg-light)] rounded-2xl shadow-lg overflow-hidden mb-12">
          {post.featured_image && (
            <div className="relative w-full h-64 md:h-80">
              <Image 
                src={post.featured_image} 
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          )}
          
          <div className="p-8">
            <div className="mb-4">
              <span className="category-tag !bg-[#7BC47F] !text-white">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[var(--text-heading-light)]">
              {post.title}
            </h1>
            
            <div className="flex items-center text-sm text-secondary mb-8">
              <span>By {post.author}</span>
              <span className="mx-2">•</span>
              <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
            
            <div 
              className="prose max-w-none text-secondary"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-[var(--bg-light)] rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold mb-6 text-[var(--text-heading-light)]">
            Comments ({comments.length})
          </h3>

          {/* Comment Form */}
          {isSupabaseConfigured() && (
            <form onSubmit={handleCommentSubmit} className="mb-8 p-6 bg-[var(--bg-soft-light)] rounded-xl">
              <h4 className="text-lg font-semibold mb-4">Leave a Comment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="author_name" className="form-label">Name *</label>
                  <input
                    type="text"
                    id="author_name"
                    required
                    className="form-input"
                    value={commentForm.author_name}
                    onChange={(e) => setCommentForm({...commentForm, author_name: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="author_email" className="form-label">Email *</label>
                  <input
                    type="email"
                    id="author_email"
                    required
                    className="form-input"
                    value={commentForm.author_email}
                    onChange={(e) => setCommentForm({...commentForm, author_email: e.target.value})}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label htmlFor="content" className="form-label">Comment *</label>
                <textarea
                  id="content"
                  required
                  rows={4}
                  className="form-textarea"
                  value={commentForm.content}
                  onChange={(e) => setCommentForm({...commentForm, content: e.target.value})}
                />
              </div>
              <button
                type="submit"
                disabled={submittingComment}
                className="inline-flex items-center justify-center bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-lighter)] text-white font-semibold px-6 py-2.5 rounded-full shadow-md text-sm transition duration-300 disabled:opacity-50"
              >
                {submittingComment ? 'Submitting...' : 'Submit Comment'}
              </button>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-secondary text-center py-8">No comments yet. Be the first to comment!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border-b border-[var(--border-light)] pb-6">
                  <div className="flex items-center mb-2">
                    <h5 className="font-semibold text-[var(--text-heading-light)]">{comment.author_name}</h5>
                    <span className="mx-2 text-secondary">•</span>
                    <span className="text-sm text-secondary">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-secondary">{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
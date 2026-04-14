'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured, safeSupabaseOperation } from '@/lib/supabase';
import Image from 'next/image';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  featured_image: string | null;
  category: string;
  author: string;
  created_at: string;
  slug: string;
}

interface BlogPageProps {
  isActive: boolean;
}

export function BlogPage({ isActive }: BlogPageProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All');

  const fetchPosts = useCallback(async () => {
    try {
      if (!isSupabaseConfigured()) {
        // No placeholder posts - return empty array
        setPosts([]);
        setLoading(false);
        return;
      }

      const result = await safeSupabaseOperation(
        async () => {
          const { data, error } = await supabase!
            .from('blog_posts')
            .select('id, title, excerpt, featured_image, category, author, created_at, slug')
            .eq('published', true)
            .order('created_at', { ascending: false })
            .then(res => res);
          if (error) throw error;
          return data || [];
        },
        []
      );

      setPosts(result);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fallback to empty array
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isActive) {
      fetchPosts();
    }
  }, [isActive, fetchPosts]);

  // Generate date filters from posts (month/year format)
  const getDateFilters = () => {
    const dateMap = new Map<string, { display: string; sortKey: number }>();
    posts.forEach(post => {
      const date = new Date(post.created_at);
      const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const sortKey = date.getFullYear() * 12 + date.getMonth(); // Create sortable key
      if (!dateMap.has(monthYear) || dateMap.get(monthYear)!.sortKey < sortKey) {
        dateMap.set(monthYear, { display: monthYear, sortKey });
      }
    });
    const sorted = Array.from(dateMap.values())
      .sort((a, b) => b.sortKey - a.sortKey) // Most recent first
      .map(item => item.display);
    return ['All', ...sorted];
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedDateFilter === 'All') {
      return matchesSearch;
    }
    
    const postDate = new Date(post.created_at);
    const postMonthYear = postDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const matchesDate = postMonthYear === selectedDateFilter;
    
    return matchesSearch && matchesDate;
  });

  const dateFilters = getDateFilters();

  const getDateFilterColor = (dateFilter: string) => {
    // Use the new color scheme
    return '!bg-[#7BC47F] !text-white';
  };

  return (
    <section id="page-blog" className={`page-section py-16 md:py-24 bg-[var(--bg-soft-light)] ${isActive ? 'active' : ''}`}>
      <div className="content-container">
        <h1 className="page-title text-[var(--text-heading-light)] text-center">Weekly Finance Fun</h1>
        <p className="text-lg text-secondary text-center max-w-3xl mx-auto mb-10"> 
          Each week we post a new blog to teach kids about money in fun and simple ways. Topics include saving, budgeting, investing, and smart spending habits. Check back weekly for new lessons.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-12">
          <div className="relative flex-grow w-full sm:w-auto max-w-md">
            <input 
              type="search" 
              placeholder="Search posts..." 
              className="form-input !pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <i className="ti ti-search absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary opacity-60"></i>
          </div>
          <select 
            className="form-select w-full sm:w-auto"
            value={selectedDateFilter}
            onChange={(e) => setSelectedDateFilter(e.target.value)}
          >
            {dateFilters.map(dateFilter => (
              <option key={dateFilter} value={dateFilter}>{dateFilter}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
            <p className="mt-4 text-secondary">Loading posts...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <i className="ti ti-article text-4xl text-secondary opacity-30 mb-4"></i>
            <p className="text-secondary">No posts found. Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <article key={post.id} className={`insight-card flex flex-col group animate-slide-in-up delay-${(index % 6 + 1) * 100}`}>
                <a href={`#blog-post-${post.slug}`} className="page-link block overflow-hidden">
                  <div className="relative w-full h-48">
                    <Image 
                      src={post.featured_image || 'https://images.pexels.com/photos/2280547/pexels-photo-2280547.jpeg'} 
                      alt={post.title} 
                      fill
                      className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </a>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="mb-3">
                    <span className={`category-tag ${getDateFilterColor(new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }))}`}>
                      {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 leading-snug flex-grow">
                    <a href={`#blog-post-${post.slug}`} className="page-link hover:text-[var(--accent-primary)] transition duration-200">
                      {post.title}
                    </a>
                  </h3>
                  <p className="text-sm text-secondary mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="mt-auto pt-3 border-t border-[var(--border-light)] flex justify-between items-center text-xs text-secondary">
                    <span>
                      <i className="ti ti-calendar-event mr-1 opacity-70"></i>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <a
                      href={`#blog-post-${post.slug}`}
                      className="page-link inline-flex items-center hover:text-[var(--accent-primary)] transition"
                    >
                      Read <i className="ti ti-arrow-right ml-1 text-sm"></i>
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

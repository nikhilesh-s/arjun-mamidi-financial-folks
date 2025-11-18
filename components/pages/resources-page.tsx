'use client';

import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, safeSupabaseOperation } from '@/lib/supabase';
import { BOOK_URL } from '@/lib/constants';

interface ResourcesPageProps {
  isActive: boolean;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  link: string;
  display_order: number | null;
}

export function ResourcesPage({ isActive }: ResourcesPageProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      if (!isSupabaseConfigured()) {
        setResources([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const result = await safeSupabaseOperation(
        async () => {
          const { data, error } = await supabase!
            .from('resources')
            .select('*')
            .order('display_order', { ascending: true, nullsFirst: true })
            .order('created_at', { ascending: false })
            .then(res => res);
          if (error) throw error;
          return data || [];
        },
        []
      );
      setResources(result);
      setLoading(false);
    };

    if (isActive) {
      fetchResources();
    }
  }, [isActive]);

  return (
    <section id="page-resources" className={`page-section py-16 md:py-24 bg-[var(--bg-soft-light)] ${isActive ? 'active' : ''}`}>
      <div className="content-container">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-heading-light)] mb-3">Resources</h1>
          <p className="text-lg text-secondary">Activities & Guides for Raising Money-Smart Kids</p>
        </div>
        
        {/* Resources Section */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-[var(--text-heading-light)]">Printable Activities</h2>
          <p className="text-lg text-secondary text-center max-w-4xl mx-auto mb-12">
            Want to help your child learn about saving, spending, and budgeting? Here you'll find fun worksheets and activities that make money lessons simple and engaging. All resources are designed for kids and easy for parents to use at home.
          </p>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
              <p className="mt-4 text-secondary">Loading resources...</p>
            </div>
          ) : resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource, index) => (
                <div key={resource.id} className={`explore-card group animate-slide-in-up delay-${(index % 6 + 1) * 100}`}>
                  <div className="icon-wrapper bg-[var(--accent-primary)] mb-4">
                    <i className="ti ti-book-2 text-white text-xl"></i>
                  </div>
                  <h3 className="card-title text-[var(--text-heading-light)]">{resource.title}</h3>
                  <p className="card-description text-secondary mb-6">{resource.description}</p>
                  <a 
                    href={resource.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-lighter)] text-white font-semibold px-4 py-2.5 rounded-full shadow-md text-sm transition duration-300 transform hover:-translate-y-1"
                  >
                    <i className="ti ti-download mr-2"></i>
                    Open Resource
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[var(--bg-soft-light)] rounded-2xl border-2 border-dashed border-[var(--border-light)]">
              <i className="ti ti-file-text text-4xl text-secondary opacity-30 mb-4"></i>
              <p className="text-secondary">No resources yet. Add some in the admin dashboard!</p>
            </div>
          )}
        </div>

        {/* Book Section */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 text-[var(--text-heading-light)]">Explore My Stock Book for Kids</h2>
          
          <div className="bg-[var(--bg-light)] rounded-2xl shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--accent-yellow)] rounded-full mb-4">
              <i className="ti ti-book text-2xl text-[#333333]"></i>
            </div>
            <p className="text-lg text-secondary mb-6">
              Check out my book designed to make stocks and investing fun, easy, and interactive for kids!
            </p>
            <a href={BOOK_URL} className="page-link inline-flex items-center justify-center bg-[var(--accent-secondary)] hover:bg-[var(--accent-secondary-lighter)] text-white font-semibold px-6 py-3 rounded-full shadow-md transition duration-300 transform hover:-translate-y-1" target="_blank" rel="noopener noreferrer">
              View Book <i className="ti ti-arrow-right ml-2"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

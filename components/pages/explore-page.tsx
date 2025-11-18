'use client';

import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, safeSupabaseOperation } from '@/lib/supabase';

interface ExplorePageProps {
  isActive: boolean;
}

interface GalleryPhoto {
  id: string;
  photo_url: string;
  caption: string | null;
  display_order: number | null;
}

export function ExplorePage({ isActive }: ExplorePageProps) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      if (!isSupabaseConfigured()) {
        setPhotos([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const result = await safeSupabaseOperation(
        async () => {
          const { data, error } = await supabase!
            .from('gallery_photos')
            .select('*')
            .order('display_order', { ascending: true, nullsFirst: true })
            .order('created_at', { ascending: false })
            .then(res => res);
          if (error) throw error;
          return data || [];
        },
        []
      );
      setPhotos(result);
      setLoading(false);
    };

    if (isActive) {
      fetchPhotos();
    }
  }, [isActive]);

  return (
    <section id="page-gallery" className={`page-section py-16 md:py-24 bg-[var(--bg-soft-light)] ${isActive ? 'active' : ''}`}>
      <div className="content-container">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-heading-light)] mb-3">Gallery</h1>
          <p className="text-lg text-secondary">Here you can explore photos of us helping the community learn about personal finance</p>
        </div>

        {loading ? (
          <div className="bg-[var(--bg-light)] rounded-lg shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--bg-accent-light)] rounded-full mb-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
            </div>
            <p className="text-lg text-secondary">Loading gallery photos...</p>
          </div>
        ) : photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo, index) => (
              <div key={photo.id} className={`gallery-card overflow-hidden rounded-2xl shadow-lg border border-[var(--border-light)] animate-slide-in-up delay-${(index % 6 + 1) * 100}`}>
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={photo.photo_url} 
                    alt={photo.caption || 'Gallery photo'}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                {photo.caption && (
                  <div className="p-4 bg-[var(--bg-light)] border-t border-[var(--border-light)]">
                    <p className="text-sm text-secondary">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--bg-light)] rounded-lg shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--bg-accent-light)] rounded-full mb-6">
              <i className="ti ti-camera text-2xl text-[var(--accent-primary)]"></i>
            </div>
            <p className="text-lg text-secondary mb-6">
              Gallery photos will be displayed here soon. Add photos from the admin dashboard to showcase your events!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

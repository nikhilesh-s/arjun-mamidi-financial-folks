'use client';

import { useEffect, Suspense } from 'react';
import { NavBar } from '@/components/navbar';
import { MainContent } from '@/components/main-content';
import { Footer } from '@/components/footer';

function HomeContent() {
  useEffect(() => {
    // Set default hash if none exists
    if (typeof window !== 'undefined' && !window.location.hash) {
      window.location.hash = 'home';
    }
    
    // Initialize scroll handlers
    const navbar = document.getElementById('navbar');
    if (navbar) {
      const scrollThreshold = 50;
      let isScrolled = window.scrollY > scrollThreshold;
      
      const handleScroll = () => {
        const shouldBeScrolled = window.scrollY > scrollThreshold;
        if (shouldBeScrolled !== isScrolled) {
          navbar.classList.toggle('navbar-scrolled', shouldBeScrolled);
          isScrolled = shouldBeScrolled;
        }
      };
      
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  return (
    <>
      <NavBar />
      <MainContent />
      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg-light)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
          <p className="mt-4 text-[var(--text-secondary-light)]">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
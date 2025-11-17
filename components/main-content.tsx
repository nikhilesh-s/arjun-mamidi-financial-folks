'use client';

import { useState, useEffect } from 'react';
import { 
  HomePage, 
  BlogPage, 
  AboutPage, 
  JoinPage, 
  BlogPostPage,
  AdminPage,
  ResourcesPage,
  ExplorePage
} from '@/components/pages';

export function MainContent() {
  const [activePage, setActivePage] = useState('home');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Handle initial page loading based on hash
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.substring(1) || 'home';
      setActivePage(hash);

      // Set up hash change listener
      const handleHashChange = () => {
        const hash = window.location.hash.substring(1) || 'home';
        setActivePage(hash);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };

      window.addEventListener('hashchange', handleHashChange);

      // Set up page link click handlers
      const updateActiveNavLinks = () => {
        const pageLinks = document.querySelectorAll('a.page-link');
        pageLinks.forEach(link => {
          const linkHash = (link as HTMLAnchorElement).getAttribute('href')?.substring(1);
          if (linkHash === hash || 
              (hash === 'home' && (link as HTMLAnchorElement).getAttribute('href') === '#home') || 
              (!hash && (link as HTMLAnchorElement).getAttribute('href') === '#home')) {
            link.classList.add('text-[var(--accent-primary)]');
            link.classList.add('font-semibold');
          } else {
            link.classList.remove('text-[var(--accent-primary)]');
            link.classList.remove('font-semibold');
          }
        });
      };

      // Initial update
      updateActiveNavLinks();

      // Set up animation observers
      const setupAnimations = () => {
        const animatedElements = document.querySelectorAll('.animate-slide-in-up, .animate-fade-in');
        if (window.IntersectionObserver && animatedElements.length > 0) {
          const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -30px 0px" };
          const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                const delayClass = Array.from(entry.target.classList).find(cls => cls.startsWith('delay-'));
                let delayMs = 0;
                if (delayClass) {
                  if (delayClass.includes('[')) { 
                    delayMs = parseInt(delayClass.split('[')[1].replace('ms]', ''), 10); 
                  } else { 
                    delayMs = parseInt(delayClass.replace('delay-', ''), 10); 
                  }
                }
                (entry.target as HTMLElement).style.animationDelay = `${delayMs / 1000}s`;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
              }
            });
          }, observerOptions);
          
          animatedElements.forEach(el => { 
            (el as HTMLElement).style.animationPlayState = 'paused'; 
            animationObserver.observe(el); 
          });
        } else { 
          animatedElements.forEach(el => el.classList.add('is-visible')); 
        }
      };

      // Setup animations after a short delay to ensure DOM is ready
      setTimeout(setupAnimations, 100);

      // Clean up event listeners
      return () => {
        window.removeEventListener('hashchange', handleHashChange);
      };
    }
  }, []);

  // Initialize form event handlers if Join page is active
  useEffect(() => {
    if (activePage === 'join' && isClient && typeof window !== 'undefined') {
      const setupJoinPageHandlers = () => {
        const memberOptions = document.querySelectorAll('.member-type-option');
        const memberTypeInput = document.getElementById('member_type_input');
        
        if (memberOptions.length > 0 && memberTypeInput) {
          memberOptions.forEach(option => {
            const handleClick = () => {
              memberOptions.forEach(opt => opt.classList.remove('selected'));
              option.classList.add('selected');
              (memberTypeInput as HTMLInputElement).value = (option as HTMLElement).dataset.value || '';
            };
            
            option.removeEventListener('click', handleClick);
            option.addEventListener('click', handleClick);
          });
        }
      };

      // Setup handlers after a short delay to ensure DOM is ready
      setTimeout(setupJoinPageHandlers, 100);
    }
  }, [activePage, isClient]);

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <main id="main-content" className="min-h-screen bg-[var(--bg-light)] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
          <p className="mt-4 text-[var(--text-secondary-light)]">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main id="main-content">
      <HomePage isActive={activePage === 'home'} />
      <BlogPage isActive={activePage === 'blog'} />
      <AboutPage isActive={activePage === 'about'} />
      <ResourcesPage isActive={activePage === 'resources'} />
      <ExplorePage isActive={activePage === 'gallery'} />
      <JoinPage isActive={activePage === 'join'} />
      <BlogPostPage isActive={activePage.startsWith('blog-post-')} postSlug={activePage.replace('blog-post-', '')} />
      <AdminPage isActive={activePage === 'admin'} />
    </main>
  );
}
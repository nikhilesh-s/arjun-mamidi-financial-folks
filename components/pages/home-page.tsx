'use client';

import { useState } from 'react';
import { supabase, isSupabaseConfigured, safeSupabaseOperation } from '@/lib/supabase';

interface HomePageProps {
  isActive: boolean;
}

export function HomePage({ isActive }: HomePageProps) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSupabaseConfigured()) {
      alert('Newsletter subscription is not available at the moment. Please try again later.');
      return;
    }

    setSubscribing(true);

    try {
      console.log('Starting newsletter subscription for:', newsletterEmail);

      // First check if email already exists
      const existingResult = await safeSupabaseOperation(
        async () => {
          const { data, error } = await supabase!
            .from('newsletter_subscribers')
            .select('email')
            .eq('email', newsletterEmail)
            .limit(1)
            .then(res => res);
          return { data, error };
        },
        { data: [], error: null }
      );

      if (existingResult.error) {
        console.error('Error checking existing subscriber:', existingResult.error);
        throw existingResult.error;
      }

      if (existingResult.data && existingResult.data.length > 0) {
        alert('You\'re already subscribed to our newsletter!');
        setNewsletterEmail('');
        setSubscribing(false);
        return;
      }

      // Insert email into newsletter_subscribers table
      const insertResult = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('newsletter_subscribers')
            .insert({ email: newsletterEmail })
            .then(res => res);
          if (error) throw error;
          return true;
        },
        false
      );

      if (!insertResult) {
        throw new Error('Failed to add subscription to database');
      }

      console.log('Successfully added to database, now sending emails...');

      // Send confirmation email to subscriber and notification to admin
      try {
        console.log('Invoking send-newsletter-confirmation function...');
        const emailResult = await safeSupabaseOperation(
          async () => {
            const { data, error } = await supabase!.functions.invoke('send-newsletter-confirmation', {
              body: { email: newsletterEmail }
            }).then(res => res);
            return { data, error };
          },
          { data: null, error: new Error('Email service not available') }
        );
        
        console.log('Email function response:', emailResult);
        
        if (emailResult.error) {
          console.error('Failed to send confirmation email:', emailResult.error);
          alert('Subscribed successfully, but there was an issue sending the confirmation email. You\'re still subscribed!');
        } else {
          console.log('Email sent successfully!');
          alert('Successfully subscribed to our newsletter! Check your email for confirmation.');
        }
      } catch (emailError) {
        console.error('Email service error:', emailError);
        alert('Subscribed successfully, but there was an issue sending the confirmation email. You\'re still subscribed!');
      }

      setNewsletterEmail('');
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      alert('Error subscribing to newsletter. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <section id="page-home" className={`page-section ${isActive ? 'active' : ''}`}>
      <div className="overflow-hidden relative pt-0">
        <div className="absolute inset-0 z-0" aria-hidden="true">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-primary)]/5 via-transparent to-[var(--accent-secondary)]/5 opacity-60"></div>
          <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(var(--border-light) 0.5px, transparent 0.5px)', backgroundSize: '12px 12px'}}></div>
        </div>
        <div className="hero-content-container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 xl:gap-24 items-center">
            <div className="animate-fade-in lg:pr-6">
              <span className="inline-flex items-center space-x-2 text-sm font-semibold text-[var(--accent-primary)] mb-5">
                <i className="ti ti-piggy-bank text-base"></i> <span>Financial Literacy for Kids</span>
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter mb-6 !leading-tight"> 
                Financial Literacy for<br/> 
                <span className="text-[var(--accent-primary)]">the Future.</span> 
              </h1>
              <p className="text-lg md:text-xl hero-subtitle text-secondary max-w-xl mb-10"> 
                Here you'll find printable activities, and tips for teaching children how to manage money responsibly. Dive into our weekly blogs, check out our interactive resources, and start your journey toward financial confidence today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in delay-100">
                <a href="#resources" className="page-link hero-button-primary inline-flex items-center justify-center"> 
                  Check Out Resources <i className="ti ti-chevron-right ml-1.5 text-sm"></i> 
                </a>
                <a href="https://www.amazon.com/If-Gave-You-100-Stocks/dp/B0FWH89XGB/ref=sr_1_1" className="page-link hero-button-secondary inline-flex items-center justify-center" target="_blank" rel="noopener noreferrer">
                  Take a look at my book <i className="ti ti-book ml-1.5"></i>
                </a>
              </div>
            </div>
            <div className="animate-fade-in delay-200">
              <div className="hero-image-container aspect-video relative overflow-hidden rounded-2xl shadow-lg bg-[var(--bg-soft-light)] border border-[var(--border-light)]">
                <img
                  src="https://i.imgur.com/TMthiBS.png"
                  alt="Financial Folks - Teaching Kids About Money"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section - Now comes first */}
      <div className="py-16 md:py-20 bg-[var(--bg-soft-light)]">
        <div className="content-container max-w-3xl mx-auto text-center">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">Stay Updated with Financial Folks</h2>
          <p className="text-secondary mb-6">Join our newsletter for the latest blog posts, tips, and resources on teaching kids about money.</p>
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <label htmlFor="footer-email" className="sr-only">Email address</label>
            <input 
              type="email" 
              name="footer-email" 
              id="footer-email" 
              required 
              className="form-input flex-grow !mt-0" 
              placeholder="Your email address"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              disabled={subscribing}
            />
            <button 
              type="submit" 
              disabled={subscribing}
              className="inline-flex items-center justify-center bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-lighter)] text-white font-semibold px-5 py-2.5 rounded-full shadow-md text-sm transition duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {subscribing ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                  Subscribing...
                </>
              ) : (
                <>
                  Subscribe <i className="ti ti-send ml-2 text-xs"></i>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Community Section - Now comes second */}
      <div className="py-16 md:py-24 bg-[var(--bg-light)]">
        <div className="content-container max-w-4xl mx-auto bg-[var(--bg-light)] p-8 md:p-12 rounded-2xl shadow-lg border border-[var(--border-light)]">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 tracking-tight">Join the Community</h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-3">Connect & Learn</h3>
              <p className="text-secondary mb-6">Join our community of parents, educators, and kids learning about money. Share tips, ask questions, and stay updated with the latest financial literacy resources.</p>
              <a href="#join" className="page-link hero-button-primary inline-flex items-center justify-center w-full sm:w-auto"> 
                Ask a Question <i className="ti ti-help-circle ml-1.5"></i> 
              </a>
            </div>
            <div>
              <h4 className="font-semibold mb-2">What you&apos;ll get:</h4>
              <ul className="text-sm text-secondary space-y-2">
                <li className="flex items-start"><span className="inline-block w-2 h-2 rounded-full bg-[var(--accent-yellow)] mr-2 mt-1.5 flex-shrink-0"></span>Access to weekly finance blogs and activities</li>
                <li className="flex items-start"><span className="inline-block w-2 h-2 rounded-full bg-[var(--accent-secondary)] mr-2 mt-1.5 flex-shrink-0"></span>Connect with other parents and educators</li>
                <li className="flex items-start"><span className="inline-block w-2 h-2 rounded-full bg-[var(--accent-primary)] mr-2 mt-1.5 flex-shrink-0"></span>Get answers to your money questions</li>
                <li className="flex items-start"><span className="inline-block w-2 h-2 rounded-full bg-[var(--accent-yellow)] mr-2 mt-1.5 flex-shrink-0"></span>Stay updated with new resources and tips</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
'use client';

import { useRef, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured, safeSupabaseOperation } from '@/lib/supabase';

interface JoinPageProps {
  isActive: boolean;
}

export function JoinPage({ isActive }: JoinPageProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMemberType, setSelectedMemberType] = useState('');

  useEffect(() => {
    if (isActive && formRef.current && typeof window !== 'undefined') {
      const memberOptions = formRef.current.querySelectorAll('.member-type-option');
      const memberTypeInput = formRef.current.querySelector('#member_type_input');
      
      if (memberOptions.length > 0 && memberTypeInput) {
        memberOptions.forEach(option => {
          option.addEventListener('click', () => {
            memberOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            const value = (option as HTMLElement).dataset.value || '';
            (memberTypeInput as HTMLInputElement).value = value;
            setSelectedMemberType(value);
          });
        });
      }
    }
  }, [isActive]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSupabaseConfigured()) {
      alert('Question submissions are not available at the moment. Please try again later.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData(e.target as HTMLFormElement);

      const name = formData.get('full_name') as string || 'Anonymous';
      const memberType = formData.get('member_type') as string;
      const message = formData.get('question') as string;

      const contactData = {
        name: name,
        email: 'noreply@financialfolks.com',
        subject: `Question from ${memberType}`,
        message: message,
      };

      console.log('Submitting question:', contactData);

      const insertResult = await safeSupabaseOperation(
        async () => {
          const { error } = await supabase!
            .from('contact_questions')
            .insert(contactData)
            .then(res => res);
          if (error) throw error;
          return true;
        },
        false
      );

      if (!insertResult) {
        throw new Error('Failed to submit question to database');
      }

      console.log('Successfully added to database, now sending notification email...');

      try {
        console.log('Invoking send-contact-question function...');
        const emailResult = await safeSupabaseOperation(
          async () => {
            const { data, error } = await supabase!.functions.invoke('send-contact-question', {
              body: contactData
            }).then(res => res);
            return { data, error };
          },
          { data: null, error: new Error('Email service not available') }
        );

        console.log('Email function response:', emailResult);

        if (emailResult.error) {
          console.error('Failed to send notification email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Email service error:', emailError);
      }

      alert('Question submitted successfully! I\'ll answer it soon.');

      if (formRef.current) {
        formRef.current.reset();
        setSelectedMemberType('');
        const memberOptions = formRef.current.querySelectorAll('.member-type-option');
        memberOptions.forEach(opt => opt.classList.remove('selected'));
      }
    } catch (error) {
      console.error('Error submitting question:', error);
      alert('Error submitting question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="page-join" className={`page-section py-16 md:py-24 bg-[var(--bg-light)] ${isActive ? 'active' : ''}`}>
      <div className="content-container max-w-4xl mx-auto">
        <h1 className="page-title text-center">Ask a Question</h1>
        <p className="text-lg text-secondary text-center max-w-3xl mx-auto mb-12">Want advice on teaching kids about money? Curious about how to do an activity or worksheet? Ask your question here, and I'll answer it!</p>

        <form onSubmit={handleSubmit} className="space-y-10" ref={formRef}>
          <div className="form-section">
            <h2 className="form-section-title">Who are you?</h2>
            <div id="member-type-selector" className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="member-type-option" data-value="student">
                <h5><i className="ti ti-school mr-1"></i> Student</h5>
                <p>I'm a student learning about money.</p>
              </div>
              <div className="member-type-option" data-value="parent">
                <h5><i className="ti ti-users mr-1"></i> Parent</h5>
                <p>I'm a parent teaching my kids about money.</p>
              </div>
              <div className="member-type-option" data-value="other">
                <h5><i className="ti ti-user mr-1"></i> Other</h5>
                <p>I'm an educator or someone else interested.</p>
              </div>
            </div>
            <input type="hidden" name="member_type" id="member_type_input" required />
            {!selectedMemberType && (
              <p className="text-sm text-red-600 mt-2">Please select who you are</p>
            )}
          </div>

          <div className="form-section">
            <h2 className="form-section-title">Your Question</h2>
            <div>
              <label htmlFor="full_name" className="form-label">Name (Optional)</label>
              <input type="text" name="full_name" id="full_name" className="form-input" placeholder="Your name (optional)" />
            </div>
            <div className="mt-6">
              <label htmlFor="question" className="form-label">Ask a Question *</label>
              <textarea id="question" name="question" rows={6} required className="form-textarea" placeholder="Ask your question about teaching kids about money, using activities, or anything else related to financial literacy..."></textarea>
            </div>
          </div>

          <div className="text-center pt-6 border-t border-[var(--border-light)]">
            <button 
              type="submit" 
              disabled={submitting || !selectedMemberType}
              className="inline-flex items-center justify-center bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-lighter)] text-white font-semibold px-10 py-3.5 rounded-full shadow-lg text-base transition duration-300 transform hover:-translate-y-1 hover:shadow-[0_8px_20px_-5px_rgba(123,196,127,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Question <i className="ti ti-check ml-2"></i>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
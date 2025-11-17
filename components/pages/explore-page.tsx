interface ExplorePageProps {
  isActive: boolean;
}

export function ExplorePage({ isActive }: ExplorePageProps) {
  return (
    <section id="page-gallery" className={`page-section py-16 md:py-24 bg-[var(--bg-soft-light)] ${isActive ? 'active' : ''}`}>
      <div className="content-container">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-heading-light)] mb-3">Gallery</h1>
          <p className="text-lg text-secondary">Here you can explore photos of us helping the community learn about personal finance</p>
        </div>
        
        <div className="bg-[var(--bg-light)] rounded-lg shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--bg-accent-light)] rounded-full mb-6">
            <i className="ti ti-camera text-2xl text-[var(--accent-primary)]"></i>
          </div>
          <p className="text-lg text-secondary mb-6">
            Gallery photos will be displayed here soon. Check back to see our community events and activities!
          </p>
        </div>
      </div>
    </section>
  );
}
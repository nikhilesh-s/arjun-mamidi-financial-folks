export function Footer() {
  return (
    <footer id="footer-section" className="bg-[var(--bg-soft-light)] border-t border-[var(--border-light)] text-secondary py-16">
      <div className="content-container">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2 pr-8">
            <a href="#home" className="page-link inline-flex items-center space-x-2.5 mb-4">
              <span className="text-lg font-semibold text-[var(--text-heading-light)]">Financial Folks</span>
            </a>
            <p className="text-sm leading-relaxed">Making financial literacy simple, fun, and accessible for kids. Teaching smart money habits through activities, blogs, and resources.</p>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-[var(--text-primary-light)] mb-4">Navigation</h5>
            <ul className="space-y-2">
              <li><a href="#blog" className="page-link footer-link">Blog</a></li>
              <li><a href="#resources" className="page-link footer-link">Resources</a></li>
              <li><a href="#gallery" className="page-link footer-link">Gallery</a></li>
              <li><a href="#about" className="page-link footer-link">About</a></li>
              <li><a href="#join" className="page-link footer-link">Ask a Question</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-[var(--text-primary-light)] mb-4">Community</h5>
            <ul className="space-y-2">
              <li><a href="#join" className="page-link footer-link">Ask a Question</a></li>
              <li><a href="#" className="footer-link">Newsletter</a></li>
              <li><a href="#" className="footer-link">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-semibold text-[var(--text-primary-light)] mb-4">Connect</h5>
            <ul className="space-y-2">
              <li><a href="#" className="footer-link">Contact Us</a></li>
              <li><a href="#" className="footer-link">Support</a></li>
              <li>
                <button 
                  onClick={() => {
                    const currentUrl = window.location.href;
                    const adminUrl = currentUrl.includes('#') 
                      ? currentUrl.split('#')[0] + '#admin'
                      : currentUrl + '#admin';
                    window.location.href = adminUrl;
                  }}
                  className="footer-link hover:underline text-left"
                >
                  Admin
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-[var(--border-light)] md:flex md:items-center md:justify-between">
          <p className="text-sm text-[var(--text-secondary-light)] md:order-1">© 2025 Financial Folks by Arjun Mamidi. All rights reserved.</p>
          <div className="mt-4 md:mt-0 md:order-2 text-sm">
            <a href="#" className="footer-link hover:underline mr-4">Privacy Policy</a>
            <a href="#" className="footer-link hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
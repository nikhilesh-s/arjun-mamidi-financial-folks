'use client';

import { useState } from 'react';

export function NavBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav id="navbar" className="navbar">
      <div className="w-full">
        <div className="flex justify-between items-center h-14">
          <a href="#home" className="nav-link page-link flex items-center space-x-2.5 flex-shrink-0 group !p-0">
            <span className="text-xl font-semibold logo-text">Financial Folks</span>
          </a>
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <a href="#blog" className="nav-link page-link"><i className="ti ti-message-circle"></i>Blog</a>
            <a href="#resources" className="nav-link page-link"><i className="ti ti-pencil"></i>Resources</a>
            <a href="#gallery" className="nav-link page-link"><i className="ti ti-camera"></i>Gallery</a>
            <a href="#about" className="nav-link page-link"><i className="ti ti-info-circle"></i>About</a>
            <a href="#join" className="nav-link page-link"><i className="ti ti-help-circle"></i>Ask a Question</a>
          </div>
          <div className="flex items-center space-x-3">
            <a href="#join" className="page-link cta-button hidden sm:inline-flex items-center"> Ask a Question <i className="ti ti-arrow-right ml-1.5 text-sm"></i> </a>
            <div className="md:hidden">
              <button 
                id="mobile-menu-button" 
                aria-expanded={mobileMenuOpen ? 'true' : 'false'} 
                aria-controls="mobile-menu" 
                className="p-2 rounded-lg text-white/85 hover:bg-white/10 focus:outline-none"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">Open main menu</span>
                <i id="mobile-menu-icon-open" className={`ti ti-menu-2 text-2xl ${mobileMenuOpen ? 'hidden' : 'block'}`}></i> 
                <i id="mobile-menu-icon-close" className={`ti ti-x text-2xl ${mobileMenuOpen ? 'block' : 'hidden'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div id="mobile-menu" className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden absolute top-full left-0 right-0 mt-2 bg-[rgba(51,51,51,0.98)] backdrop-blur-xl border border-[rgba(255,255,255,0.1)] rounded-2xl shadow-xl z-40`}>
        <div className="px-5 pt-4 pb-5 space-y-2">
          <a href="#blog" className="mobile-nav-link page-link" onClick={closeMobileMenu}><i className="ti ti-message-circle"></i>Blog</a>
          <a href="#resources" className="mobile-nav-link page-link" onClick={closeMobileMenu}><i className="ti ti-pencil"></i>Resources</a>
          <a href="#gallery" className="mobile-nav-link page-link" onClick={closeMobileMenu}><i className="ti ti-camera"></i>Gallery</a>
          <a href="#about" className="mobile-nav-link page-link" onClick={closeMobileMenu}><i className="ti ti-info-circle"></i>About</a>
          <a href="#join" className="mobile-nav-link page-link" onClick={closeMobileMenu}><i className="ti ti-help-circle"></i>Ask a Question</a>
          <div className="mt-6 pt-5 border-t border-[rgba(255,255,255,0.1)]">
            <a href="#join" className="page-link block w-full text-center bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-lighter)] text-white text-base font-semibold px-4 py-3 rounded-full shadow-sm transition" onClick={closeMobileMenu}>Ask a Question</a>
          </div>
        </div>
      </div>
    </nav>
  );
}
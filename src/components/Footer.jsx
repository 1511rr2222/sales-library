import React from 'react';

function Footer() {
  return (
    <footer className="mt-auto pt-8 pb-8 border-t border-gray-200 flex flex-col items-center gap-4">
    <img src="/logo.png" alt="Footer Logo" className="h-8 w-auto opacity-50" />
    <div className="flex items-center gap-2 text-gray-400 text-xs">
        <span>© Sales Library</span>
        <span>·</span>
        <a
          href="https://github.com/sso06069-crypto/sales-library"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-gray-600 transition-all"
        >
          🔗 GitHub
        </a>
      </div>
    </footer>
  );
}

export default Footer;
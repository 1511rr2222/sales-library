import React from 'react';

function Footer() {
  return (
    // [수정] 1. 테두리(border-t)와 상단 여백 추가
    <footer className="mt-20 pt-8 pb-8 border-t border-gray-200 flex flex-col items-center gap-4">
      
      {/* [추가] 2. 로고 영역 */}
      <img src="/logo.png" alt="Footer Logo" className="h-8 w-auto opacity-50" />

      {/* 3. 기존 내용 */}
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
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const isMain = location.pathname === '/';

  const goBack = () => navigate(-1);
  const goHome = () => navigate('/');

  const BackButton = () =>
    !isMain && (
      <button
        onClick={goBack}
        className="
          w-8 h-8
          flex items-center justify-center
          rounded-full
          text-gray-500
          hover:bg-gray-200
        "
      >
        <ChevronLeft size={20} />
      </button>
    );

  const Title = ({ isMobile = false }) => (
    <button
      onClick={goHome}
      className={isMobile ? 'text-sm font-semibold' : 'text-left'}
    >
      <h1 className={isMobile ? 'text-sm font-semibold text-gray-800' : 'text-3xl font-bold text-gray-800'}>
        {isMobile ? 'Sales Tip Book' : 'Sales Library'}
      </h1>

      {!isMobile && (
        <p className="text-sm text-gray-400 mt-1">
          영업 사원 여러분들의 역량 성장을 위한 케이스 라이브러리입니다.
        </p>
      )}
    </button>
  );

  return (
    <>
      {/* PC HEADER */}
      <div className="hidden md:flex items-center gap-3 py-4 mb-6 border-b border-gray-200">
        <BackButton />
        <Title />
      </div>

      {/* MOBILE HEADER */}
      <div className="md:hidden sticky top-0 z-20 h-12 w-full bg-gray-50 border-b border-gray-200 flex items-center justify-center">
        <div className="absolute left-3">
          <BackButton />
        </div>

        <Title isMobile />
      </div>
    </>
  );
}

export default Header;
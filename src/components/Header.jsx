import React from 'react';
import { useNavigate } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate('/')}
      className="cursor-pointer flex items-center py-4 mb-6 border-b border-gray-200"
    >
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Sales Library</h1>
        <p className="text-sm text-gray-400 mt-1">영업 사원 여러분들의 역량 성장을 위한 케이스 라이브러리입니다.</p>
      </div>
    </div>
  );
}

export default Header;
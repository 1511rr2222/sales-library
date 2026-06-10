import React from 'react';

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
      <div className="text-2xl font-medium text-gray-500 mb-6">
        Loading...
      </div>
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
    </div>
  );
}

export default LoadingSpinner;
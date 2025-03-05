import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-red-600 mx-auto" />
        <h2 className="mt-4 text-xl font-semibold text-gray-900">Loading...</h2>
      </div>
    </div>
  );
};

export default LoadingScreen;
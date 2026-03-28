
import React from 'react';

interface LoaderProps {
  message: string;
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-800/50 rounded-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      <p className="mt-4 text-slate-300 text-sm">{message}</p>
    </div>
  );
};

export default Loader;

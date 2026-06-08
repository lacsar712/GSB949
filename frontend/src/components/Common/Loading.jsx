import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = "default", className = "" }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    default: "w-8 h-8",
    large: "w-12 h-12"
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Loader2 className={`animate-spin text-primary-500 ${sizeClasses[size]}`} />
    </div>
  );
};

export const LoadingSkeleton = ({ count = 1, height = "h-4", width = "w-full", className = "" }) => {
  return (
    <div className={`animate-pulse space-y-3 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={`bg-gray-200 rounded ${height} ${width}`}></div>
      ))}
    </div>
  );
};

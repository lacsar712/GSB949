import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, total, limit, onChange }) => {
  const totalPages = Math.ceil(total / limit);
  
  if (totalPages <= 1) return null;

  const renderPageNumbers = () => {
    const pages = [];
    // Simple pagination logic: show all for now or optimize later
    // Logic: always show 1, last, and current +/- 2
    // For simplicity given the scope, just show all if < 7, else simple ellipses
    
    // Simplest robust version:
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onChange(i)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        page === i
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                >
                    {i}
                </button>
            );
        } else if (i === page - 3 || i === page + 3) {
            pages.push(<span key={i} className="px-2">...</span>);
        }
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center space-x-2 mt-8">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      {renderPageNumbers()}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default Pagination;

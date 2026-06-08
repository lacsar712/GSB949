import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, isDanger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div 
        className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            {isDanger && <AlertTriangle className="w-5 h-5 text-red-500" />}
            {title}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-gray-600 text-base leading-relaxed">
            {message}
          </p>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              isDanger 
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' 
                : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
            }`}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

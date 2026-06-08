import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import classNames from 'classnames';

const ToastContainer = ({ type, message, duration, onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Small delay to allow enter animation
    setTimeout(() => setVisible(true), 10);
    
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for exit animation
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-100',
    error: 'bg-red-50 border-red-100',
    info: 'bg-blue-50 border-blue-100'
  };

  return (
    <div
      className={classNames(
        "fixed top-20 right-4 z-[100] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transition-all duration-300 transform",
        bgColors[type] || bgColors.info,
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      {icons[type] || icons.info}
      <span className="text-sm font-medium text-gray-700">{message}</span>
      <button onClick={() => { setVisible(false); setTimeout(onClose, 300); }} className="ml-2 text-gray-400 hover:text-gray-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const toast = {
  show: (type, message, duration = 3000) => {
    const div = document.createElement('div');
    document.body.appendChild(div);
    const root = createRoot(div);
    
    const cleanup = () => {
      root.unmount();
      document.body.removeChild(div);
    };

    root.render(
      <ToastContainer type={type} message={message} duration={duration} onClose={cleanup} />
    );
  },
  success: (msg, duration) => toast.show('success', msg, duration),
  error: (msg, duration) => toast.show('error', msg, duration),
  info: (msg, duration) => toast.show('info', msg, duration)
};

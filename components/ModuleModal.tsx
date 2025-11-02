import React, { useState, useEffect } from 'react';
import type { Module } from '../types';
import { CloseIcon } from './icons';

interface ModuleModalProps {
  module: Module | null;
  onClose: () => void;
}

const ModuleModal: React.FC<ModuleModalProps> = ({ module, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Trigger the animation shortly after the module is set
    if (module) {
      const timer = setTimeout(() => setIsOpen(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsOpen(false);
    }
  }, [module]);

  const handleClose = () => {
    setIsOpen(false);
    // Allow animation to finish before calling parent's onClose
    setTimeout(onClose, 200); 
  };
  
  if (!module) return null;

  const ActiveComponent = module.component;

  return (
    <div 
      className={`fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div 
        className={`bg-gray-800 border border-cyan-500/20 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transition-all duration-200 ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
        style={{'--tw-shadow': '0 0 25px 0 rgba(0, 255, 255, 0.1)', boxShadow: 'var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)'} as React.CSSProperties}
      >
        <header className="flex items-center justify-between p-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-3">
            <module.icon className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-semibold text-white">{module.title}</h2>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>
        <div className="p-6 overflow-y-auto">
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default ModuleModal;
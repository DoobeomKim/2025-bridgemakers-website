"use client";

import React from "react";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
}

export default function VideoModal({ isOpen, onClose, videoUrl }: VideoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 modal-overlay" onClick={onClose}>
      <div 
        className="relative w-full max-w-5xl aspect-video bg-black rounded-lg overflow-hidden modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <iframe
          className="w-full h-full"
          src={videoUrl}
          title="Video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
} 
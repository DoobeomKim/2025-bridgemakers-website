"use client";

import React from 'react';
import Image from 'next/image';

export default function InstagramFeed() {
  // 임시 인스타그램 포스트 데이터
  const tempPosts = [
    { id: 1, imageUrl: 'https://placehold.co/400x400/1a1f2e/cba967?text=Instagram+1', link: 'https://instagram.com/bridgemakers_gmbh' },
    { id: 2, imageUrl: 'https://placehold.co/400x400/1a1f2e/cba967?text=Instagram+2', link: 'https://instagram.com/bridgemakers_gmbh' },
    { id: 3, imageUrl: 'https://placehold.co/400x400/1a1f2e/cba967?text=Instagram+3', link: 'https://instagram.com/bridgemakers_gmbh' },
    { id: 4, imageUrl: 'https://placehold.co/400x400/1a1f2e/cba967?text=Instagram+4', link: 'https://instagram.com/bridgemakers_gmbh' },
    { id: 5, imageUrl: 'https://placehold.co/400x400/1a1f2e/cba967?text=Instagram+5', link: 'https://instagram.com/bridgemakers_gmbh' },
    { id: 6, imageUrl: 'https://placehold.co/400x400/1a1f2e/cba967?text=Instagram+6', link: 'https://instagram.com/bridgemakers_gmbh' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
      {tempPosts.map((post) => (
        <a 
          key={post.id}
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block aspect-square overflow-hidden rounded-lg transition-transform hover:scale-105"
        >
          <div className="w-full h-full bg-[#1a1f2e] relative">
            <Image 
              src={post.imageUrl}
              alt={`Instagram post ${post.id}`}
              width={400}
              height={400}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <div className="text-white opacity-0 hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </div>
            </div>
          </div>
        </a>
      ))}
    </div>
  );
} 
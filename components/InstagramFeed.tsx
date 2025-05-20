"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import type { InstagramPost, InstagramMediaItem } from '@/lib/instagram';

interface ModalProps {
  post: InstagramPost;
  onClose: () => void;
}

function InstagramModal({ post, onClose }: ModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // 모든 미디어 아이템을 배열로 준비
  const mediaItems = post.children?.data || [{ 
    id: post.id,
    media_type: post.media_type,
    media_url: post.media_url,
    thumbnail_url: post.thumbnail_url
  }];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : mediaItems.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < mediaItems.length - 1 ? prev + 1 : 0));
  };

  const currentMedia = mediaItems[currentIndex];
  const hasMultipleMedia = mediaItems.length > 1;

  // 키보드 네비게이션 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-[#1a1f2e] rounded-lg w-full max-h-[90vh] overflow-y-auto"
        style={{ maxWidth: '90vw', width: '1000px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row">
          {/* 미디어 섹션 */}
          <div className="md:w-3/5 relative">
            <div className="aspect-square relative">
              {currentMedia.media_type === 'VIDEO' ? (
                <video
                  src={currentMedia.media_url}
                  controls
                  className="w-full h-full object-contain bg-black"
                  poster={currentMedia.thumbnail_url}
                  aria-label="Instagram 비디오"
                />
              ) : (
                <Image
                  src={currentMedia.media_url}
                  alt={post.caption || 'Instagram post'}
                  fill
                  className="object-contain"
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
              )}

              {/* 슬라이더 네비게이션 버튼 */}
              {hasMultipleMedia && (
                <>
                  <button
                    onClick={handlePrevious}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                    aria-label="이전 이미지"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all"
                    aria-label="다음 이미지"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* 페이지 인디케이터 */}
              {hasMultipleMedia && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5" role="tablist">
                  {mediaItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      role="tab"
                      aria-selected={index === currentIndex}
                      aria-label={`이미지 ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 콘텐츠 섹션 */}
          <div className="md:w-2/5 flex flex-col">
            {/* 캡션 */}
            {post.caption && (
              <div className="p-4 text-white flex-grow overflow-y-auto">
                <p id="modal-title" className="text-sm whitespace-pre-wrap">{post.caption}</p>
              </div>
            )}

            {/* 하단 버튼 */}
            <div className="p-4 border-t border-gray-700 flex justify-between items-center">
              <a
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#cba967] hover:underline text-sm"
                aria-label="Instagram에서 게시물 보기"
              >
                Instagram에서 보기
              </a>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="모달 닫기"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<InstagramPost | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    // 초기 윈도우 너비 설정
    setWindowWidth(window.innerWidth);

    // 윈도우 리사이즈 이벤트 핸들러
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 화면 크기에 따른 게시물 수 결정
  const getPostCount = () => {
    if (windowWidth < 640) return 6; // 모바일
    if (windowWidth < 768) return 4; // 태블릿
    return 6; // PC
  };

  const fetchInstagramFeed = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/instagram');
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setPosts(data.data);
      } else {
        throw new Error(data.error || 'Instagram 피드를 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError(
        err instanceof Error 
          ? err.message 
          : 'Instagram 피드를 불러오는데 실패했습니다.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInstagramFeed();
  }, []);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchInstagramFeed();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="aspect-square bg-[#1a1f2e] rounded-2xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-[#C7C7CC] mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-[#cba967] text-white rounded-lg hover:bg-[#b69857] transition-colors"
          disabled={isLoading}
        >
          {isLoading ? '재시도 중...' : '다시 시도'}
        </button>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="text-center text-[#C7C7CC] py-8">
        현재 표시할 Instagram 게시물이 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4" role="grid" aria-label="Instagram 피드">
        {posts.slice(0, 6).map((post, index) => (
          <button
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="block aspect-square overflow-hidden rounded-2xl"
            aria-label={`Instagram 게시물${post.caption ? `: ${post.caption.slice(0, 50)}...` : ''}`}
          >
            <div className="w-full h-full bg-[#1a1f2e] relative">
              <Image
                src={post.media_type === 'VIDEO' ? post.thumbnail_url || post.media_url : post.media_url}
                alt={post.caption?.slice(0, 100) || 'Instagram post'}
                width={400}
                height={400}
                className="w-full h-full object-cover"
                unoptimized
                priority={index === 0}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16.67vw"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                {post.media_type === 'VIDEO' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white opacity-0 hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white opacity-0 hover:opacity-100" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    {post.children && (
                      <div className="absolute top-3 right-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedPost && (
        <InstagramModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </>
  );
} 
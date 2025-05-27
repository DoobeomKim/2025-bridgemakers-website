'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface CookieConsentProps {
  lang: string
}

export default function CookieConsent({ lang }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  // 번역 텍스트
  const texts = {
    ko: {
      title: '쿠키 사용 안내',
      message: '저희 웹사이트는 사용자 경험 개선과 웹사이트 분석을 위해 쿠키를 사용합니다.',
      learnMore: '자세히 보기',
      accept: '동의',
      decline: '거부'
    },
    en: {
      title: 'Cookie Notice',
      message: 'We use cookies to improve user experience and analyze website usage.',
      learnMore: 'Learn more',
      accept: 'Accept',
      decline: 'Decline'
    }
  }

  const t = texts[lang as keyof typeof texts] || texts.ko

  useEffect(() => {
    // 쿠키 동의 상태 확인
    const cookieConsent = localStorage.getItem('cookie-consent')
    
    // 동의하지 않은 경우에만 모달 표시
    if (!cookieConsent) {
      // 페이지 로드 후 1초 뒤에 표시 (자연스러운 UX)
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    // 동의 상태를 localStorage에 저장
    localStorage.setItem('cookie-consent', 'accepted')
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setIsVisible(false)
    
    // Google Analytics 등 쿠키 기반 서비스 활성화
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted'
      })
    }
  }

  const handleDecline = () => {
    // 거부 상태를 localStorage에 저장
    localStorage.setItem('cookie-consent', 'declined')
    localStorage.setItem('cookie-consent-date', new Date().toISOString())
    setIsVisible(false)
    
    // 필수 쿠키만 허용
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied'
      })
    }
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <>
      {/* 쿠키 동의 모달 */}
      <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-6 lg:left-auto lg:right-6 lg:max-w-md z-50">
        <div className="bg-background border border-border rounded-lg shadow-lg p-6 relative">
          {/* 닫기 버튼 */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* 제목 */}
          <h3 className="text-lg font-semibold text-foreground mb-3 pr-8">
            {t.title}
          </h3>

          {/* 메시지 */}
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            {t.message}
          </p>

          {/* 자세히 보기 링크 */}
          <div className="mb-6">
            <Link 
              href={`/${lang}/cookie-policy`}
              className="text-primary hover:text-primary/80 text-sm font-medium underline underline-offset-4 transition-colors"
            >
              {t.learnMore}
            </Link>
          </div>

          {/* 버튼 그룹 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDecline}
              className="flex-1 px-4 py-2 text-sm font-medium text-muted-foreground bg-muted hover:bg-muted/80 rounded-md transition-colors"
            >
              {t.decline}
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 px-4 py-2 text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 rounded-md transition-colors"
            >
              {t.accept}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// Google Analytics gtag 타입 선언
declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      parameters: Record<string, string>
    ) => void
  }
} 
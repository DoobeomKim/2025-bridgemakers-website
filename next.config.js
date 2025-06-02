/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'placehold.co',
      'cdninstagram.com',
      'scontent.cdninstagram.com',
      'scontent-iad3-1.cdninstagram.com',
      'scontent-iad3-2.cdninstagram.com',
      'graph.instagram.com',
      'instagram.fcgk30-1.fna.fbcdn.net',
      'lufykgdnccogkmwjcwyk.supabase.co',
      'images.unsplash.com'
    ],
    minimumCacheTTL: 60,
    // 이미지 최적화 설정 추가
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // 외부 이미지 로더 설정
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  webpack(config) {
    // SVG 파일을 React 컴포넌트로 가져오기 위한 설정
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack']
    });
    return config;
  },
  
  // 쿠키 사용하는 API 라우트는 정적 생성에서 제외
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig 
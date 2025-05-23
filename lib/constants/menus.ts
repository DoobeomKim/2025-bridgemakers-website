import { Locale } from "../i18n";
import { headers } from 'next/headers';
import { getURL } from '@/lib/utils/url';

export interface MenuItem {
  id: string;
  name: {
    ko: string;
    en: string;
  };
  path: string;
  isActive: boolean;
  orderIndex: number;
}

// 기본 메뉴 설정
export const DEFAULT_HEADER_MENUS: MenuItem[] = [
  {
    id: "about",
    name: {
      ko: "서비스",
      en: "About"
    },
    path: "/about",
    isActive: true,
    orderIndex: 1
  },
  {
    id: "services",
    name: {
      ko: "프로젝트",
      en: "Services"
    },
    path: "/services",
    isActive: true,
    orderIndex: 2
  },
  {
    id: "work",
    name: {
      ko: "블로그",
      en: "Work"
    },
    path: "/work",
    isActive: true,
    orderIndex: 3
  },
  {
    id: "contact",
    name: {
      ko: "문의하기",
      en: "Contact"
    },
    path: "/contact",
    isActive: true,
    orderIndex: 4
  }
];

// API를 통해 메뉴 데이터 가져오기
export const fetchHeaderMenus = async (): Promise<MenuItem[]> => {
  try {
    // 안전한 URL 생성 - getURL 유틸리티 사용
    const baseUrl = getURL().replace(/\/$/, ''); // 마지막 슬래시 제거
    
    console.log('🔗 메뉴 API 호출:', {
      baseUrl,
      apiUrl: `${baseUrl}/api/menus`,
      NODE_ENV: process.env.NODE_ENV,
      SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
    });
    
    const response = await fetch(`${baseUrl}/api/menus`, {
      cache: 'no-store'
    });
    
    const { data: menus, error } = await response.json();

    if (error || !menus) {
      console.error('Error fetching header menus:', error);
      return DEFAULT_HEADER_MENUS;
    }

    console.log('✅ 메뉴 데이터 로드 성공:', menus.length, '개');
    return menus;
  } catch (error) {
    console.error('Error fetching header menus:', error);
    console.log('🔄 기본 메뉴로 대체');
    return DEFAULT_HEADER_MENUS;
  }
};

export const getHeaderMenus = async (locale: Locale): Promise<Array<{ label: string; href: string }>> => {
  const menus = await fetchHeaderMenus();
  
  return menus
    .filter(menu => menu.isActive)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(menu => ({
      label: menu.name[locale],
      href: `/${locale}${menu.path}`
    }));
};

export const getAllMenus = async (): Promise<MenuItem[]> => {
  return await fetchHeaderMenus();
}; 
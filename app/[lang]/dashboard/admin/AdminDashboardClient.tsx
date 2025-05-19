"use client";

import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { Locale } from "@/lib/i18n";

interface AdminDashboardClientProps {
  locale: Locale;
  translations: { [key: string]: string };
}

export default function AdminDashboardClient({ locale, translations }: AdminDashboardClientProps) {
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    activities: 0
  });

  // 권한 체크
  useEffect(() => {
    getCurrentUser().then(res => {
      if (res.success && res.user) {
        setUserLevel(res.user.user_level);
      } else {
        setUserLevel(null);
      }
      setUserLoading(false);
    });
  }, []);

  // 어드민 통계 로드
  useEffect(() => {
    if (userLevel?.toLowerCase() === "admin") {
      // 실제로는 API 호출이 필요하지만, 예시로 임시 데이터 사용
      setStats({
        users: 120,
        projects: 15,
        activities: 350
      });
    }
  }, [userLevel]);

  if (userLoading) return <div className="text-white p-8">권한 확인중...</div>;
  if (userLevel?.toLowerCase() !== "admin") {
    return <div className="text-red-500 p-8 text-center text-lg font-bold">접근 권한이 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">관리자 대시보드</h1>
      
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1A2234] rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-medium text-gray-300">사용자</h2>
          <p className="text-3xl font-bold text-white mt-2">{stats.users}</p>
        </div>
        <div className="bg-[#1A2234] rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-medium text-gray-300">프로젝트</h2>
          <p className="text-3xl font-bold text-white mt-2">{stats.projects}</p>
        </div>
        <div className="bg-[#1A2234] rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-medium text-gray-300">활동</h2>
          <p className="text-3xl font-bold text-white mt-2">{stats.activities}</p>
        </div>
      </div>

      {/* 바로가기 버튼 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href={`/${locale}/dashboard/projects`}
          className="bg-[#1A2234] hover:bg-[#232b3d] rounded-lg p-6 shadow-lg flex items-center transition-colors"
        >
          <div className="flex-1">
            <h2 className="text-lg font-medium text-white">프로젝트 관리</h2>
            <p className="text-gray-400 mt-1">프로젝트 목록 보기 및 관리</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#cba967]">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
        <a
          href="#"
          className="bg-[#1A2234] hover:bg-[#232b3d] rounded-lg p-6 shadow-lg flex items-center transition-colors"
        >
          <div className="flex-1">
            <h2 className="text-lg font-medium text-white">사용자 관리</h2>
            <p className="text-gray-400 mt-1">사용자 목록 보기 및 관리</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-[#cba967]">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
} 
'use client';

import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/auth";
import { Locale } from "@/lib/i18n";
import ProjectEditModal from "./ProjectEditModal";

interface ProjectEditWrapperProps {
  locale: Locale;
  projectId: string;
}

export default function ProjectEditWrapper({ locale, projectId }: ProjectEditWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [userLevel, setUserLevel] = useState<string | null>(null);
  const [userLoading, setUserLoading] = useState(true);

  // 사용자 권한 체크
  useEffect(() => {
    getCurrentUser().then(res => {
      if (res.success && res.user) {
        setUserLevel(res.user.user_level);
      } else {
        setUserLevel(null);
      }
      setUserLoading(false);
    }).catch(err => {
      console.error("사용자 정보 로드 오류:", err);
      setUserLevel(null);
      setUserLoading(false);
    });
  }, []);

  // 모달 닫기 처리 (목록 페이지로 리다이렉트)
  const handleCloseModal = () => {
    setIsModalOpen(false);
    window.location.href = `/${locale}/dashboard/projects`;
  };

  // 저장 성공 처리
  const handleSuccess = () => {
    // 성공 시에도 목록 페이지로 이동
    window.location.href = `/${locale}/dashboard/projects`;
  };

  // 로딩 상태 처리
  if (userLoading) {
    return <div className="text-white p-8 text-center">권한 확인중...</div>;
  }

  // 권한 체크
  if (userLevel?.toLowerCase() !== "admin") {
    return (
      <div className="bg-[#1A2234] rounded-lg p-6 shadow-lg text-center">
        <div className="text-red-500 p-8 text-center text-lg font-bold">
          관리자만 접근할 수 있습니다.
        </div>
      </div>
    );
  }

  return (
    <ProjectEditModal
      isOpen={isModalOpen}
      onClose={handleCloseModal}
      onSuccess={handleSuccess}
      locale={locale}
      projectId={projectId}
    />
  );
} 
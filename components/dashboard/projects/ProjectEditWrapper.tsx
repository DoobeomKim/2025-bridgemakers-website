'use client';

import { useState } from "react";
import { Locale } from "@/lib/i18n";
import ProjectEditModal from "./ProjectEditModal";
import { useAuth } from "@/components/auth/AuthContext";
import { UserRole } from "@/types/supabase";

interface ProjectEditWrapperProps {
  locale: Locale;
  projectId: string;
}

export default function ProjectEditWrapper({ locale, projectId }: ProjectEditWrapperProps) {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const { userProfile, isLoading } = useAuth();

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
  if (isLoading) {
    return <div className="text-white p-8 text-center">권한 확인중...</div>;
  }

  // 권한 체크
  if (!userProfile || userProfile.user_level !== UserRole.ADMIN) {
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
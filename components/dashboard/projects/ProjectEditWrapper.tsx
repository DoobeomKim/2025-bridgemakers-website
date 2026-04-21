'use client';

import { useRouter } from "next/navigation";
import { Locale } from "@/lib/i18n";
import ProjectEditModal from "./ProjectEditModal";
import { useAuth } from "@/components/auth/AuthContext";
import { UserRole } from "@/types/supabase";

interface ProjectEditWrapperProps {
  locale: Locale;
  projectId: string;
}

export default function ProjectEditWrapper({ locale, projectId }: ProjectEditWrapperProps) {
  const router = useRouter();
  const { userProfile, isLoading } = useAuth();

  const handleBack = () => {
    router.push(`/${locale}/dashboard/projects`);
  };

  if (isLoading) {
    return <div className="text-white p-8 text-center">권한 확인중...</div>;
  }

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
      isOpen={true}
      onClose={handleBack}
      onSuccess={handleBack}
      locale={locale}
      projectId={projectId}
    />
  );
}

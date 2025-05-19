import { validateLocale, getTranslations, Locale } from "@/lib/i18n";
import ProjectEditWrapper from "@/components/dashboard/projects/ProjectEditWrapper";

export default function ProjectEditPage({ params }: { params: { lang: string; id: string } }) {
  // 서버에서 params 처리
  const langCode = params.lang;
  const locale = validateLocale(langCode);
  const translations = getTranslations(locale, "dashboard");
  const projectId = params.id;

  // 클라이언트 컴포넌트에서 모달 형태로 수정 페이지 제공
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-white mb-6">프로젝트 수정</h1>
      
      <ProjectEditWrapper 
      locale={locale} 
      projectId={projectId} 
    />
      
      <div className="mt-6">
        <a 
          href={`/${locale}/dashboard/projects`}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          목록으로 돌아가기
        </a>
      </div>
    </div>
  );
} 
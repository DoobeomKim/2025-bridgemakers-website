import { validateLocale, getTranslations, Locale } from "@/lib/i18n";
import ProjectEditWrapper from "@/components/dashboard/projects/ProjectEditWrapper";

export default function ProjectEditPage({ params }: { params: { lang: string; id: string } }) {
  // 서버에서 params 처리
  const langCode = params.lang;
  const locale = validateLocale(langCode);
  const translations = getTranslations(locale, "dashboard");
  const projectId = params.id;

  return (
    <div className="p-6">
      <ProjectEditWrapper locale={locale} projectId={projectId} />
    </div>
  );
} 
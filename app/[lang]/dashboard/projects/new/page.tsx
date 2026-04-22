import { validateLocale } from "@/lib/i18n";
import ProjectCreatePage from "@/components/dashboard/projects/ProjectCreatePage";

export default function NewProjectPage({ params }: { params: { lang: string } }) {
  const locale = validateLocale(params.lang);
  return (
    <div className="p-6">
      <ProjectCreatePage locale={locale} />
    </div>
  );
}

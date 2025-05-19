import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Locale } from "@/lib/i18n";
import ProjectModal from "./default";

export default async function Page({
  params,
}: {
  params: {
    slug: string;
    lang: Locale;
  };
}) {
  // 프로젝트 기본 정보 가져오기
  const { data: project } = await supabase
    .from("projects")
    .select(`
      *,
      project_images(*),
      project_tag_relations(
        project_tags(*)
      )
    `)
    .eq("slug", params.slug)
    .single();

  if (!project) {
    notFound();
  }

  // 관련 프로젝트 가져오기
  const { data: relatedProjects } = await supabase
    .rpc("get_related_projects", {
      project_id: project.id,
      limit_count: 3,
    });

  return (
    <ProjectModal 
      project={project} 
      relatedProjects={relatedProjects || []} 
      lang={params.lang} 
    />
  );
} 
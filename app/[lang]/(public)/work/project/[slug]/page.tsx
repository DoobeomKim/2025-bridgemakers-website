import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Locale } from '@/lib/i18n';
import { getYouTubeVideoId } from '@/lib/utils';
import ProjectDetail from '@/components/projects/ProjectDetail';
import RelatedProjects from '@/components/projects/RelatedProjects';
import Link from 'next/link';
import Image from 'next/image';

type ProjectPageParams = {
  slug: string;
  lang: Locale;
};

export async function generateMetadata({ 
  params 
}: { 
  params: ProjectPageParams
}): Promise<Metadata> {
  const { data: project } = await supabase
    .from('projects')
    .select('title, description')
    .eq('slug', params.slug)
    .single();

  if (!project) return {};

  return {
    title: `${project.title} | Bridge Makers`,
    description: project.description,
  };
}

export default async function ProjectPage({
  params
}: {
  params: ProjectPageParams
}) {
  // 프로젝트 기본 정보 가져오기
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      project_images(*),
      project_tag_relations(
        project_tags(*)
      )
    `)
    .eq('slug', params.slug)
    .single();

  if (!project) {
    notFound();
  }

  // 관련 프로젝트 가져오기
  const { data: relatedProjects } = await supabase
    .rpc('get_related_projects', {
      project_id: project.id,
      limit_count: 3
    });

  // 비디오 URL이 있는 경우 YouTube 영상 ID 추출
  const videoId = project.video_url ? getYouTubeVideoId(project.video_url) : null;

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 비디오 또는 썸네일 섹션 */}
        <div className="aspect-video w-full rounded-xl overflow-hidden mb-8">
          {videoId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={project.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <Image
              src={project.video_thumbnail_url || project.image_url}
              alt={project.title}
              width={1920}
              height={1080}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        <ProjectDetail project={project} />
        
        {relatedProjects && relatedProjects.length > 0 && (
          <RelatedProjects projects={relatedProjects} lang={params.lang} />
        )}
      </div>
    </div>
  );
} 
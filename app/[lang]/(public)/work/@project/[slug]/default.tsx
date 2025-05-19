import ModalContainer from '@/components/modal/ModalContainer';
import ProjectDetail from '@/components/projects/ProjectDetail';
import RelatedProjects from '@/components/projects/RelatedProjects';
import { Locale } from '@/lib/i18n';
import { Project } from '@/lib/database.types';

interface ModalProps {
  project: Project;
  relatedProjects: Project[];
  lang: Locale;
}

export default function ProjectModal({ project, relatedProjects, lang }: ModalProps) {
  return (
    <ModalContainer backUrl={`/${lang}/work`}>
      <ProjectDetail project={project} />
      
      {relatedProjects && relatedProjects.length > 0 && (
        <RelatedProjects projects={relatedProjects} lang={lang} />
      )}
    </ModalContainer>
  );
} 
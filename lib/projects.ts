import { supabase } from "./supabase";
import { generateSlug } from "./utils";
import { ProjectData } from "./utils";

interface ProjectTagRelation {
  project_tags: {
    id?: string;
    name: string;
    slug?: string;
  };
}

interface ProjectImage {
  id: string;
  image_url: string;
  sort_order: number;
}

export interface ProjectWithTags {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  client: string;
  date: string;
  country: string;
  industry: string;
  service: string;
  image_url: string;
  is_featured: boolean;
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
  project_tag_relations?: ProjectTagRelation[];
  project_images?: { count: number }[];
  tags?: string[];
  image_count?: number;
}

export interface ProjectStats {
  category: string;
  total_projects: number;
  public_projects: number;
  private_projects: number;
  last_updated: string;
}

export async function getProjects(options?: {
  search?: string;
  category?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}) {
  try {
    let query = supabase
      .from("projects")
      .select(`
        *,
        project_tag_relations(
          project_tags(name)
        ),
        project_images(count)
      `);

    // 검색어가 있는 경우
    if (options?.search) {
      const searchTerm = options.search.toLowerCase();
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,client.ilike.%${searchTerm}%`);
    }

    // 카테고리 필터링
    if (options?.category) {
      query = query.eq('category', options.category);
    }

    // 정렬
    const orderBy = options?.orderBy || 'created_at';
    const orderDirection = options?.orderDirection || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.error("프로젝트 목록 조회 오류:", error.message);
      return [];
    }

    // 데이터 변환
    const projects: ProjectWithTags[] = data?.map(project => ({
      ...project,
      tags: project.project_tag_relations?.map((relation: ProjectTagRelation) => relation.project_tags.name) || [],
      image_count: project.project_images?.[0]?.count || 0
    })) || [];

    return projects;
  } catch (err) {
    console.error("프로젝트 목록 조회 중 예외 발생:", err);
    return [];
  }
}

interface ProjectWithDetails extends Omit<ProjectData, 'tags'> {
  id: string;
  tags: ProjectTag[];
  project_images?: {
    id: string;
    image_url: string;
    sort_order: number;
  }[];
}

export async function getProjectById(id: string): Promise<ProjectWithDetails | null> {
  try {
    if (!id) {
      console.error("프로젝트 ID가 제공되지 않았습니다.");
      return null;
    }
    
    const { data, error } = await supabase
      .from("projects")
      .select(`
        *,
        project_tag_relations(
          project_tags(id, name, slug)
        ),
        project_images(id, image_url, sort_order)
      `)
      .eq("id", id)
      .single();
      
    if (error) {
      console.error(`프로젝트 상세 조회 오류 (ID: ${id}):`, error.message);
      return null;
    }
    
    return {
      ...data,
      tags: data.project_tag_relations?.map((relation: ProjectTagRelation) => relation.project_tags) || [],
      project_images: data.project_images || []
    };
  } catch (err) {
    console.error(`프로젝트 상세 조회 중 예외 발생 (ID: ${id}):`, err);
    return null;
  }
}

export async function createProject(projectData: any) {
  try {
    // tags 필드를 분리
    const { tags, ...projectFields } = projectData;

    // slug 생성 (한글 제목을 로마자로 변환 후 처리)
    if (!projectFields.slug) {
      projectFields.slug = generateSlug(projectFields);
    }
    
    const { data, error } = await supabase
      .from("projects")
      .insert(projectFields)
      .select()
      .single();
      
    if (error) {
      console.error(`프로젝트 생성 오류:`, error.message);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err: any) {
    console.error(`프로젝트 생성 중 예외 발생:`, err);
    return { success: false, error: err.message || "알 수 없는 오류가 발생했습니다." };
  }
}

export async function updateProject(id: string, updates: any) {
  try {
    if (!id) {
      console.error("프로젝트 ID가 제공되지 않았습니다.");
      return null;
    }

    // 태그 정보를 별도로 저장하고 updates에서 제거
    const tagIds = updates.tags;
    delete updates.tags;

    // categoryName과 industryName 제거
    delete updates.categoryName;
    delete updates.industryName;
    
    // 프로젝트 정보 업데이트
    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
      
    if (error) {
      console.error(`프로젝트 수정 오류 (ID: ${id}):`, error.message);
      return null;
    }

    // 태그가 제공된 경우, 태그 관계 업데이트
    if (tagIds && tagIds.length > 0) {
      // 기존 태그 관계 삭제
      const { error: deleteError } = await supabase
        .from('project_tag_relations')
        .delete()
        .eq('project_id', id);

      if (deleteError) {
        console.error(`태그 관계 삭제 오류 (ID: ${id}):`, deleteError.message);
        return null;
      }

      // 새로운 태그 관계 생성
      const relations = tagIds.map((tagId: string) => ({
        project_id: id,
        tag_id: tagId
      }));

      const { error: insertError } = await supabase
        .from('project_tag_relations')
        .insert(relations);

      if (insertError) {
        console.error(`태그 관계 생성 오류 (ID: ${id}):`, insertError.message);
        return null;
      }
    }
    
    return data;
  } catch (err) {
    console.error(`프로젝트 수정 중 예외 발생 (ID: ${id}):`, err);
    return null;
  }
}

export async function updateProjectsVisibility(projectIds: string[], visibility: 'public' | 'private') {
  try {
    if (!projectIds.length) {
      return { success: false, error: "프로젝트 ID가 제공되지 않았습니다." };
    }

    const { data, error } = await supabase
      .from("projects")
      .update({ visibility })
      .in('id', projectIds)
      .select();

    if (error) {
      console.error("프로젝트 상태 업데이트 오류:", error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("프로젝트 상태 업데이트 중 예외 발생:", err);
    return { success: false, error: err.message || "알 수 없는 오류가 발생했습니다." };
  }
}

export async function deleteProjects(projectIds: string[]) {
  try {
    if (!projectIds.length) {
      return { success: false, error: "프로젝트 ID가 제공되지 않았습니다." };
    }

    // 프로젝트 삭제
    const { error } = await supabase
      .from("projects")
      .delete()
      .in("id", projectIds);

    if (error) {
      console.error(`프로젝트 삭제 오류:`, error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error(`프로젝트 삭제 중 예외 발생:`, err);
    return { success: false, error: err.message || "알 수 없는 오류가 발생했습니다." };
  }
}

export async function getProjectStats(): Promise<ProjectStats[]> {
  try {
    const { data, error } = await supabase
      .rpc('get_project_stats');

    if (error) {
      console.error("프로젝트 통계 조회 오류:", error.message);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("프로젝트 통계 조회 중 예외 발생:", err);
    return [];
  }
}

interface ProjectTag {
  id: string;
  name: string;
  slug: string;
}

// 모든 태그 가져오기
export async function getAllTags(): Promise<{ 
  success: boolean; 
  error?: string; 
  data: ProjectTag[] 
}> {
  const { data: tags, error } = await supabase
    .from('project_tags')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching tags:', error);
    return { success: false, error: error.message, data: [] };
  }

  return { success: true, data: tags || [] };
}

// 새 태그 생성
export async function createTag(name: string): Promise<{
  success: boolean;
  error?: string;
  data?: ProjectTag;
}> {
  try {
    // 먼저 동일한 이름의 태그가 있는지 확인
    const { data: existingTag } = await supabase
      .from('project_tags')
      .select('*')
      .ilike('name', name)
      .single();

    // 이미 존재하는 태그가 있으면 그것을 반환
    if (existingTag) {
      return { success: true, data: existingTag };
    }

    // 새 태그 생성
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const { data: newTag, error } = await supabase
      .from('project_tags')
      .insert([{ name, slug }])
      .select()
      .single();

    if (error) {
      // 동시성 문제로 인한 중복 생성 시도 시 기존 태그 반환
      if (error.code === '23505') {
        const { data: conflictTag } = await supabase
          .from('project_tags')
          .select('*')
          .ilike('name', name)
          .single();
          
        if (conflictTag) {
          return { success: true, data: conflictTag };
        }
      }
      console.error('Error creating tag:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: newTag };
  } catch (err: any) {
    console.error('Error in createTag:', err);
    return { success: false, error: err.message };
  }
}

// 프로젝트에 태그 연결
export async function linkTagsToProject(projectId: string, tagIds: string[]) {
  const relations = tagIds.map(tagId => ({
    project_id: projectId,
    tag_id: tagId
  }));

  const { error } = await supabase
    .from('project_tag_relations')
    .insert(relations);

  if (error) {
    console.error('Error linking tags to project:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// 프로젝트의 태그 가져오기
export async function getProjectTags(projectId: string) {
  const { data: tags, error } = await supabase
    .from('project_tag_relations')
    .select(`
      tag_id,
      project_tags (
        id,
        name,
        slug
      )
    `)
    .eq('project_id', projectId);

  if (error) {
    console.error('Error fetching project tags:', error);
    return { success: false, error: error.message };
  }

  return { success: true, data: tags.map(t => t.project_tags) };
} 
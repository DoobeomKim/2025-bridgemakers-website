"use client";

import { useState, useEffect } from 'react';
import ProjectsTableHeader from './ProjectsTableHeader';
import ProjectsTableRow from './ProjectsTableRow';
import ProjectsPagination from './ProjectsPagination';

interface Project {
  id: string;
  title: string;
  visibility: 'public' | 'private';
  created_at: string;
  date: string;
  image_url?: string;
  client?: string;
  [key: string]: any;
}

interface ProjectsTableProps {
  projects: Project[];
  locale: string;
  onSelectionChange?: (selectedIds: string[]) => void;
  selectedIds?: string[];
}

export default function ProjectsTable({ 
  projects: allProjects, 
  locale,
  onSelectionChange,
  selectedIds = []
}: ProjectsTableProps) {
  // 정렬 상태
  const [sortColumn, setSortColumn] = useState<string | null>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>('desc');
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // 선택 상태
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  
  // 정렬된 프로젝트
  const [sortedProjects, setSortedProjects] = useState<Project[]>([]);
  
  // 표시할 프로젝트 (페이지네이션 적용)
  const [displayProjects, setDisplayProjects] = useState<Project[]>([]);
  
  // 외부 선택 상태와 동기화
  useEffect(() => {
    setSelectedProjects(selectedIds);
  }, [selectedIds]);
  
  // 정렬 처리
  useEffect(() => {
    if (!sortColumn) {
      setSortedProjects([...allProjects]);
      return;
    }
    
    const sorted = [...allProjects].sort((a, b) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];
      
      // 날짜 특별 처리
      if (sortColumn === 'date') {
        aValue = a.date || '-';
        bValue = b.date || '-';
        
        // '-' 값은 항상 마지막으로 정렬
        if (aValue === '-' && bValue === '-') return 0;
        if (aValue === '-') return 1;
        if (bValue === '-') return -1;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    setSortedProjects(sorted);
  }, [allProjects, sortColumn, sortDirection]);
  
  // 페이지네이션 처리
  useEffect(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setDisplayProjects(sortedProjects.slice(start, end));
  }, [sortedProjects, currentPage, itemsPerPage]);
  
  // 정렬 함수
  const handleSort = (column: string) => {
    // thumbnail 열은 정렬하지 않음
    if (column === 'thumbnail') return;
    
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  // 페이지 변경 함수
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  // 페이지당 표시 항목 수 변경 함수
  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
    setCurrentPage(1); // 첫 페이지로 리셋
  };
  
  // 체크박스 선택 함수
  const handleSelect = (id: string, selected: boolean) => {
    let newSelectedProjects: string[];
    if (selected) {
      newSelectedProjects = [...selectedProjects, id];
    } else {
      newSelectedProjects = selectedProjects.filter(projectId => projectId !== id);
    }
    setSelectedProjects(newSelectedProjects);
    
    // 부모 컴포넌트에 선택 변경 알림
    if (onSelectionChange) {
      onSelectionChange(newSelectedProjects);
    }
  };
  
  // 전체 선택 함수
  const handleSelectAll = (selected: boolean) => {
    let newSelectedProjects: string[];
    if (selected) {
      newSelectedProjects = displayProjects.map(p => p.id);
    } else {
      newSelectedProjects = [];
    }
    setSelectedProjects(newSelectedProjects);
    
    // 부모 컴포넌트에 선택 변경 알림
    if (onSelectionChange) {
      onSelectionChange(newSelectedProjects);
    }
  };
  
  // 전체 페이지 수 계산
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
  
  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="min-w-full text-white">
          <ProjectsTableHeader
            onSelectAll={handleSelectAll}
            allSelected={displayProjects.length > 0 && selectedProjects.length === displayProjects.length}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
          <tbody>
            {displayProjects.map((project) => (
              <ProjectsTableRow
                key={project.id}
                project={project}
                selected={selectedProjects.includes(project.id)}
                onSelect={handleSelect}
                locale={locale}
              />
            ))}
          </tbody>
        </table>
      </div>
      
      {displayProjects.length === 0 && (
        <div className="text-gray-medium text-center py-12 text-body">등록된 프로젝트가 없습니다.</div>
      )}
      
      {totalPages > 0 && (
        <div className="border-t border-[#232b3d] px-6 py-4">
          <ProjectsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
} 
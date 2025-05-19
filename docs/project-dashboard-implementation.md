# 프로젝트 대시보드 구현 계획

## 1단계: 기본 UI 구조 개선

### 구현할 컴포넌트

1. **ProjectsTableHeader**: 체크박스, 컬럼 제목, 정렬 기능을 갖춘 테이블 헤더
   ```tsx
   // components/dashboard/projects/ProjectsTableHeader.tsx
   "use client";
   
   import { useState } from 'react';
   import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
   
   interface ProjectsTableHeaderProps {
     onSelectAll: (selected: boolean) => void;
     allSelected: boolean;
     sortColumn: string | null;
     sortDirection: 'asc' | 'desc' | null;
     onSort: (column: string) => void;
   }
   
   export default function ProjectsTableHeader({
     onSelectAll,
     allSelected,
     sortColumn,
     sortDirection,
     onSort
   }: ProjectsTableHeaderProps) {
     
     // 정렬 아이콘 표시 함수
     const renderSortIcon = (column: string) => {
       if (sortColumn !== column) return <ChevronUpDownIcon className="w-4 h-4" />;
       return sortDirection === 'asc' 
         ? <ChevronUpIcon className="w-4 h-4" />
         : <ChevronDownIcon className="w-4 h-4" />;
     };
     
     return (
       <thead>
         <tr className="border-b border-[#232b3d]">
           <th className="py-2 px-4 text-left w-12">
             <input
               type="checkbox"
               className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
               checked={allSelected}
               onChange={(e) => onSelectAll(e.target.checked)}
             />
           </th>
           <th className="py-2 px-4 text-left">
             <button
               className="flex items-center text-white hover:text-gray-300"
               onClick={() => onSort('thumbnail')}
             >
               콘텐츠
             </button>
           </th>
           <th className="py-2 px-4 text-left">
             <button
               className="flex items-center text-white hover:text-gray-300"
               onClick={() => onSort('title')}
             >
               제목 {renderSortIcon('title')}
             </button>
           </th>
           <th className="py-2 px-4 text-left">
             <button
               className="flex items-center text-white hover:text-gray-300"
               onClick={() => onSort('status')}
             >
               상태 {renderSortIcon('status')}
             </button>
           </th>
           <th className="py-2 px-4 text-left">
             <button
               className="flex items-center text-white hover:text-gray-300"
               onClick={() => onSort('visibility')}
             >
               공개 설정 {renderSortIcon('visibility')}
             </button>
           </th>
           <th className="py-2 px-4 text-left">
             <button
               className="flex items-center text-white hover:text-gray-300"
               onClick={() => onSort('date')}
             >
               등록일 {renderSortIcon('date')}
             </button>
           </th>
           <th className="py-2 px-4 text-left">관리</th>
         </tr>
       </thead>
     );
   }
   ```

2. **ProjectsTableRow**: 각 프로젝트를 표시하는 테이블 행
   ```tsx
   // components/dashboard/projects/ProjectsTableRow.tsx
   "use client";
   
   import { useState } from 'react';
   import Image from 'next/image';
   import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
   
   interface ProjectsTableRowProps {
     project: {
       id: string;
       title: string;
       status: string;
       visibility: 'public' | 'private';
       created_at: string;
       thumbnail?: string;
       client?: string;
     };
     selected: boolean;
     onSelect: (id: string, selected: boolean) => void;
     locale: string;
   }
   
   export default function ProjectsTableRow({
     project,
     selected,
     onSelect,
     locale
   }: ProjectsTableRowProps) {
     
     // 날짜 포맷팅
     const formatDate = (dateString: string) => {
       return new Date(dateString).toLocaleDateString();
     };
     
     // 상태에 따른 배지 색상
     const getStatusBadgeColor = (status: string) => {
       switch(status.toLowerCase()) {
         case 'completed':
         case '완료':
           return 'bg-green-600';
         case 'in progress':
         case '진행중':
           return 'bg-blue-600';
         case 'pending':
         case '대기중':
           return 'bg-yellow-600';
         default:
           return 'bg-gray-600';
       }
     };
     
     return (
       <tr className="hover:bg-[#232b3d] cursor-pointer border-b border-[#232b3d]">
         <td className="py-2 px-4">
           <input
             type="checkbox"
             className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
             checked={selected}
             onChange={(e) => onSelect(project.id, e.target.checked)}
             onClick={(e) => e.stopPropagation()}
           />
         </td>
         <td className="py-2 px-4">
           <div className="w-20 h-12 relative bg-gray-800 rounded overflow-hidden">
             {project.thumbnail ? (
               <Image
                 src={project.thumbnail}
                 alt={project.title}
                 fill
                 sizes="80px"
                 className="object-cover"
               />
             ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-400">
                 No Image
               </div>
             )}
           </div>
         </td>
         <td className="py-2 px-4">
           <div className="font-medium text-white">{project.title}</div>
           <div className="text-sm text-gray-400">{project.client || '-'}</div>
         </td>
         <td className="py-2 px-4">
           <span className={`px-2 py-1 text-xs rounded-full text-white ${getStatusBadgeColor(project.status)}`}>
             {project.status}
           </span>
         </td>
         <td className="py-2 px-4">
           {project.visibility === 'public' ? (
             <div className="flex items-center text-green-400">
               <EyeIcon className="w-4 h-4 mr-1" />
               <span>공개</span>
             </div>
           ) : (
             <div className="flex items-center text-gray-400">
               <EyeSlashIcon className="w-4 h-4 mr-1" />
               <span>비공개</span>
             </div>
           )}
         </td>
         <td className="py-2 px-4">
           {formatDate(project.created_at)}
         </td>
         <td className="py-2 px-4">
           <button
             onClick={() => window.location.href = `/${locale}/dashboard/projects/${project.id}`}
             className="text-indigo-400 underline hover:text-indigo-200"
           >
             수정
           </button>
         </td>
       </tr>
     );
   }
   ```

3. **ProjectsPagination**: 페이지네이션 컴포넌트
   ```tsx
   // components/dashboard/projects/ProjectsPagination.tsx
   "use client";
   
   import {
     ChevronLeftIcon,
     ChevronRightIcon,
     ChevronDoubleLeftIcon,
     ChevronDoubleRightIcon
   } from '@heroicons/react/24/outline';
   
   interface ProjectsPaginationProps {
     currentPage: number;
     totalPages: number;
     onPageChange: (page: number) => void;
     itemsPerPage: number;
     onItemsPerPageChange: (itemsPerPage: number) => void;
   }
   
   export default function ProjectsPagination({
     currentPage,
     totalPages,
     onPageChange,
     itemsPerPage,
     onItemsPerPageChange
   }: ProjectsPaginationProps) {
     
     const pageNumbers = [];
     for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
       pageNumbers.push(i);
     }
     
     return (
       <div className="flex items-center justify-between mt-4 text-white">
         <div className="flex items-center space-x-2">
           <span className="text-sm text-gray-400">페이지당 표시:</span>
           <select
             value={itemsPerPage}
             onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
             className="bg-[#1A2234] border border-[#232b3d] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
           >
             <option value={10}>10</option>
             <option value={30}>30</option>
             <option value={50}>50</option>
           </select>
         </div>
         
         <div className="flex items-center space-x-1">
           <button
             onClick={() => onPageChange(1)}
             disabled={currentPage === 1}
             className="p-1 rounded-md hover:bg-[#232b3d] disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <ChevronDoubleLeftIcon className="w-5 h-5" />
           </button>
           <button
             onClick={() => onPageChange(currentPage - 1)}
             disabled={currentPage === 1}
             className="p-1 rounded-md hover:bg-[#232b3d] disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <ChevronLeftIcon className="w-5 h-5" />
           </button>
           
           {pageNumbers.map((page) => (
             <button
               key={page}
               onClick={() => onPageChange(page)}
               className={`px-3 py-1 rounded-md ${
                 currentPage === page
                   ? 'bg-indigo-600 text-white'
                   : 'hover:bg-[#232b3d]'
               }`}
             >
               {page}
             </button>
           ))}
           
           <button
             onClick={() => onPageChange(currentPage + 1)}
             disabled={currentPage === totalPages}
             className="p-1 rounded-md hover:bg-[#232b3d] disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <ChevronRightIcon className="w-5 h-5" />
           </button>
           <button
             onClick={() => onPageChange(totalPages)}
             disabled={currentPage === totalPages}
             className="p-1 rounded-md hover:bg-[#232b3d] disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <ChevronDoubleRightIcon className="w-5 h-5" />
           </button>
         </div>
       </div>
     );
   }
   ```

4. **ProjectsTable**: 테이블 전체를 감싸는 컴포넌트
   ```tsx
   // components/dashboard/projects/ProjectsTable.tsx
   "use client";
   
   import { useState, useEffect } from 'react';
   import ProjectsTableHeader from './ProjectsTableHeader';
   import ProjectsTableRow from './ProjectsTableRow';
   import ProjectsPagination from './ProjectsPagination';
   
   interface Project {
     id: string;
     title: string;
     status: string;
     visibility: 'public' | 'private';
     created_at: string;
     thumbnail?: string;
     client?: string;
     [key: string]: any;
   }
   
   interface ProjectsTableProps {
     projects: Project[];
     locale: string;
   }
   
   export default function ProjectsTable({ projects: allProjects, locale }: ProjectsTableProps) {
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
           aValue = a.created_at;
           bValue = b.created_at;
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
       if (selected) {
         setSelectedProjects([...selectedProjects, id]);
       } else {
         setSelectedProjects(selectedProjects.filter(projectId => projectId !== id));
       }
     };
     
     // 전체 선택 함수
     const handleSelectAll = (selected: boolean) => {
       if (selected) {
         setSelectedProjects(displayProjects.map(p => p.id));
       } else {
         setSelectedProjects([]);
       }
     };
     
     // 전체 페이지 수 계산
     const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
     
     return (
       <div className="bg-[#1A2234] rounded-lg p-6 shadow-lg">
         <h2 className="text-xl font-bold mb-4 text-white">프로젝트 목록</h2>
         
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
           <div className="text-gray-400 text-center py-8">등록된 프로젝트가 없습니다.</div>
         )}
         
         {totalPages > 0 && (
           <ProjectsPagination
             currentPage={currentPage}
             totalPages={totalPages}
             onPageChange={handlePageChange}
             itemsPerPage={itemsPerPage}
             onItemsPerPageChange={handleItemsPerPageChange}
           />
         )}
       </div>
     );
   }
   ```

### 다음 단계: 개선된 ProjectsClient 컴포넌트

1. 기존 ProjectsClient를 개선하여 새 컴포넌트들을 사용하도록 수정
2. 필터링 및 검색 기능 도입 준비

## 2단계: 필터링 및 검색 기능 구현

### 계획

1. 검색 컴포넌트 구현
2. 필터링 컴포넌트 구현
3. ProjectsClient에 필터링 및 검색 로직 추가

## 3단계: 일괄 작업 기능 구현

### 계획

1. 선택된 항목에 대한 작업 버튼 구현
2. 일괄 수정 모달 구현
3. 일괄 작업 API 연동 
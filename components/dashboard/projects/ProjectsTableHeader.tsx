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
    if (sortColumn !== column) return <ChevronUpDownIcon className="w-3 h-3 md:w-4 md:h-4" />;
    return sortDirection === 'asc' 
      ? <ChevronUpIcon className="w-3 h-3 md:w-4 md:h-4" />
      : <ChevronDownIcon className="w-3 h-3 md:w-4 md:h-4" />;
  };
  
  return (
    <thead>
      <tr className="border-b border-[#232b3d]">
        <th className="py-1.5 md:py-2 px-2 md:px-4 text-left w-8 md:w-12">
          <input
            type="checkbox"
            className="w-3 h-3 md:w-4 md:h-4 rounded border-gray-600 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
          />
        </th>
        <th className="py-1.5 md:py-2 px-2 md:px-4 text-left">
          <span className="text-white text-xs md:text-sm">콘텐츠</span>
        </th>
        <th className="py-1.5 md:py-2 px-2 md:px-4 text-left">
          <button
            className="flex items-center text-white hover:text-gray-300 text-xs md:text-sm"
            onClick={() => onSort('title')}
          >
            제목 {renderSortIcon('title')}
          </button>
        </th>
        <th className="hidden md:table-cell py-1.5 md:py-2 px-2 md:px-4 text-left">
          <button
            className="flex items-center text-white hover:text-gray-300 text-xs md:text-sm"
            onClick={() => onSort('visibility')}
          >
            공개 설정 {renderSortIcon('visibility')}
          </button>
        </th>
        <th className="py-1.5 md:py-2 px-2 md:px-4 text-left">
          <button
            className="flex items-center text-white hover:text-gray-300 text-xs md:text-sm"
            onClick={() => onSort('date')}
          >
            날짜 {renderSortIcon('date')}
          </button>
        </th>
        <th className="py-1.5 md:py-2 px-2 md:px-4 text-left">
          <span className="text-white text-xs md:text-sm">관리</span>
        </th>
      </tr>
    </thead>
  );
} 
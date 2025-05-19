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
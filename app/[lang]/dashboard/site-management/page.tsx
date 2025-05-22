"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Cog6ToothIcon, 
  DocumentTextIcon, 
  ClockIcon, 
  DocumentDuplicateIcon,
  PaintBrushIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowsUpDownIcon
} from "@heroicons/react/24/outline";
import clsx from 'clsx';
import { MenuItem, getAllMenus } from "@/lib/constants/menus";
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { supabase } from '@/lib/supabase/client';
import LoginModal from '@/components/auth/LoginModal';
import { useAuth } from "@/app/components/auth/AuthProvider";
import { UserLevel } from "@/lib/supabase";

type Tab = {
  id: string;
  name: string;
  icon: any;
};

type LocalHeaderMenu = {
  id: string;
  name: {
    ko: string;
    en: string;
  };
  path: string;
  isActive: boolean;
  orderIndex: number;
};

const tabs: Tab[] = [
  { id: 'general', name: '일반', icon: Cog6ToothIcon },
  { id: 'design', name: '디자인', icon: PaintBrushIcon },
  { id: 'oauth', name: 'OAuth 앱', icon: DocumentTextIcon },
  { id: 'audit', name: '감사 로그', icon: ClockIcon },
  { id: 'legal', name: '법적 문서', icon: DocumentDuplicateIcon },
];

// UUID v4 생성 함수
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function SiteManagementPage() {
  const router = useRouter();
  const { userProfile, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [organizationName, setOrganizationName] = useState('BRIDGEMAKERS');
  const [organizationSlug, setOrganizationSlug] = useState('bridgemakers');
  const [isAnonymousDataEnabled, setIsAnonymousDataEnabled] = useState(false);
  const [isLanguageSwitcherEnabled, setIsLanguageSwitcherEnabled] = useState(true);
  const [isUpdatingLanguageSwitcher, setIsUpdatingLanguageSwitcher] = useState(false);
  
  // 헤더 메뉴 상태 관리
  const [headerMenus, setHeaderMenus] = useState<LocalHeaderMenu[]>([]);
  const [initialHeaderMenus, setInitialHeaderMenus] = useState<LocalHeaderMenu[]>([]);
  const [newMenuName, setNewMenuName] = useState({ ko: '', en: '' });
  const [newMenuPath, setNewMenuPath] = useState('');
  const [editingMenu, setEditingMenu] = useState<LocalHeaderMenu | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 변경 사항 감지 (언어 변경 컴포넌트 상태 제외)
  const hasChanges = JSON.stringify(initialHeaderMenus) !== JSON.stringify(headerMenus);

  // 언어 변경 컴포넌트 토글 핸들러
  const handleLanguageSwitcherToggle = async () => {
    try {
      setIsUpdatingLanguageSwitcher(true);
      const newState = !isLanguageSwitcherEnabled;
      
      const response = await fetch('/api/settings/language-switcher', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled: newState }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update language switcher state');
      }

      setIsLanguageSwitcherEnabled(newState);
    } catch (error: any) {
      console.error('Error updating language switcher:', error);
      alert(error.message || '언어 변경 컴포넌트 설정 업데이트에 실패했습니다.');
      // 상태를 원래대로 되돌림
      setIsLanguageSwitcherEnabled(!isLanguageSwitcherEnabled);
    } finally {
      setIsUpdatingLanguageSwitcher(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const init = async () => {
      if (loading) return;
      
      if (!userProfile || userProfile.user_level !== UserLevel.ADMIN) {
        router.push('/dashboard');
        return;
      }

      try {
        setIsLoading(true);
        // 헤더 메뉴 로드
        const response = await fetch('/api/menus');
        const { data: menus } = await response.json();
        
        // 언어 변경 컴포넌트 상태 로드
        const langSwitcherResponse = await fetch('/api/settings/language-switcher');
        const { enabled } = await langSwitcherResponse.json();
        
        setHeaderMenus(menus);
        setInitialHeaderMenus(menus);
        setIsLanguageSwitcherEnabled(enabled);
      } catch (error) {
        console.error('Error initializing:', error);
        alert('데이터를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [loading, userProfile, router]);

  const handleSave = async () => {
    if (!hasChanges) return;

    try {
      setIsSaving(true);

        // 메뉴 순서 인덱스 업데이트
        const sortedMenus = headerMenus.map((menu, index) => ({
          ...menu,
          orderIndex: index + 1
        }));

      // 메뉴 데이터 저장
      const menuResponse = await fetch('/api/menus', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(sortedMenus),
        });

      if (!menuResponse.ok) {
        const errorData = await menuResponse.json();
          throw new Error(errorData.error || '메뉴 업데이트에 실패했습니다.');
        }

      const { data: updatedMenus } = await menuResponse.json();
      setHeaderMenus(updatedMenus);
      setInitialHeaderMenus(updatedMenus);
      alert('메뉴 설정이 저장되었습니다.');
    } catch (error: any) {
      console.error('설정 저장 실패:', error);
      alert(error.message || '저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddHeaderMenu = () => {
    if (!newMenuName.ko || !newMenuName.en || !newMenuPath) return;
    
    const newMenu: LocalHeaderMenu = {
      id: generateUUID(),
      name: {
        ko: newMenuName.ko,
        en: newMenuName.en
      },
      path: newMenuPath,
      isActive: true,
      orderIndex: headerMenus.length + 1
    };
    
    setHeaderMenus([...headerMenus, newMenu]);
    setNewMenuName({ ko: '', en: '' });
    setNewMenuPath('');
  };

  const handleDeleteHeaderMenu = (id: string) => {
    setHeaderMenus(headerMenus.filter(menu => menu.id !== id));
  };

  const handleToggleHeaderMenu = (id: string) => {
    setHeaderMenus(headerMenus.map(menu => 
      menu.id === id ? { ...menu, isActive: !menu.isActive } : menu
    ));
  };

  const handleEditMenu = (menu: LocalHeaderMenu) => {
    setEditingMenu(menu);
  };

  const handleSaveEdit = () => {
    if (!editingMenu) return;
    
    setHeaderMenus(headerMenus.map(menu => 
      menu.id === editingMenu.id ? editingMenu : menu
    ));
    setEditingMenu(null);
  };

  const handleCancelEdit = () => {
    setEditingMenu(null);
  };

  const handleCancel = () => {
    // 초기 상태로 복원
    setHeaderMenus(initialHeaderMenus);
    setEditingMenu(null);
  };

  // 드래그 앤 드롭 핸들러
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(headerMenus);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // 순서 인덱스 업데이트
    const updatedItems = items.map((item, index) => ({
      ...item,
      orderIndex: index + 1
    }));
    
    setHeaderMenus(updatedItems);
  };

  // 로딩 상태 표시
  if (loading || isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // 권한이 없는 경우
  if (!userProfile || userProfile.user_level !== UserLevel.ADMIN) {
    return (
      <div className="p-6">
        <div className="text-red-500 text-center">
          접근 권한이 없습니다.
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white mb-6">사이트 관리</h1>
        
        {/* 탭 네비게이션 */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm',
                  activeTab === tab.id
                    ? 'border-[#cba967] text-[#cba967]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                )}
              >
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* 일반 설정 */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <label htmlFor="organization-name" className="block text-sm font-medium text-gray-300">
                조직 이름
              </label>
              <input
                type="text"
                id="organization-name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-[#cba967] focus:ring-[#cba967] sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="organization-slug" className="block text-sm font-medium text-gray-300">
                조직 슬러그
              </label>
              <input
                type="text"
                id="organization-slug"
                value={organizationSlug}
                onChange={(e) => setOrganizationSlug(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-700 bg-gray-800 text-white shadow-sm focus:border-[#cba967] focus:ring-[#cba967] sm:text-sm"
              />
            </div>

            <div className="flex items-center">
              <input
                id="anonymous-data"
                type="checkbox"
                checked={isAnonymousDataEnabled}
                onChange={(e) => setIsAnonymousDataEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-[#cba967] focus:ring-[#cba967]"
              />
              <label htmlFor="anonymous-data" className="ml-2 block text-sm text-gray-300">
                익명 데이터 수집 허용
              </label>
            </div>
          </div>
        )}

        {/* 디자인 설정 */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            {/* 언어 변경 컴포넌트 관리 */}
            <div className="bg-[#1f2937] rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-4">언어 변경 컴포넌트 관리</h2>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleLanguageSwitcherToggle}
                    disabled={isUpdatingLanguageSwitcher}
                    className={clsx(
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:ring-offset-2 focus:ring-offset-[#111827]',
                      isLanguageSwitcherEnabled ? 'bg-[#cba967]' : 'bg-gray-600',
                      isUpdatingLanguageSwitcher && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    <span
                      className={clsx(
                        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        isLanguageSwitcherEnabled ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </button>
                  <span className="text-white">언어 변경 컴포넌트 활성화</span>
                </div>
                <div className="text-sm text-gray-400">
                  {isUpdatingLanguageSwitcher ? '업데이트 중...' : (isLanguageSwitcherEnabled ? '활성화됨' : '비활성화됨')}
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                이 설정을 비활성화하면 사이트의 모든 페이지에서 언어 변경 컴포넌트가 숨겨집니다.
              </p>
            </div>

            {/* 헤더 메뉴 관리 */}
            <div className="bg-[#1f2937] rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-4">헤더 메뉴 관리</h2>
              
              {/* 메뉴 추가 폼 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label htmlFor="menu-name-ko" className="block text-sm font-medium text-gray-300 mb-2">
                    메뉴 이름 (한국어)
                  </label>
                  <input
                    type="text"
                    id="menu-name-ko"
                    value={newMenuName.ko}
                    onChange={(e) => setNewMenuName({ ...newMenuName, ko: e.target.value })}
                    className="w-full bg-[#111827] border border-[#374151] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent"
                    placeholder="메뉴 이름 입력"
                  />
                </div>
                <div>
                  <label htmlFor="menu-name-en" className="block text-sm font-medium text-gray-300 mb-2">
                    메뉴 이름 (영어)
                  </label>
                  <input
                    type="text"
                    id="menu-name-en"
                    value={newMenuName.en}
                    onChange={(e) => setNewMenuName({ ...newMenuName, en: e.target.value })}
                    className="w-full bg-[#111827] border border-[#374151] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent"
                    placeholder="Enter menu name"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label htmlFor="menu-path" className="block text-sm font-medium text-gray-300 mb-2">
                      경로
                    </label>
                    <input
                      type="text"
                      id="menu-path"
                      value={newMenuPath}
                      onChange={(e) => setNewMenuPath(e.target.value)}
                      className="w-full bg-[#111827] border border-[#374151] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent"
                      placeholder="/path"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={handleAddHeaderMenu}
                      disabled={!newMenuName.ko || !newMenuName.en || !newMenuPath}
                      className={clsx(
                        "flex items-center gap-1 px-4 py-2 rounded-lg transition-colors",
                        (!newMenuName.ko || !newMenuName.en || !newMenuPath)
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-[#cba967] text-white hover:bg-[#b89856]"
                      )}
                    >
                      <PlusIcon className="h-5 w-5" />
                      추가
                    </button>
                  </div>
                </div>
              </div>

              {/* 메뉴 목록 */}
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="header-menus">
                  {(provided) => (
                    <div 
                      className="space-y-3"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {headerMenus.map((menu, index) => (
                        <Draggable 
                          key={menu.id} 
                          draggableId={menu.id} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={clsx(
                                "flex items-center gap-4 p-4 bg-[#111827] rounded-lg",
                                snapshot.isDragging && "opacity-50"
                              )}
                            >
                              <div
                                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                <ArrowsUpDownIcon className="h-5 w-5 text-gray-400" />
                              </div>
                              {editingMenu?.id === menu.id ? (
                                <>
                                  <input
                                    type="text"
                                    value={editingMenu.name.ko}
                                    onChange={(e) => setEditingMenu({ ...editingMenu, name: { ...editingMenu.name, ko: e.target.value } })}
                                    className="flex-1 bg-[#374151] border border-[#4b5563] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent"
                                  />
                                  <input
                                    type="text"
                                    value={editingMenu.name.en}
                                    onChange={(e) => setEditingMenu({ ...editingMenu, name: { ...editingMenu.name, en: e.target.value } })}
                                    className="flex-1 bg-[#374151] border border-[#4b5563] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent"
                                  />
                                  <input
                                    type="text"
                                    value={editingMenu.path}
                                    onChange={(e) => setEditingMenu({ ...editingMenu, path: e.target.value })}
                                    className="flex-1 bg-[#374151] border border-[#4b5563] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent"
                                  />
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={handleSaveEdit}
                                      className="p-2 text-green-500 hover:text-green-400 transition-colors"
                                    >
                                      <CheckIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={handleCancelEdit}
                                      className="p-2 text-red-500 hover:text-red-400 transition-colors"
                                    >
                                      <XMarkIcon className="h-5 w-5" />
                                    </button>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex-1">
                                    <div className="font-medium text-white">{menu.name.ko} / {menu.name.en}</div>
                                    <div className="text-sm text-gray-400">{menu.path}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleToggleHeaderMenu(menu.id)}
                                      className={clsx(
                                        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:ring-offset-2 focus:ring-offset-[#111827]',
                                        menu.isActive ? 'bg-[#cba967]' : 'bg-gray-600'
                                      )}
                                    >
                                      <span
                                        className={clsx(
                                          'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                                          menu.isActive ? 'translate-x-5' : 'translate-x-0'
                                        )}
                                      />
                                    </button>
                                    <button
                                      onClick={() => handleEditMenu(menu)}
                                      className="p-2 text-blue-500 hover:text-blue-400 transition-colors"
                                    >
                                      <PencilIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteHeaderMenu(menu.id)}
                                      className="p-2 text-red-500 hover:text-red-400 transition-colors"
                                    >
                                      <TrashIcon className="h-5 w-5" />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>

              {/* 헤더 메뉴 관리 섹션의 취소/저장 버튼 */}
              {hasChanges && (
                <div className="mt-6 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#374151] rounded-lg hover:bg-[#4b5563] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111827] focus:ring-[#4b5563]"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className={clsx(
                      "flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                      isSaving
                        ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                        : "bg-[#cba967] text-white hover:bg-[#b89856] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111827] focus:ring-[#cba967]"
                    )}
                  >
                    {isSaving ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        저장 중...
                      </>
                    ) : '저장'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        locale="ko"
        initialMode="login"
      />
    </>
  );
} 
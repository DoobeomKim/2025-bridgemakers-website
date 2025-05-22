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
import LoginModal from '@/components/auth/LoginModal';
import { useAuth } from "@/components/auth/AuthContext";
import { UserRole } from "@/types/supabase";
import { DraggableList } from "@/app/components/DraggableList";
import { v4 as generateUUID } from 'uuid';

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

export default function SiteManagementPage() {
  const router = useRouter();
  const { userProfile, isLoading } = useAuth();
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
      alert('언어 변경 컴포넌트 설정이 저장되었습니다.');
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
      if (isLoading) return;
      
      if (!userProfile || userProfile.user_level !== UserRole.ADMIN) {
        router.push('/dashboard');
        return;
      }

      try {
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
      }
    };

    init();
  }, [isLoading, userProfile, router]);

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

  if (isLoading) {
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

  if (!userProfile || userProfile.user_level !== UserRole.ADMIN) {
    return (
      <div className="p-6">
        <div className="text-red-500 text-center">
          접근 권한이 없습니다.
        </div>
      </div>
    );
  }

  const renderMenuItem = (menu: LocalHeaderMenu) => {
    if (editingMenu?.id === menu.id) {
      return (
        <div className="flex items-center gap-4">
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
        </div>
      );
    }

    return (
      <div className="flex items-center gap-4">
        <div className="p-2 text-gray-400">
          <ArrowsUpDownIcon className="h-5 w-5" />
        </div>
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
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* 탭 네비게이션 */}
      <div className="border-b border-[#374151] mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-[#cba967] text-[#cba967]'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                )}
              >
                <Icon className="h-5 w-5" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-6">
        {/* 일반 설정 탭 */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* 조직 설정 */}
            <div className="bg-[#1f2937] rounded-lg p-6">
              <h2 className="text-lg font-medium text-white mb-4">조직 설정</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="org-name" className="block text-sm font-medium text-gray-300 mb-2">
                    조직 이름
                  </label>
                  <input
                    type="text"
                    id="org-name"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full bg-[#111827] border border-[#374151] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="org-slug" className="block text-sm font-medium text-gray-300 mb-2">
                    조직 슬러그
                  </label>
                  <input
                    type="text"
                    id="org-slug"
                    value={organizationSlug}
                    onChange={(e) => setOrganizationSlug(e.target.value)}
                    className="w-full bg-[#111827] border border-[#374151] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* 익명 데이터 수집 설정 */}
            <div className="bg-[#1f2937] rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-white">익명 데이터 수집</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    현재 상태: {isAnonymousDataEnabled ? '활성화됨' : '비활성화됨'}
                  </p>
                </div>
                <button
                  onClick={() => setIsAnonymousDataEnabled(!isAnonymousDataEnabled)}
                  className={clsx(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:ring-offset-2 focus:ring-offset-[#1f2937]',
                    isAnonymousDataEnabled ? 'bg-[#cba967]' : 'bg-gray-600'
                  )}
                >
                  <span
                    className={clsx(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      isAnonymousDataEnabled ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-400">
                사이트 개선을 위한 익명 사용 데이터를 수집합니다.
              </p>
            </div>
          </div>
        )}

        {/* 디자인 설정 탭 */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            {/* 언어 변경 컴포넌트 설정 */}
            <div className="bg-[#1f2937] rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-white">언어 변경 컴포넌트</h2>
                  <p className="text-sm text-gray-400 mt-1">
                    현재 상태: {isLanguageSwitcherEnabled ? '활성화됨' : '비활성화됨'}
                  </p>
                </div>
                <button
                  onClick={handleLanguageSwitcherToggle}
                  disabled={isUpdatingLanguageSwitcher}
                  className={clsx(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:ring-offset-2 focus:ring-offset-[#1f2937]',
                    isLanguageSwitcherEnabled ? 'bg-[#cba967]' : 'bg-gray-600'
                  )}
                >
                  <span
                    className={clsx(
                      'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      isLanguageSwitcherEnabled ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </button>
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
              <DraggableList
                items={headerMenus}
                onReorder={setHeaderMenus}
                keyExtractor={(item) => item.id}
                renderItem={renderMenuItem}
              />

              {/* 헤더 메뉴 관리 섹션의 취소/저장 버튼 */}
              {hasChanges && (
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-white bg-gray-600 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className={clsx(
                      "px-4 py-2 text-white rounded-lg transition-colors",
                      isSaving
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-[#cba967] hover:bg-[#b89856]"
                    )}
                  >
                    {isSaving ? "저장 중..." : "저장"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* OAuth 앱 탭 */}
        {activeTab === 'oauth' && (
          <div className="bg-[#1f2937] rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">OAuth 앱 설정</h2>
            <p className="text-gray-400">OAuth 앱 설정 내용이 여기에 표시됩니다.</p>
          </div>
        )}

        {/* 감사 로그 탭 */}
        {activeTab === 'audit' && (
          <div className="bg-[#1f2937] rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">감사 로그</h2>
            <p className="text-gray-400">감사 로그 내용이 여기에 표시됩니다.</p>
          </div>
        )}

        {/* 법적 문서 탭 */}
        {activeTab === 'legal' && (
          <div className="bg-[#1f2937] rounded-lg p-6">
            <h2 className="text-lg font-medium text-white mb-4">법적 문서 관리</h2>
            <p className="text-gray-400">법적 문서 관리 내용이 여기에 표시됩니다.</p>
          </div>
        )}
      </div>
      
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        locale="ko"
        initialMode="login"
      />
    </div>
  );
} 
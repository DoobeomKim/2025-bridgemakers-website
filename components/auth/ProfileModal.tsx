"use client";

import { useState, useEffect, useRef } from "react";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useAuth, UserProfile } from '@/components/auth/AuthContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
}

const ProfileModal = ({ isOpen, onClose, user }: ProfileModalProps) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { supabase } = useAuth();

  // 모달이 열릴 때 사용자 정보로 폼 초기화
  useEffect(() => {
    if (isOpen && user) {
      console.log('🔍 프로필 모달: 사용자 정보 로드', {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        company_name: user.company_name,
        user_level: user.user_level,
        has_profile_image: user.profile_image_url ? true : false,
        created_at: user.created_at
      });

      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        companyName: user.company_name || '',
      });
      setProfileImage(user.profile_image_url);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, user]);

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // 스크롤 방지
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  // ESC 키 누르면 모달 닫기
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // 이미지 미리보기
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 프로필 이미지 업로드 함수
  const uploadProfileImage = async (userId: string, file: File) => {
    try {
      // 스토리지에 이미지 업로드
      const fileExt = file.name.split('.').pop();
      const filePath = `profile_images/${userId}/${Math.random()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      
      if (uploadError) {
        console.error('이미지 업로드 실패:', uploadError);
        return { success: false, error: '이미지 업로드에 실패했습니다.' };
      }
      
      // 이미지 URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      // 프로필 업데이트
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image_url: publicUrl })
        .eq('id', userId);
      
      if (updateError) {
        console.error('프로필 업데이트 실패:', updateError);
        return { success: false, error: '프로필 업데이트에 실패했습니다.' };
      }
      
      return { success: true, url: publicUrl };
    } catch (error: any) {
      console.error('이미지 업로드 오류:', error);
      return { success: false, error: error.message };
    }
  };

  // 프로필 정보 업데이트 함수
  const updateUserProfile = async (userId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);
      
      if (error) {
        console.error('프로필 업데이트 실패:', error);
        return { success: false, error: error.message };
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('프로필 업데이트 오류:', error);
      return { success: false, error: error.message };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 업데이트할 필드만 포함
      const updates: { 
        first_name?: string; 
        last_name?: string;
        company_name?: string;
      } = {};
      
      if (formData.firstName !== user.first_name) {
        updates.first_name = formData.firstName;
      }
      
      if (formData.lastName !== user.last_name) {
        updates.last_name = formData.lastName;
      }

      if (formData.companyName !== user.company_name) {
        updates.company_name = formData.companyName;
      }

      // 이미지 파일이 있으면 먼저 업로드
      if (imageFile) {
        const imageResult = await uploadProfileImage(user.id, imageFile);
        if (!imageResult.success) {
          throw new Error(imageResult.error || "프로필 이미지 업로드에 실패했습니다.");
        }
      }

      // 업데이트할 필드가 있는 경우에만 프로필 업데이트 API 호출
      if (Object.keys(updates).length > 0) {
        const result = await updateUserProfile(user.id, updates);
        if (!result.success) {
          throw new Error(result.error || "프로필 업데이트에 실패했습니다.");
        }
      }

      setSuccess("프로필이 성공적으로 업데이트 되었습니다.");
      
      // 성공 메시지 표시 후 2초 후 모달 닫기
      setTimeout(() => {
        onClose();
        // 페이지 새로고침하여 변경사항 반영
        window.location.reload();
      }, 2000);
      
    } catch (err: any) {
      console.error("프로필 업데이트 오류:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 px-4">
      <div 
        ref={modalRef}
        className="bg-[#050a16] rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-[rgba(255,255,255,0.1)]"
        style={{ maxHeight: "calc(100vh - 40px)", overflowY: "auto" }}
      >
        {/* 모달 헤더 */}
        <div className="flex justify-between items-center p-5 border-b border-[rgba(255,255,255,0.1)]">
          <div className="font-bold text-xl text-white">프로필 설정</div>
          <button 
            onClick={onClose}
            className="text-[#C7C7CC] hover:text-white transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* 모달 본문 */}
        <div className="p-6">
          {/* 에러 메시지 */}
          {error && (
            <div className="bg-[rgba(237,87,87,0.1)] border border-[rgba(237,87,87,0.3)] text-[#ED5757] p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
          
          {/* 성공 메시지 */}
          {success && (
            <div className="bg-[rgba(53,202,133,0.1)] border border-[rgba(53,202,133,0.3)] text-[#35CA85] p-4 rounded-lg mb-4">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 프로필 이미지 */}
            <div className="flex flex-col items-center mb-6">
              <div 
                className="relative w-24 h-24 cursor-pointer group"
                onClick={handleImageClick}
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="프로필 이미지"
                    className="w-24 h-24 rounded-full object-cover border-2 border-[#cba967] group-hover:border-white transition-colors"
                  />
                ) : (
                  <div className="w-24 h-24 bg-[#cba967] rounded-full flex items-center justify-center text-black text-3xl font-medium group-hover:bg-[#d4b67a] transition-colors">
                    {user?.first_name?.charAt(0).toUpperCase() || ''}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm">사진 변경</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <p className="text-[#C7C7CC] text-sm mt-2">
                프로필 이미지를 클릭하여 변경하세요
              </p>
            </div>
            
            {/* 이름 */}
            <div>
              <label className="block text-[#C7C7CC] text-sm mb-1">이름</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full py-3 px-4 bg-[#0d1526] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent"
                placeholder="이름"
              />
            </div>
            
            {/* 성 */}
            <div>
              <label className="block text-[#C7C7CC] text-sm mb-1">성</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full py-3 px-4 bg-[#0d1526] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent"
                placeholder="성"
              />
            </div>
            
            {/* 회사명 */}
            <div>
              <label className="block text-[#C7C7CC] text-sm mb-1">회사명</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full py-3 px-4 bg-[#0d1526] border border-[rgba(255,255,255,0.1)] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#cba967] focus:border-transparent"
                placeholder="회사명"
              />
            </div>
            
            {/* 이메일 (읽기 전용) */}
            <div>
              <label className="block text-[#C7C7CC] text-sm mb-1">이메일</label>
              <input
                type="email"
                value={user?.email || ""}
                readOnly
                disabled
                className="w-full py-3 px-4 bg-[#0d1526] border border-[rgba(255,255,255,0.1)] rounded-lg text-gray-400 cursor-not-allowed"
                placeholder="이메일"
              />
              <p className="text-xs text-[#C7C7CC] mt-1">이메일은 변경할 수 없습니다</p>
            </div>
            
            {/* 가입일 (읽기 전용) */}
            <div>
              <label className="block text-[#C7C7CC] text-sm mb-1">가입일</label>
              <input
                type="text"
                value={user?.created_at ? new Date(user.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : ""}
                readOnly
                disabled
                className="w-full py-3 px-4 bg-[#0d1526] border border-[rgba(255,255,255,0.1)] rounded-lg text-gray-400 cursor-not-allowed"
              />
              <p className="text-xs text-[#C7C7CC] mt-1">가입일은 변경할 수 없습니다.</p>
            </div>
            
            {/* 저장 버튼 */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                  isLoading 
                    ? "bg-gray-500 text-gray-300 cursor-not-allowed" 
                    : "bg-[#cba967] text-black hover:bg-[#d4b67a] transition-colors"
                }`}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <CheckIcon className="h-5 w-5 mr-1" />
                )}
                {isLoading ? "저장 중..." : "변경사항 저장"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal; 
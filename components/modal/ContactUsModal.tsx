'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Upload, Calendar, Check, MessageCircle } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  inquiryType: 'quote' | 'general' | '';
  clientType: 'individual' | 'company' | '';
  name: string;
  email: string;
  phone: string;
  companyName: string;
  fields: string[];
  budget: string;
  projectDate: string;
  content: string;
  files: File[];
  privacyConsent: boolean;
}

interface FormErrors {
  inquiryType?: string;
  clientType?: string;
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  fields?: string;
  budget?: string;
  projectDate?: string;
  content?: string;
  files?: string;
  privacyConsent?: string;
}

const initialFormData: FormData = {
  inquiryType: '',
  clientType: '',
  name: '',
  email: '',
  phone: '',
  companyName: '',
  fields: [],
  budget: '',
  projectDate: '',
  content: '',
  files: [],
  privacyConsent: false,
};

export default function ContactUsModal({ isOpen, onClose }: ContactUsModalProps) {
  const messages = useMessages();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔒 모달이 열렸을 때 배경 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      // 모달이 열렸을 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
      // 스크롤바 너비만큼 padding 추가 (레이아웃 시프트 방지)
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      // 모달이 닫혔을 때 스크롤 복원
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // 🎯 오버레이 클릭 핸들러
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // 오버레이 자체를 클릭했을 때만 모달 닫기
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // 🔄 폼 데이터 업데이트 함수
  const updateFormData = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 클리어
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // ✅ 폼 검증 함수
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 필수 필드 검증
    if (!formData.inquiryType) newErrors.inquiryType = messages?.contact?.modal?.validation?.inquiryTypeRequired || '문의 유형을 선택해주세요.';
    if (!formData.clientType) newErrors.clientType = messages?.contact?.modal?.validation?.clientTypeRequired || '본인 유형을 선택해주세요.';
    if (!formData.name || formData.name.length < 2 || formData.name.length > 20) {
      newErrors.name = messages?.contact?.modal?.validation?.nameLength || '이름은 2-20자 사이로 입력해주세요.';
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = messages?.contact?.modal?.validation?.emailValid || '올바른 이메일 형식을 입력해주세요.';
    }
    if (!formData.phone || !/^[+]?\d{10,15}$/.test(formData.phone.replace(/-/g, ''))) {
      newErrors.phone = messages?.contact?.modal?.validation?.phoneValid || '올바른 연락처를 입력해주세요. (10-15자리 숫자)';
    }
    if (formData.clientType === 'company' && (!formData.companyName || formData.companyName.length < 2)) {
      newErrors.companyName = messages?.contact?.modal?.validation?.companyNameLength || '회사명을 2자 이상 입력해주세요.';
    }
    if (formData.inquiryType === 'quote' && formData.fields.length === 0) {
      newErrors.fields = messages?.contact?.modal?.validation?.fieldsRequired || '분야를 최소 1개 선택해주세요.';
    }
    if (!formData.content || formData.content.length < 2 || formData.content.length > 500) {
      newErrors.content = messages?.contact?.modal?.validation?.contentLength || '문의내용은 2-500자 사이로 입력해주세요.';
    }
    if (!formData.privacyConsent) {
      newErrors.privacyConsent = messages?.contact?.modal?.validation?.privacyRequired || '개인정보 처리방침에 동의해주세요.';
    }

    setErrors(newErrors);

    // 에러가 있으면 첫 번째 에러 필드로 스크롤
    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    return Object.keys(newErrors).length === 0;
  };

  // 📁 파일 처리 함수들
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).slice(0, 5 - formData.files.length);
    const validFiles = newFiles.filter(file => {
      const isValidType = /\.(pdf|doc|docx|jpg|jpeg|png)$/i.test(file.name);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    updateFormData('files', [...formData.files, ...validFiles]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = formData.files.filter((_, i) => i !== index);
    updateFormData('files', newFiles);
  };

  // 📡 폼 제출 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      console.log('🚀 문의 접수 시작');
      console.log('📤 전송 데이터:', {
        inquiryType: formData.inquiryType,
        clientType: formData.clientType,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        privacyConsent: formData.privacyConsent
      });

      // 1️⃣ 먼저 문의 정보를 제출
      let inquiryResponse;
      try {
        inquiryResponse = await fetch('/api/contact-inquiry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inquiryType: formData.inquiryType,
            clientType: formData.clientType,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            companyName: formData.companyName,
            fields: formData.fields,
            budget: formData.budget,
            projectDate: formData.projectDate,
            content: formData.content,
            privacyConsent: formData.privacyConsent,
          }),
        });
      } catch (networkError) {
        console.error('❌ 네트워크 요청 실패:', networkError);
        throw new Error('네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인하고 다시 시도해주세요.');
      }

      let inquiryResult;
      try {
        inquiryResult = await inquiryResponse.json();
      } catch (jsonError) {
        console.error('❌ 응답 파싱 실패:', jsonError);
        console.error('❌ 응답 상태:', inquiryResponse.status, inquiryResponse.statusText);
        throw new Error(`서버 응답을 처리할 수 없습니다. (상태: ${inquiryResponse.status})`);
      }

      console.log('📨 서버 응답:', { 
        status: inquiryResponse.status, 
        ok: inquiryResponse.ok,
        result: inquiryResult 
      });

      if (!inquiryResponse.ok) {
        // 서버 검증 오류 처리
        if (inquiryResult.field) {
          setErrors({ [inquiryResult.field]: inquiryResult.message });
        }
        
        // 자세한 에러 메시지 구성
        let errorMessage = inquiryResult.message || '문의 접수에 실패했습니다.';
        if (inquiryResult.details) {
          console.error('❌ 서버 에러 상세:', inquiryResult.details);
          errorMessage += '\n\n상세 정보: ' + inquiryResult.details;
        }
        
        throw new Error(errorMessage);
      }

      console.log('✅ 문의 접수 완료:', inquiryResult);

      // 2️⃣ 이메일 발송 (관리자 알림 + 고객 확인)
      let emailSentSuccessfully = false;
      try {
        console.log('📧 이메일 발송 시작...');
        
        // 관리자 알림 및 고객 확인 이메일을 함께 발송
        const emailResponse = await fetch('/api/send-inquiry-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inquiryId: inquiryResult.inquiryId
            // emailType을 지정하지 않으면 자동으로 둘 다 발송
          }),
        });

        const emailResult = await emailResponse.json();

        if (!emailResponse.ok) {
          console.warn('⚠️ 이메일 발송 실패:', emailResult);
          // 이메일 실패해도 문의는 접수된 상태이므로 경고만 표시
        } else {
          console.log('✅ 이메일 발송 완료:', emailResult);
          emailSentSuccessfully = true;
        }
      } catch (emailError) {
        console.warn('⚠️ 이메일 발송 중 오류 (문의는 정상 접수됨):', emailError);
      }

      // 3️⃣ 파일이 있다면 파일 업로드
      if (formData.files.length > 0) {
        console.log('📁 파일 업로드 시작:', formData.files.length + '개');

        const fileFormData = new FormData();
        fileFormData.append('inquiryId', inquiryResult.inquiryId);
        
        formData.files.forEach(file => {
          fileFormData.append('files', file);
        });

        const fileResponse = await fetch('/api/upload-inquiry-files', {
          method: 'POST',
          body: fileFormData,
        });

        const fileResult = await fileResponse.json();

        if (!fileResponse.ok && fileResponse.status !== 207) {
          console.warn('⚠️ 파일 업로드 실패:', fileResult);
          // 파일 업로드 실패해도 문의는 접수된 상태이므로 경고만 표시
          alert(`문의는 접수되었지만 파일 업로드에 실패했습니다: ${fileResult.message}`);
        } else {
          console.log('✅ 파일 업로드 완료:', fileResult);
          if (fileResult.errors && fileResult.errors.length > 0) {
            console.warn('⚠️ 일부 파일 업로드 실패:', fileResult.errors);
          }
        }
      }

      // 4️⃣ 성공 처리
      const successMessage = emailSentSuccessfully 
        ? (messages?.contact?.modal?.messages?.success || '문의가 성공적으로 접수되었습니다. 확인 이메일을 발송했으며, 빠른 시일 내에 연락드리겠습니다.')
        : (messages?.contact?.modal?.messages?.successWithoutEmail || '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다. (이메일 발송은 실패했지만 문의는 정상 접수되었습니다.)');
      
      alert(successMessage);
      setFormData(initialFormData);
      onClose();
      
    } catch (error) {
      console.error('❌ 문의 접수 실패:', error);
      
      // 에러 타입에 따른 메시지 구성
      let errorMessage = messages?.contact?.modal?.messages?.error || '문의 접수 중 오류가 발생했습니다.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // 개발 환경에서만 상세 에러 표시
        if (process.env.NODE_ENV === 'development') {
          console.error('🔍 개발자 정보:', {
            name: error.name,
            stack: error.stack
          });
        }
      }
      
      alert(errorMessage + '\n\n' + (messages?.contact?.modal?.messages?.error?.split('\n\n')[1] || '다시 시도해주세요.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div 
        className="w-full max-w-2xl max-h-[90vh] bg-[#0c1526] rounded-2xl overflow-hidden border border-[#1a2332] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 md:p-4 border-b border-[#1a2332] flex-shrink-0">
          <h2 className="text-lg md:text-lg font-semibold text-white">{messages?.contact?.modal?.title || '서비스 문의'}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-[#1a2332] rounded-lg transition-colors"
            aria-label="닫기"
          >
            <X size={18} className="md:w-4 md:h-4" />
          </button>
        </div>

        {/* 아이콘 영역 */}
        <div className="flex justify-center py-3 md:py-4 flex-shrink-0">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-[#cba967] to-[#b99a58] rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
        </div>

        {/* 안내 텍스트 */}
        <div className="text-center px-4 md:px-4 pb-2 md:pb-3 flex-shrink-0">
          <p className="text-gray-300 text-xs md:text-sm">
            {messages?.contact?.modal?.subtitle || '프로젝트 문의를 상세히 작성해주세요'}
          </p>
        </div>

        {/* 폼 내용 - 스크롤 가능 영역 */}
        <div className="flex-1 overflow-y-auto px-4 md:px-5 pb-4">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
            {/* 문의 유형 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                {messages?.contact?.modal?.inquiryType?.label || '문의 유형'} <span className="text-red-400">{messages?.contact?.modal?.inquiryType?.required || '*'}</span>
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'quote', label: messages?.contact?.modal?.inquiryType?.quote || '견적문의' },
                  { value: 'general', label: messages?.contact?.modal?.inquiryType?.general || '기타문의' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    name="inquiryType"
                    onClick={() => updateFormData('inquiryType', option.value)}
                    className={`flex-1 py-3 px-4 rounded-xl border transition-all font-medium text-sm ${
                      formData.inquiryType === option.value
                        ? 'border-[#cba967] bg-[#cba967] text-white shadow-lg'
                        : 'border-[#243142] bg-[#152030] text-gray-300 hover:border-[#cba967] hover:bg-[#1f2937]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.inquiryType && <p className="mt-2 text-sm text-red-400">{errors.inquiryType}</p>}
            </div>

            {/* 본인 유형 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                {messages?.contact?.modal?.clientType?.label || '본인 유형'} <span className="text-red-400">{messages?.contact?.modal?.clientType?.required || '*'}</span>
              </label>
              <div className="flex gap-3">
                {[
                  { value: 'individual', label: messages?.contact?.modal?.clientType?.individual || '개인' },
                  { value: 'company', label: messages?.contact?.modal?.clientType?.company || '법인' }
                ].map(option => (
                  <button
                    key={option.value}
                    type="button"
                    name="clientType"
                    onClick={() => updateFormData('clientType', option.value)}
                    className={`flex-1 py-3 px-4 rounded-xl border transition-all font-medium text-sm ${
                      formData.clientType === option.value
                        ? 'border-[#cba967] bg-[#cba967] text-white shadow-lg'
                        : 'border-[#243142] bg-[#152030] text-gray-300 hover:border-[#cba967] hover:bg-[#1f2937]'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {errors.clientType && <p className="mt-2 text-sm text-red-400">{errors.clientType}</p>}
            </div>

            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {messages?.contact?.modal?.fields?.name?.label || '이름/담당자명'} <span className="text-red-400">{messages?.contact?.modal?.fields?.name?.required || '*'}</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  name="name"
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="w-full p-3 bg-[#152030] border border-[#243142] rounded-xl text-white placeholder-gray-500 focus:border-[#cba967] focus:outline-none transition-colors"
                  placeholder={messages?.contact?.modal?.fields?.name?.placeholder || '이름을 입력해주세요'}
                />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {messages?.contact?.modal?.fields?.email?.label || '이메일'} <span className="text-red-400">{messages?.contact?.modal?.fields?.email?.required || '*'}</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  name="email"
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="w-full p-3 bg-[#152030] border border-[#243142] rounded-xl text-white placeholder-gray-500 focus:border-[#cba967] focus:outline-none transition-colors"
                  placeholder={messages?.contact?.modal?.fields?.email?.placeholder || 'example@email.com'}
                />
                {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {messages?.contact?.modal?.fields?.phone?.label || '연락처'} <span className="text-red-400">{messages?.contact?.modal?.fields?.phone?.required || '*'}</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  name="phone"
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className="w-full p-3 bg-[#152030] border border-[#243142] rounded-xl text-white placeholder-gray-500 focus:border-[#cba967] focus:outline-none transition-colors"
                  placeholder={messages?.contact?.modal?.fields?.phone?.placeholder || '010-1234-5678'}
                />
                {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
              </div>

              {formData.clientType === 'company' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {messages?.contact?.modal?.fields?.companyName?.label || '회사명'} <span className="text-red-400">{messages?.contact?.modal?.fields?.companyName?.required || '*'}</span>
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    name="companyName"
                    onChange={(e) => updateFormData('companyName', e.target.value)}
                    className="w-full p-3 bg-[#152030] border border-[#243142] rounded-xl text-white placeholder-gray-500 focus:border-[#cba967] focus:outline-none transition-colors"
                    placeholder={messages?.contact?.modal?.fields?.companyName?.placeholder || '회사명을 입력해주세요'}
                  />
                  {errors.companyName && <p className="mt-1 text-sm text-red-400">{errors.companyName}</p>}
                </div>
              )}
            </div>

            {/* 분야 선택 (견적문의시만) */}
            {formData.inquiryType === 'quote' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  {messages?.contact?.modal?.serviceFields?.label || '분야 선택 (복수 선택 가능)'} <span className="text-red-400">{messages?.contact?.modal?.serviceFields?.required || '*'}</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { key: 'video', label: messages?.contact?.modal?.serviceFields?.video || '영상제작' },
                    { key: 'webapp', label: messages?.contact?.modal?.serviceFields?.webapp || '웹앱제작' },
                    { key: 'sns', label: messages?.contact?.modal?.serviceFields?.sns || 'SNS컨텐츠' }
                  ].map(field => (
                    <button
                      key={field.key}
                      type="button"
                      onClick={() => {
                        const newFields = formData.fields.includes(field.label)
                          ? formData.fields.filter(f => f !== field.label)
                          : [...formData.fields, field.label];
                        updateFormData('fields', newFields);
                      }}
                      className={`py-3 px-4 rounded-xl border transition-all font-medium text-sm ${
                        formData.fields.includes(field.label)
                          ? 'border-[#cba967] bg-[#cba967] text-white shadow-lg'
                          : 'border-[#243142] bg-[#152030] text-gray-300 hover:border-[#cba967] hover:bg-[#1f2937]'
                      }`}
                    >
                      {field.label}
                    </button>
                  ))}
                </div>
                {errors.fields && <p className="mt-2 text-sm text-red-400">{errors.fields}</p>}
              </div>
            )}

            {/* 예산 범위 (견적문의시만) */}
            {formData.inquiryType === 'quote' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  {messages?.contact?.modal?.budget?.label || '예산 범위'}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { value: 'under-1000', label: messages?.contact?.modal?.budget?.under1000 || '1000만원 미만' },
                    { value: '1000-5000', label: messages?.contact?.modal?.budget?.range1000 || '1000-5000만원' },
                    { value: 'over-5000', label: messages?.contact?.modal?.budget?.over5000 || '5000만원 이상' },
                    { value: 'negotiable', label: messages?.contact?.modal?.budget?.negotiable || '협의' }
                  ].map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateFormData('budget', option.value)}
                      className={`py-3 px-4 rounded-xl border transition-all font-medium text-sm ${
                        formData.budget === option.value
                          ? 'border-[#cba967] bg-[#cba967] text-white shadow-lg'
                          : 'border-[#243142] bg-[#152030] text-gray-300 hover:border-[#cba967] hover:bg-[#1f2937]'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 프로젝트 일정 (견적문의시만) */}
            {formData.inquiryType === 'quote' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {messages?.contact?.modal?.projectDate?.label || '프로젝트 일정'}
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.projectDate}
                      onChange={(e) => updateFormData('projectDate', e.target.value)}
                      className="w-full p-3 pr-12 bg-[#152030] border border-[#243142] rounded-xl text-white focus:border-[#cba967] focus:outline-none transition-colors [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      min={new Date().toISOString().split('T')[0]}
                      lang="en-US"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#cba967] pointer-events-none" />
                  </div>
                </div>
                <div></div> {/* 빈 공간으로 그리드 균형 맞추기 */}
              </div>
            )}

            {/* 문의 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages?.contact?.modal?.content?.label || '상세 문의사항'} <span className="text-red-400">{messages?.contact?.modal?.content?.required || '*'}</span>
              </label>
              <textarea
                value={formData.content}
                name="content"
                onChange={(e) => updateFormData('content', e.target.value)}
                rows={5}
                className="w-full p-3 bg-[#152030] border border-[#243142] rounded-xl text-white placeholder-gray-500 focus:border-[#cba967] focus:outline-none transition-colors resize-none"
                placeholder={messages?.contact?.modal?.content?.placeholder || '문의사항을 상세히 작성해주세요 (2-500자)'}
              />
              <div className="mt-1 flex justify-between text-xs">
                <span>{errors.content && <span className="text-red-400">{errors.content}</span>}</span>
                <span className="text-gray-500">{formData.content.length}/500</span>
              </div>
            </div>

            {/* 첨부파일 */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {messages?.contact?.modal?.files?.label || '첨부파일 (최대 5개, 각 10MB 이하)'}
              </label>
              <div
                className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
                  dragActive ? 'border-[#cba967] bg-[#cba967]/10' : 'border-[#243142] bg-[#152030]'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="mx-auto h-8 w-8 text-gray-400 mb-3" />
                <p className="text-gray-400 mb-2 text-sm">{messages?.contact?.modal?.files?.dragText || '파일을 여기로 드래그하거나'}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[#cba967] hover:text-[#b99a58] font-medium text-sm"
                >
                  {messages?.contact?.modal?.files?.selectButton || '파일 선택하기'}
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  {messages?.contact?.modal?.files?.allowedTypes || 'PDF, DOC, DOCX, JPG, JPEG, PNG 파일만 업로드 가능'}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              
              {/* 업로드된 파일 목록 */}
              {formData.files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {formData.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-[#152030] rounded-lg border border-[#243142]">
                      <span className="text-sm text-gray-300 truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 개인정보 동의 */}
            <div>
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="privacyConsent"
                  checked={formData.privacyConsent}
                  onChange={(e) => updateFormData('privacyConsent', e.target.checked)}
                  className="w-4 h-4 text-[#cba967] bg-[#152030] border-[#243142] rounded focus:ring-[#cba967] focus:ring-2 mt-1"
                />
                <div className="text-sm">
                  <span className="text-gray-300">
                    {messages?.contact?.modal?.privacy?.consent || '개인정보 수집 및 이용에 동의합니다.'} <span className="text-red-400">{messages?.contact?.modal?.privacy?.required || '*'}</span>
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {messages?.contact?.modal?.privacy?.description || '수집된 개인정보는 문의 처리 및 서비스 안내 목적으로만 사용됩니다.'}
                  </p>
                </div>
              </label>
              {errors.privacyConsent && <p className="mt-2 text-sm text-red-400">{errors.privacyConsent}</p>}
            </div>
          </form>
        </div>

        {/* 제출 버튼 - 고정 영역 */}
        <div className="p-4 md:p-4 border-t border-[#1a2332] flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full bg-[#cba967] hover:bg-[#b99a58] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center text-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {messages?.contact?.modal?.submit?.submitting || '문의 접수 중...'}
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {messages?.contact?.modal?.submit?.button || '문의하기'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 
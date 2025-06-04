const messages = {
  header: {
    greeting: "안녕하세요, {name}님",
    loading: "로딩 중...",
    resetData: "데이터 초기화"
  },
  navigation: {
    login: "로그인",
    logout: "로그아웃",
    profile: "프로필",
    logoutError: "로그아웃 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
  },
  profile: {
    role: {
      admin: '관리자',
      member: '기본 회원'
    },
    emailStatus: {
      verified: '✓ 인증됨',
      unverified: '미인증'
    },
    menu: {
      mainPage: '메인페이지로',
      dashboard: '대시보드',
      settings: '프로필 설정',
      logout: '로그아웃'
    },
    modal: {
      title: '프로필 설정',
      firstName: '이름',
      firstNamePlaceholder: '이름을 입력하세요',
      lastName: '성',
      lastNamePlaceholder: '성을 입력하세요',
      companyName: '회사명',
      companyNamePlaceholder: '회사명을 입력하세요',
      imageUpload: '프로필 이미지 업로드',
      save: '저장',
      saving: '저장 중...',
      success: '프로필이 성공적으로 업데이트 되었습니다.',
      email: '이메일',
      emailPlaceholder: '이메일',
      emailReadOnly: '이메일은 변경할 수 없습니다',
      joinDate: '가입일',
      joinDateReadOnly: '가입일은 변경할 수 없습니다.',
      error: {
        imageUpload: '프로필 이미지 업로드에 실패했습니다.',
        update: '프로필 업데이트에 실패했습니다.'
      }
    }
  },
  auth: {
    login: {
      google: "Google로 로그인",
      loading: "로딩 중...",
      authenticating: "로그인 중...",
      error: "로그인 실패",
      googleLogin: "구글 계정으로 로그인",
      appleLogin: "애플 계정으로 로그인",
      social: {
        google: "Google로 계속하기",
        github: "GitHub로 계속하기",
        kakao: "카카오로 계속하기"
      },
      validation: {
        required: "필수 입력 항목입니다.",
        email: "유효한 이메일 주소를 입력해주세요.",
        password: "비밀번호는 8자 이상이어야 합니다.",
        passwordComplex: "비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다.",
        terms: "이용약관에 동의해주세요."
      },
      errors: {
        default: "오류가 발생했습니다. 다시 시도해주세요.",
        network: "네트워크 연결을 확인해주세요.",
        invalidCredentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
        accountLocked: "계정이 잠겼습니다. 관리자에게 문의하세요.",
        tooManyAttempts: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요."
      },
      modal: {
        title: "로그인",
        description: "계정에 로그인하여 브릿지메이커스의 서비스를 이용하세요",
        emailLabel: "이메일",
        emailPlaceholder: "이메일을 입력하세요",
        emailError: "이메일을 입력해주세요.",
        emailInvalid: "유효한 이메일 주소를 입력해주세요.",
        passwordLabel: "비밀번호",
        passwordPlaceholder: "비밀번호를 입력하세요",
        passwordError: "비밀번호를 입력해주세요.",
        passwordInvalid: "비밀번호는 8자 이상, 대문자, 소문자, 숫자, 특수문자(@$!%*?&)를 포함해야 합니다.",
        submitButton: "로그인",
        registerLink: "회원가입",
        forgotLink: "비밀번호를 잊으셨나요?",
        error: "로그인에 실패했습니다.",
        or: "또는",
        noAccount: "계정이 없으신가요?",
        alreadyAccount: "이미 계정이 있으신가요?",
        loginLink: "로그인",
        rememberMe: "자동 로그인"
      },
      register: {
        title: "회원가입",
        description: "브릿지메이커스에 가입하고 서비스를 이용하세요",
        firstNameLabel: "이름",
        firstNamePlaceholder: "이름을 입력하세요",
        firstNameError: "이름을 입력해주세요.",
        lastNameLabel: "성",
        lastNamePlaceholder: "성을 입력하세요",
        lastNameError: "성을 입력해주세요.",
        confirmPasswordLabel: "비밀번호 확인",
        confirmPasswordPlaceholder: "비밀번호를 다시 입력하세요",
        confirmPasswordError: "비밀번호 확인을 입력해주세요.",
        confirmPasswordMismatch: "비밀번호가 일치하지 않습니다.",
        termsLabel: "이용약관에 동의합니다",
        termsError: "이용약관에 동의해주세요.",
        submitButton: "회원가입",
        loginLink: "이미 계정이 있으신가요? 로그인",
        success: "회원가입이 완료되었습니다. 이메일을 확인해주세요.",
        error: "회원가입에 실패했습니다."
      },
      forgot: {
        title: "비밀번호 재설정",
        description: "등록된 이메일 주소로 비밀번호 재설정 링크를 보내드립니다.",
        submitButton: "재설정 링크 보내기",
        loginLink: "로그인으로 돌아가기",
        success: "비밀번호 재설정 링크가 이메일로 전송되었습니다.",
        error: "비밀번호 재설정 링크 전송에 실패했습니다."
      },
      verification: {
        title: "이메일 인증",
        successTitle: "인증 완료",
        description: "다음 이메일로 6자리 인증 코드를 보내드렸습니다:",
        instruction: "코드를 입력하여 회원가입을 완료해주세요.",
        verifyButton: "인증하기",
        verifying: "인증 중...",
        resendButton: "새 코드 받기",
        resendButtonTimer: "재전송 가능 ({time})",
        resending: "재전송 중...",
        validTime: "코드 유효시간: {time}",
        expired: "코드가 만료되었습니다. 새 코드를 요청해주세요.",
        success: {
          title: "인증 완료! 🎉",
          description: "회원가입이 성공적으로 완료되었습니다.\n잠시 후 자동으로 이동됩니다."
        },
        error: {
          invalidCode: "인증 코드가 올바르지 않거나 만료되었습니다.",
          tooManyAttempts: "너무 많은 시도를 했습니다. 잠시 후 다시 시도해주세요.",
          default: "인증에 실패했습니다. 다시 시도해주세요.",
          resend: "코드 재전송에 실패했습니다. 잠시 후 다시 시도해주세요."
        },
        help: {
          title: "코드가 도착하지 않나요?",
          description: "스팸함을 확인하거나 몇 분 후 다시 시도해보세요."
        }
      }
    },
    logout: {
      button: "로그아웃",
      authenticating: "로그아웃 중...",
      error: "로그아웃 실패"
    }
  },
  contact: {
    modal: {
      title: '서비스 문의',
      subtitle: '프로젝트 문의를 상세히 작성해주세요',
      inquiryType: {
        label: '문의 유형',
        required: '*',
        quote: '견적문의',
        general: '기타문의'
      },
      clientType: {
        label: '본인 유형',
        required: '*',
        individual: '개인',
        company: '법인'
      },
      fields: {
        name: {
          label: '이름/담당자명',
          placeholder: '이름을 입력해주세요',
          required: '*'
        },
        email: {
          label: '이메일',
          placeholder: 'example@email.com',
          required: '*'
        },
        phone: {
          label: '연락처',
          placeholder: '010-1234-5678',
          required: '*'
        },
        companyName: {
          label: '회사명',
          placeholder: '회사명을 입력해주세요',
          required: '*'
        }
      },
      serviceFields: {
        label: '분야 선택 (복수 선택 가능)',
        required: '*',
        video: '영상제작',
        webapp: '웹앱제작',
        sns: 'SNS컨텐츠'
      },
      budget: {
        label: '예산 범위',
        under1000: '1000만원 미만',
        range1000: '1000-5000만원',
        over5000: '5000만원 이상',
        negotiable: '협의'
      },
      projectDate: {
        label: '프로젝트 일정'
      },
      content: {
        label: '상세 문의사항',
        placeholder: '문의사항을 상세히 작성해주세요 (2-500자)',
        required: '*',
        counter: '{current}/{max}'
      },
      files: {
        label: '첨부파일 (최대 5개, 각 10MB 이하)',
        dragText: '파일을 여기로 드래그하거나',
        selectButton: '파일 선택하기',
        allowedTypes: 'PDF, DOC, DOCX, JPG, JPEG, PNG 파일만 업로드 가능'
      },
      privacy: {
        consent: '개인정보 수집 및 이용에 동의합니다.',
        required: '*',
        description: '수집된 개인정보는 문의 처리 및 서비스 안내 목적으로만 사용됩니다.'
      },
      submit: {
        button: '문의하기',
        submitting: '문의 접수 중...'
      },
      validation: {
        inquiryTypeRequired: '문의 유형을 선택해주세요.',
        clientTypeRequired: '본인 유형을 선택해주세요.',
        nameLength: '이름은 2-20자 사이로 입력해주세요.',
        emailValid: '올바른 이메일 형식을 입력해주세요.',
        phoneValid: '올바른 연락처를 입력해주세요. (10-15자리 숫자)',
        companyNameLength: '회사명을 2자 이상 입력해주세요.',
        fieldsRequired: '분야를 최소 1개 선택해주세요.',
        contentLength: '문의내용은 2-500자 사이로 입력해주세요.',
        privacyRequired: '개인정보 처리방침에 동의해주세요.'
      },
      messages: {
        success: '문의가 성공적으로 접수되었습니다. 확인 이메일을 발송했으며, 빠른 시일 내에 연락드리겠습니다.',
        successWithoutEmail: '문의가 성공적으로 접수되었습니다. 빠른 시일 내에 연락드리겠습니다. (이메일 발송은 실패했지만 문의는 정상 접수되었습니다.)',
        error: '문의 접수 중 오류가 발생했습니다.\n\n다시 시도해주세요.'
      }
    }
  },
  home: {
    hero: {
      title: {
        line1: "당신의 비전을 실현할 시간",
        line2: "지금, 필요한 디지털 컨텐츠를 만드세요"
      },
      description: "영상 제작부터 웹사이트, 마케팅까지. 당신의 브랜드를 위한 디지털 솔루션을 제공합니다.",
      motto: "Made in Europe, with Korean creativity.",
      cta: "상담하기"
    },
    video: {
      title: "See How We Can Help Your Brand",
      play: "Play Video"
    },
    features: {
      creative: {
        title: "크리에이티브 전문가",
        description: "웹디자인과 영상 제작에 특화된 팀이 직접 기획하고 제작합니다"
      },
      strategy: {
        title: "맞춤형 전략",
        description: "디지털 콘텐츠가 낯선 기업도 걱정 없이! 단계별 계획과 타임테이블을 제공합니다"
      },
      localized: {
        title: "현지 맞춤 컨텐츠",
        description: "언어와 문화를 반영해 유럽 시장에 딱 맞는 컨텐츠를 만듭니다"
      }
    },
    projects: {
      title: "프로젝트",
      description: "다양한 컨텐츠 제작 프로젝트와 클라이언트 성공 사례를 소개합니다",
      viewAll: "모든 프로젝트 보기"
    },
    instagram: {
      title: "Instagram",
      description: "인스타그램에서 Bridge Makers의 최신 소식과 작업을 확인하세요",
      follow: "@bridgemakers_gmbh 팔로우하기"
    }
  }
};

export default messages; 
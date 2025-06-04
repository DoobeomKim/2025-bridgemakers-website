export interface Messages {
  header: {
    greeting: string;
    loading: string;
    resetData: string;
  };
  navigation: {
    login: string;
    logout: string;
    profile: string;
    logoutError: string;
  };
  profile: {
    role: {
      admin: string;
      member: string;
    };
    emailStatus: {
      verified: string;
      unverified: string;
    };
    menu: {
      mainPage: string;
      dashboard: string;
      settings: string;
      logout: string;
    };
    modal: {
      title: string;
      firstName: string;
      firstNamePlaceholder: string;
      lastName: string;
      lastNamePlaceholder: string;
      companyName: string;
      companyNamePlaceholder: string;
      imageUpload: string;
      save: string;
      saving: string;
      success: string;
      email: string;
      emailPlaceholder: string;
      emailReadOnly: string;
      joinDate: string;
      joinDateReadOnly: string;
      error: {
        imageUpload: string;
        update: string;
      };
    };
  };
  auth: {
    login: {
      google: string;
      loading: string;
      authenticating: string;
      error: string;
      googleLogin: string;
      appleLogin: string;
      social: {
        google: string;
        github: string;
        kakao: string;
      };
      validation: {
        required: string;
        email: string;
        password: string;
        passwordComplex: string;
        terms: string;
      };
      errors: {
        default: string;
        network: string;
        invalidCredentials: string;
        accountLocked: string;
        tooManyAttempts: string;
      };
      modal: {
        title: string;
        description: string;
        emailLabel: string;
        emailPlaceholder: string;
        emailError: string;
        emailInvalid: string;
        passwordLabel: string;
        passwordPlaceholder: string;
        passwordError: string;
        passwordInvalid: string;
        submitButton: string;
        registerLink: string;
        forgotLink: string;
        error: string;
        or: string;
        noAccount: string;
        alreadyAccount: string;
        loginLink: string;
        rememberMe: string;
      };
      register: {
        title: string;
        description: string;
        firstNameLabel: string;
        firstNamePlaceholder: string;
        firstNameError: string;
        lastNameLabel: string;
        lastNamePlaceholder: string;
        lastNameError: string;
        confirmPasswordLabel: string;
        confirmPasswordPlaceholder: string;
        confirmPasswordError: string;
        confirmPasswordMismatch: string;
        termsLabel: string;
        termsError: string;
        submitButton: string;
        loginLink: string;
        success: string;
        error: string;
      };
      forgot: {
        title: string;
        description: string;
        submitButton: string;
        loginLink: string;
        success: string;
        error: string;
      };
    };
    logout: {
      button: string;
      authenticating: string;
      error: string;
    };
    verification: {
      title: string;
      successTitle: string;
      description: string;
      instruction: string;
      verifyButton: string;
      verifying: string;
      resendButton: string;
      resendButtonTimer: string;
      resending: string;
      validTime: string;
      expired: string;
      success: {
        title: string;
        description: string;
      };
      error: {
        invalidCode: string;
        tooManyAttempts: string;
        default: string;
        resend: string;
      };
      help: {
        title: string;
        description: string;
      };
    };
  };
  contact: {
    modal: {
      title: string;
      subtitle: string;
      inquiryType: {
        label: string;
        required: string;
        quote: string;
        general: string;
      };
      clientType: {
        label: string;
        required: string;
        individual: string;
        company: string;
      };
      fields: {
        name: {
          label: string;
          placeholder: string;
          required: string;
        };
        email: {
          label: string;
          placeholder: string;
          required: string;
        };
        phone: {
          label: string;
          placeholder: string;
          required: string;
        };
        companyName: {
          label: string;
          placeholder: string;
          required: string;
        };
      };
      serviceFields: {
        label: string;
        required: string;
        video: string;
        webapp: string;
        sns: string;
      };
      budget: {
        label: string;
        under1000: string;
        range1000: string;
        over5000: string;
        negotiable: string;
      };
      projectDate: {
        label: string;
      };
      content: {
        label: string;
        placeholder: string;
        required: string;
        counter: string;
      };
      files: {
        label: string;
        dragText: string;
        selectButton: string;
        allowedTypes: string;
      };
      privacy: {
        consent: string;
        required: string;
        description: string;
      };
      submit: {
        button: string;
        submitting: string;
      };
      validation: {
        inquiryTypeRequired: string;
        clientTypeRequired: string;
        nameLength: string;
        emailValid: string;
        phoneValid: string;
        companyNameLength: string;
        fieldsRequired: string;
        contentLength: string;
        privacyRequired: string;
      };
      messages: {
        success: string;
        successWithoutEmail: string;
        error: string;
      };
    };
  };
  home: {
    hero: {
      title: {
        line1: string;
        line2: string;
      };
      description: string;
      motto: string;
      cta: string;
    };
    video: {
      title: string;
      play: string;
    };
    features: {
      creative: {
        title: string;
        description: string;
      };
      strategy: {
        title: string;
        description: string;
      };
      localized: {
        title: string;
        description: string;
      };
    };
    projects: {
      title: string;
      description: string;
      viewAll: string;
    };
    instagram: {
      title: string;
      description: string;
      follow: string;
    };
  };
} 
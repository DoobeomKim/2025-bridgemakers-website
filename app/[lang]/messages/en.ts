const messages = {
  header: {
    greeting: "Hello, {name}",
    loading: "Loading...",
    resetData: "Reset Data"
  },
  navigation: {
    login: "Sign In",
    logout: "Sign Out",
    profile: "Profile",
    logoutError: "Error during sign out. Please refresh the page."
  },
  profile: {
    role: {
      admin: 'Administrator',
      member: 'Member'
    },
    emailStatus: {
      verified: '✓ Verified',
      unverified: 'Unverified'
    },
    menu: {
      mainPage: 'Go to Main',
      dashboard: 'Dashboard',
      settings: 'Profile Settings',
      logout: 'Logout'
    },
    modal: {
      title: 'Profile Settings',
      firstName: 'First Name',
      firstNamePlaceholder: 'Enter your first name',
      lastName: 'Last Name',
      lastNamePlaceholder: 'Enter your last name',
      companyName: 'Company Name',
      companyNamePlaceholder: 'Enter your company name',
      imageUpload: 'Upload Profile Image',
      save: 'Save',
      saving: 'Saving...',
      success: 'Profile has been successfully updated.',
      email: 'Email',
      emailPlaceholder: 'Email',
      emailReadOnly: 'Email cannot be changed',
      joinDate: 'Join Date',
      joinDateReadOnly: 'Join date cannot be changed.',
      error: {
        imageUpload: 'Failed to upload profile image.',
        update: 'Failed to update profile.'
      }
    }
  },
  auth: {
    login: {
      google: "Sign in with Google",
      loading: "Loading...",
      authenticating: "Signing in...",
      error: "Sign in failed",
      googleLogin: "Continue with Google",
      appleLogin: "Continue with Apple",
      social: {
        google: "Continue with Google",
        github: "Continue with GitHub",
        kakao: "Continue with Kakao"
      },
      validation: {
        required: "This field is required.",
        email: "Please enter a valid email address.",
        password: "Password must be at least 8 characters long.",
        passwordComplex: "Password must include uppercase, lowercase, number, and special character.",
        terms: "Please agree to the terms and conditions."
      },
      errors: {
        default: "An error occurred. Please try again.",
        network: "Please check your network connection.",
        invalidCredentials: "Invalid email or password.",
        accountLocked: "Account is locked. Please contact administrator.",
        tooManyAttempts: "Too many login attempts. Please try again later."
      },
      modal: {
        title: "Sign In",
        description: "Sign in to your account to use Bridgemakers services",
        emailLabel: "Email",
        emailPlaceholder: "Enter your email",
        emailError: "Please enter your email.",
        emailInvalid: "Please enter a valid email address.",
        passwordLabel: "Password",
        passwordPlaceholder: "Enter your password",
        passwordError: "Please enter your password.",
        passwordInvalid: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character (@$!%*?&).",
        submitButton: "Sign In",
        registerLink: "Sign Up",
        forgotLink: "Forgot your password?",
        error: "Failed to sign in.",
        or: "or",
        noAccount: "Don't have an account?",
        alreadyAccount: "Already have an account?",
        loginLink: "Sign In",
        rememberMe: "Remember me"
      },
      register: {
        title: "Sign Up",
        description: "Create an account to use Bridgemakers services",
        firstNameLabel: "First Name",
        firstNamePlaceholder: "Enter your first name",
        firstNameError: "Please enter your first name.",
        lastNameLabel: "Last Name",
        lastNamePlaceholder: "Enter your last name",
        lastNameError: "Please enter your last name.",
        confirmPasswordLabel: "Confirm Password",
        confirmPasswordPlaceholder: "Re-enter your password",
        confirmPasswordError: "Please confirm your password.",
        confirmPasswordMismatch: "Passwords do not match.",
        termsLabel: "I agree to the Terms and Conditions",
        termsError: "Please agree to the Terms and Conditions.",
        submitButton: "Sign Up",
        loginLink: "Already have an account? Sign In",
        success: "Registration complete. Please check your email.",
        error: "Failed to sign up."
      },
      forgot: {
        title: "Reset Password",
        description: "We'll send a password reset link to your registered email address.",
        submitButton: "Send Reset Link",
        loginLink: "Back to Sign In",
        success: "Password reset link has been sent to your email.",
        error: "Failed to send password reset link."
      },
      verification: {
        title: "Email Verification",
        successTitle: "Verification Complete",
        description: "We've sent a 6-digit verification code to:",
        instruction: "Enter the code to complete your registration.",
        verifyButton: "Verify",
        verifying: "Verifying...",
        resendButton: "Get New Code",
        resendButtonTimer: "Resend available in ({time})",
        resending: "Resending...",
        validTime: "Code valid for: {time}",
        expired: "Code has expired. Please request a new one.",
        success: {
          title: "Verification Complete! 🎉",
          description: "Your registration has been successfully completed.\nYou will be redirected shortly."
        },
        error: {
          invalidCode: "Invalid or expired verification code.",
          tooManyAttempts: "Too many attempts. Please try again later.",
          default: "Verification failed. Please try again.",
          resend: "Failed to resend code. Please try again later."
        },
        help: {
          title: "Didn't receive the code?",
          description: "Check your spam folder or try again in a few minutes."
        }
      }
    },
    logout: {
      button: "Sign out",
      authenticating: "Signing out...",
      error: "Sign out failed"
    }
  },
  contact: {
    modal: {
      title: 'Service Inquiry',
      subtitle: 'Please provide detailed information about your project',
      inquiryType: {
        label: 'Inquiry Type',
        required: '*',
        quote: 'Quote Request',
        general: 'General Inquiry'
      },
      clientType: {
        label: 'Client Type',
        required: '*',
        individual: 'Individual',
        company: 'Company'
      },
      fields: {
        name: {
          label: 'Name/Contact Person',
          placeholder: 'Enter your name',
          required: '*'
        },
        email: {
          label: 'Email',
          placeholder: 'example@email.com',
          required: '*'
        },
        phone: {
          label: 'Phone',
          placeholder: '+49-123-456-7890',
          required: '*'
        },
        companyName: {
          label: 'Company Name',
          placeholder: 'Enter your company name',
          required: '*'
        }
      },
      serviceFields: {
        label: 'Service Fields (Multiple selection allowed)',
        required: '*',
        video: 'Video Production',
        webapp: 'Web App Development',
        sns: 'SNS Content'
      },
      budget: {
        label: 'Budget Range',
        under1000: 'Under €10,000',
        range1000: '€10,000 - €50,000',
        over5000: 'Over €50,000',
        negotiable: 'Negotiable'
      },
      projectDate: {
        label: 'Project Schedule'
      },
      content: {
        label: 'Detailed Inquiry',
        placeholder: 'Please describe your project in detail (2-500 characters)',
        required: '*',
        counter: '{current}/{max}'
      },
      files: {
        label: 'Attachments (Max 5 files, 10MB each)',
        dragText: 'Drag files here or',
        selectButton: 'Select Files',
        allowedTypes: 'Only PDF, DOC, DOCX, JPG, JPEG, PNG files allowed'
      },
      privacy: {
        consent: 'I agree to the collection and use of personal information.',
        required: '*',
        description: 'Collected personal information will only be used for inquiry processing and service guidance.'
      },
      submit: {
        button: 'Submit Inquiry',
        submitting: 'Submitting...'
      },
      validation: {
        inquiryTypeRequired: 'Please select an inquiry type.',
        clientTypeRequired: 'Please select a client type.',
        nameLength: 'Name should be 2-20 characters long.',
        emailValid: 'Please enter a valid email format.',
        phoneValid: 'Please enter a valid phone number. (10-15 digits)',
        companyNameLength: 'Company name should be at least 2 characters.',
        fieldsRequired: 'Please select at least one service field.',
        contentLength: 'Inquiry content should be 2-500 characters long.',
        privacyRequired: 'Please agree to the privacy policy.'
      },
      messages: {
        success: 'Your inquiry has been successfully submitted. We sent a confirmation email and will contact you soon.',
        successWithoutEmail: 'Your inquiry has been successfully submitted. We will contact you soon. (Email sending failed but inquiry was properly received.)',
        error: 'An error occurred while submitting your inquiry.\n\nPlease try again.'
      }
    }
  },
  home: {
    hero: {
      title: {
        line1: "Time to Realize Your Vision",
        line2: "Now, Create the Digital Content You Need"
      },
      description: "From video production to websites and marketing. We provide digital solutions for your brand.",
      motto: "Made in Europe, with Korean creativity.",
      cta: "Get Started"
    },
    video: {
      title: "See How We Can Help Your Brand",
      play: "Play Video"
    },
    features: {
      creative: {
        title: "Creative Experts",
        description: "Our specialized team directly plans and produces web design and video content"
      },
      strategy: {
        title: "Customized Strategy",
        description: "No worries even if digital content is new to your business! We provide step-by-step plans and timetables"
      },
      localized: {
        title: "Localized Content",
        description: "We create content that perfectly fits the European market by reflecting local language and culture"
      }
    },
    projects: {
      title: "Projects",
      description: "Explore our diverse content creation projects and client success stories",
      viewAll: "View All Projects"
    },
    instagram: {
      title: "Instagram",
      description: "Check out Bridge Makers' latest updates and works on Instagram",
      follow: "Follow @bridgemakers_gmbh"
    }
  }
};

export default messages; 
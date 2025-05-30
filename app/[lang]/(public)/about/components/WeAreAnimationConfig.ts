/**
 * WeAreSection 애니메이션 설정 파일
 * 이 파일을 수정하여 애니메이션의 모든 측면을 조정할 수 있습니다
 */

export interface AnimationConfig {
  timing: TimingConfig;
  visual: VisualConfig;
  easing: EasingConfig;
  performance: PerformanceConfig;
}

export interface TimingConfig {
  // 각 단계별 지속시간 (초) - 원래 기획에 맞게 6단계
  stages: {
    ideaDisplay: number;         // 1단계: HTML IDEA 텍스트 표시
    textToParticle: number;      // 2단계: HTML 텍스트 → 파티클 변환
    particleScatterZoom: number; // 3단계: 파티클 산란 + 카메라 줌
    particleFocus: number;       // 4단계: 파티클 집중
    bridgeFormationMove: number; // 5단계: 브릿지 형성 및 이동
    creativeDisplay: number;     // 6단계: HTML CREATIVE 텍스트 표시
  };
  // 전체 속도 배율
  globalSpeed: {
    desktop: number;
    mobile: number;
  };
  // 딜레이 설정
  delays: {
    skipButtonShow: number;      // Skip 버튼 표시 딜레이
    letterDelay: number;         // 글자별 표시 딜레이
    particleDelay: number;       // 파티클별 애니메이션 딜레이
    bridgeMove: number;          // 브릿지 이동 시작 딜레이
    creativeShow: number;        // CREATIVE 텍스트 표시 딜레이
  };
}

export interface VisualConfig {
  particles: {
    count: {
      desktop: number;
      mobile: number;
    };
    size: {
      min: number;
      max: number;
      variation: number;         // 크기 변화량
    };
    color: {
      primary: { r: number; g: number; b: number };
      secondary: { r: number; g: number; b: number };
      gradient: boolean;         // 그라데이션 사용 여부
    };
    glow: {
      intensity: number;         // 글로우 강도 (0-1)
      speed: number;            // 글로우 애니메이션 속도
      enabled: boolean;
    };
    movement: {
      amplitude: number;        // 움직임 크기
      frequency: number;        // 움직임 빈도
      enabled: boolean;
    };
  };
  text: {
    idea: {
      scale: number;           // HTML IDEA 텍스트 크기
      letterSpacing: number;   // 글자 간격
      particlesPerLetter: number; // 글자당 파티클 수
    };
    creative: {
      scale: number;           // HTML CREATIVE 텍스트 크기
      letterSpacing: number;   // 글자 간격
      particlesPerLetter: number; // 글자당 파티클 수
    };
  };
  bridge: {
    width: number;             // 브릿지 너비
    height: number;            // 브릿지 높이
    archCount: number;         // 아치 개수
    curvature: number;         // 곡률 (0-1)
    detail: number;            // 디테일 레벨 (0-1)
    moveDistance: number;      // 브릿지 이동 거리
  };
  camera: {
    zoomInDistance: number;    // 줌인 거리 (기본: 5)
    zoomSpeed: number;         // 줌 속도
  };
  effects: {
    scatterRange: number;      // 산란 범위
    focusIntensity: number;    // 집중 강도
    focusRange: number;        // 집중 범위
    trailLength: number;       // 잔상 길이
    blurAmount: number;        // 블러 강도
  };
}

export interface EasingConfig {
  // GSAP 이징 함수들
  htmlTextShow: string;        // HTML 텍스트 표시 이징
  htmlTextHide: string;        // HTML 텍스트 숨김 이징
  particleFormation: string;   // 파티클 형성 이징
  particleScatter: string;     // 파티클 산란 이징
  cameraZoom: string;          // 카메라 줌 이징
  particleFocus: string;       // 파티클 집중 이징
  bridgeBuilding: string;      // 브릿지 구축 이징
  bridgeMovement: string;      // 브릿지 움직임 이징
  creativeFormation: string;   // CREATIVE 형성 이징
  transition: string;          // 전환 이징
}

export interface PerformanceConfig {
  autoDetect: boolean;         // 자동 성능 감지
  forceMode: 'desktop' | 'mobile' | null; // 강제 모드
  frameRate: {
    target: number;            // 목표 FPS
    adaptive: boolean;         // 적응형 FPS
  };
  quality: {
    particleCount: number;     // 파티클 수 배율 (0-1)
    shaderComplexity: number;  // 쉐이더 복잡도 (0-1)
    antialiasing: boolean;     // 안티앨리어싱
  };
}

// 기본 설정
export const defaultAnimationConfig: AnimationConfig = {
  timing: {
    stages: {
      ideaDisplay: 3.0,           // HTML IDEA 텍스트 표시 (충분한 시간으로)
      textToParticle: 2.5,        // HTML 텍스트 → 파티클 변환
      particleScatterZoom: 3.0,
      particleFocus: 2.0,
      bridgeFormationMove: 4.0,
      creativeDisplay: 2.5
    },
    globalSpeed: {
      desktop: 1.0,
      mobile: 0.7
    },
    delays: {
      skipButtonShow: 2.0,
      letterDelay: 0.1,
      particleDelay: 0.005,       // 파티클 딜레이 더 짧게 (매우 부드러운 전환)
      bridgeMove: 1.5,
      creativeShow: 1.0
    }
  },
  visual: {
    particles: {
      count: {
        desktop: 2000,             // 픽셀 파티클을 위해 증가
        mobile: 1200
      },
      size: {
        min: 1.5,                  // 파티클 크기 증가 (더 선명하게)
        max: 3.5,
        variation: 0.5
      },
      color: {
        primary: { r: 1.0, g: 0.0, b: 0.0 },
        secondary: { r: 1.0, g: 0.3, b: 0.0 },
        gradient: true
      },
      glow: {
        intensity: 0.9,            // 글로우 강도 더 증가
        speed: 2.0,
        enabled: true
      },
      movement: {
        amplitude: 0.005,          // 움직임 줄여서 더 안정적으로
        frequency: 0.5,
        enabled: true
      }
    },
    text: {
      idea: {
        scale: 1.0,                // 스케일을 1.0으로 정확히 맞춤
        letterSpacing: 1.0,        // 글자 간격도 1.0으로
        particlesPerLetter: 60     // 글자당 파티클 수 증가
      },
      creative: {
        scale: 1.2,
        letterSpacing: 0.8,
        particlesPerLetter: 30
      }
    },
    bridge: {
      width: 8,
      height: 2,
      archCount: 3,
      curvature: 0.8,
      detail: 0.7,
      moveDistance: 3
    },
    camera: {
      zoomInDistance: 2,
      zoomSpeed: 1.0
    },
    effects: {
      scatterRange: 15,
      focusIntensity: 0.8,
      focusRange: 2,
      trailLength: 0.3,
      blurAmount: 0.1
    }
  },
  easing: {
    htmlTextShow: "back.out(1.4)",      
    htmlTextHide: "power2.inOut",       
    particleFormation: "power1.out",    // 더 부드러운 파티클 형성
    particleScatter: "power1.inOut",
    cameraZoom: "power2.inOut",
    particleFocus: "power2.inOut", 
    bridgeBuilding: "power2.inOut",
    bridgeMovement: "elastic.out(1, 0.3)",
    creativeFormation: "back.out(1.7)",
    transition: "power1.inOut"
  },
  performance: {
    autoDetect: true,
    forceMode: null,
    frameRate: {
      target: 60,
      adaptive: true
    },
    quality: {
      particleCount: 1.0,
      shaderComplexity: 1.0,
      antialiasing: true
    }
  }
};

// 프리셋 설정들
export const animationPresets = {
  // 빠르고 간단한 버전
  fast: {
    ...defaultAnimationConfig,
    timing: {
      ...defaultAnimationConfig.timing,
      stages: {
        ideaDisplay: 1.0,
        textToParticle: 1.0,
        particleScatterZoom: 1.5,
        particleFocus: 1.0,
        bridgeFormationMove: 2.0,
        creativeDisplay: 1.5
      },
      globalSpeed: {
        desktop: 1.5,
        mobile: 1.2
      }
    }
  },
  
  // 천천히 자세한 버전
  detailed: {
    ...defaultAnimationConfig,
    timing: {
      ...defaultAnimationConfig.timing,
      stages: {
        ideaDisplay: 3.0,
        textToParticle: 3.0,
        particleScatterZoom: 4.0,
        particleFocus: 3.0,
        bridgeFormationMove: 5.0,
        creativeDisplay: 3.5
      },
      globalSpeed: {
        desktop: 0.8,
        mobile: 0.6
      }
    },
    visual: {
      ...defaultAnimationConfig.visual,
      particles: {
        ...defaultAnimationConfig.visual.particles,
        count: {
          desktop: 2000,
          mobile: 1000
        }
      }
    }
  },
  
  // 성능 우선 버전
  performance: {
    ...defaultAnimationConfig,
    visual: {
      ...defaultAnimationConfig.visual,
      particles: {
        ...defaultAnimationConfig.visual.particles,
        count: {
          desktop: 800,
          mobile: 400
        }
      }
    },
    performance: {
      ...defaultAnimationConfig.performance,
      quality: {
        particleCount: 0.6,
        shaderComplexity: 0.8,
        antialiasing: false
      }
    }
  }
};

// 설정 업데이트 헬퍼 함수
export function updateAnimationConfig(
  baseConfig: AnimationConfig, 
  updates: Partial<AnimationConfig>
): AnimationConfig {
  return {
    timing: { ...baseConfig.timing, ...updates.timing },
    visual: { ...baseConfig.visual, ...updates.visual },
    easing: { ...baseConfig.easing, ...updates.easing },
    performance: { ...baseConfig.performance, ...updates.performance }
  };
} 
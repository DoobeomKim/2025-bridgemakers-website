/**
 * WeAreSection 애니메이션을 위한 유틸리티 함수들
 * IDEA → CREATIVE 파티클 애니메이션 시스템
 */

/**
 * 성능 감지 함수
 * 모바일/저성능 기기를 감지하여 파티클 수와 애니메이션 품질을 조정
 */
export function detectPerformance(): boolean {
  if (typeof window === 'undefined') return false;
  
  // GPU 정보 확인
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl') as WebGLRenderingContext | null;
  
  if (!gl) return true; // WebGL 미지원시 모바일로 간주
  
  const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
  let renderer = '';
  
  if (debugInfo) {
    renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL).toLowerCase();
  }
  
  // 모바일 GPU 감지
  const mobileGPUs = [
    'adreno', 'mali', 'powervr', 'apple gpu', 'intel iris',
    'intel uhd', 'intel hd', 'tegra'
  ];
  
  const isMobileGPU = mobileGPUs.some(gpu => renderer.includes(gpu));
  
  // 화면 크기 및 디바이스 감지
  const isMobileScreen = window.innerWidth <= 768 || window.innerHeight <= 600;
  const isTouchDevice = 'ontouchstart' in window;
  
  // 메모리 및 하드웨어 동시성 체크
  const hardwareConcurrency = navigator.hardwareConcurrency || 2;
  const deviceMemory = (navigator as any).deviceMemory || 4;
  
  const isLowPerformance = hardwareConcurrency <= 4 || deviceMemory <= 4;
  
  return isMobileGPU || isMobileScreen || isTouchDevice || isLowPerformance;
}

/**
 * "IDEA" 텍스트를 파티클 위치로 변환
 * HTML 텍스트와 정확히 매칭되는 파티클 배치
 */
export function generateIdeaTextParticles(): Float32Array {
  console.log('🔤 IDEA 텍스트 파티클 생성 시작');
  
  const positions: number[] = [];
  const letterSpacing = 1.6; // HTML 텍스트와 매칭되도록 조정
  const scale = 1.8; // 스케일 조정
  
  // 각 글자의 기본 위치 정의 (HTML과 매칭)
  const letterBasePositions = [
    { letter: 'I', x: -2.4 },
    { letter: 'D', x: -0.8 },
    { letter: 'E', x: 0.8 },
    { letter: 'A', x: 2.4 }
  ];

  letterBasePositions.forEach(({ letter, x }, letterIndex) => {
    const baseX = x * letterSpacing * scale;
    const letterPositions = getLetterPattern(letter);
    
    console.log(`📝 글자 ${letter}: ${letterPositions.length / 2}개 포인트`);
    
    letterPositions.forEach((pos, i) => {
      if (i % 2 === 0) {
        // x 좌표
        positions.push(baseX + pos * scale);
      } else {
        // y 좌표 - 기본 위치에서 약간 위로
        positions.push(pos * scale * 0.8); // 높이 조정
        // z 좌표 - 앞쪽에 위치
        positions.push(0.2);
      }
    });
  });

  console.log(`✅ IDEA 파티클 총 ${positions.length / 3}개 생성됨`);
  return new Float32Array(positions);
}

// 글자별 패턴 정의 (더 조밀하고 정확하게)
function getLetterPattern(letter: string): number[] {
  const patterns: { [key: string]: number[] } = {
    'I': [
      // 세로 막대 (중앙)
      0, 0.9,   0, 0.7,   0, 0.5,   0, 0.3,   0, 0.1,
      0, -0.1,  0, -0.3,  0, -0.5,  0, -0.7,  0, -0.9,
      // 위 가로 막대
      -0.4, 0.9,  -0.2, 0.9,  0.2, 0.9,   0.4, 0.9,
      // 아래 가로 막대
      -0.4, -0.9, -0.2, -0.9, 0.2, -0.9,  0.4, -0.9,
      // 추가 포인트로 더 조밀하게
      -0.1, 0.9,  0.1, 0.9,
      -0.1, -0.9, 0.1, -0.9,
      0, 0.4,     0, 0.2,     0, 0,       0, -0.2,    0, -0.4,    0, -0.6,    0, -0.8
    ],
    'D': [
      // 왼쪽 세로 막대
      -0.4, 0.9,  -0.4, 0.7,  -0.4, 0.5,  -0.4, 0.3,  -0.4, 0.1,
      -0.4, -0.1, -0.4, -0.3, -0.4, -0.5, -0.4, -0.7, -0.4, -0.9,
      // 위쪽 곡선
      -0.2, 0.9,  0, 0.8,     0.2, 0.6,   0.3, 0.4,   0.35, 0.2,  0.35, 0,
      // 아래쪽 곡선
      0.35, -0.2, 0.3, -0.4,  0.2, -0.6,  0, -0.8,    -0.2, -0.9,
      // 연결부와 내부 포인트
      -0.2, 0.5,  -0.1, 0.7,  0.1, 0.5,   0.2, 0.3,   0.2, 0.1,
      0.2, -0.1,  0.2, -0.3,  0.1, -0.5,  -0.1, -0.7, -0.2, -0.5
    ],
    'E': [
      // 왼쪽 세로 막대
      -0.4, 0.9,  -0.4, 0.7,  -0.4, 0.5,  -0.4, 0.3,  -0.4, 0.1,
      -0.4, -0.1, -0.4, -0.3, -0.4, -0.5, -0.4, -0.7, -0.4, -0.9,
      // 위 가로 막대
      -0.4, 0.9,  -0.2, 0.9,  0, 0.9,     0.2, 0.9,   0.4, 0.9,
      // 중간 가로 막대
      -0.4, 0,    -0.2, 0,    0, 0,       0.2, 0,
      // 아래 가로 막대
      -0.4, -0.9, -0.2, -0.9, 0, -0.9,    0.2, -0.9,  0.4, -0.9,
      // 추가 포인트
      -0.3, 0.9,  -0.1, 0.9,  0.1, 0.9,   0.3, 0.9,
      -0.3, 0,    -0.1, 0,    0.1, 0,
      -0.3, -0.9, -0.1, -0.9, 0.1, -0.9,  0.3, -0.9
    ],
    'A': [
      // 왼쪽 대각선 (더 조밀하게)
      -0.4, -0.9, -0.35, -0.7, -0.3, -0.5, -0.25, -0.3, -0.2, -0.1,
      -0.15, 0.1, -0.1, 0.3,   -0.05, 0.5,  0, 0.7,     0.05, 0.9,
      // 오른쪽 대각선
      0.4, -0.9,  0.35, -0.7,  0.3, -0.5,  0.25, -0.3,  0.2, -0.1,
      0.15, 0.1,  0.1, 0.3,    0.05, 0.5,   0, 0.7,     -0.05, 0.9,
      // 가로 막대 (더 조밀하게)
      -0.2, -0.1, -0.15, -0.1, -0.1, -0.1, -0.05, -0.1, 0, -0.1,
      0.05, -0.1, 0.1, -0.1,   0.15, -0.1,  0.2, -0.1,
      // 꼭지점 영역
      -0.02, 0.8, 0, 0.85,     0.02, 0.8,
      // 추가 내부 포인트
      -0.1, 0.2,  0.1, 0.2,    -0.15, 0,    0.15, 0
    ]
  };

  return patterns[letter] || [];
}

/**
 * 브릿지 모양의 파티클 위치 생성
 * 아치형 다리 구조를 파티클로 표현
 */
export function generateBridgeParticles(particleCount: number): Float32Array {
  console.log('🌉 브릿지 파티클 생성 시작');
  
  const positions: number[] = [];
  const bridgeLength = 8;
  const bridgeHeight = 2;
  const archCount = 3;
  
  for (let i = 0; i < particleCount; i++) {
    const progress = i / particleCount;
    
    // 브릿지의 기본 형태
    const x = (progress - 0.5) * bridgeLength;
    
    // 다중 아치 생성
    let y = 0;
    for (let arch = 0; arch < archCount; arch++) {
      const archProgress = (progress * archCount) % 1;
      const archHeight = Math.sin(archProgress * Math.PI) * bridgeHeight * (1 - arch * 0.2);
      y = Math.max(y, archHeight);
    }
    
    y -= 2; // 브릿지를 아래쪽에 위치
    
    const z = (Math.random() - 0.5) * 2;
    
    positions.push(x, y, z);
  }
  
  console.log(`✅ 브릿지 파티클 ${particleCount}개 생성됨`);
  return new Float32Array(positions);
}

/**
 * "CREATIVE" 텍스트를 파티클 위치로 변환
 */
export function generateCreativeTextParticles(): Float32Array {
  console.log('🔤 CREATIVE 텍스트 파티클 생성 시작');
  
  const positions: number[] = [];
  const letterSpacing = 0.8;
  const scale = 1.2;
  
  // CREATIVE 글자들의 기본 위치
  const letters = ['C', 'R', 'E', 'A', 'T', 'I', 'V', 'E'];
  const totalWidth = (letters.length - 1) * letterSpacing;
  
  letters.forEach((letter, index) => {
    const baseX = (index * letterSpacing - totalWidth / 2) * scale;
    const letterPositions = getCreativeLetterPattern(letter);
    
    letterPositions.forEach((pos, i) => {
      if (i % 2 === 0) {
        positions.push(baseX + pos * scale);
      } else {
        positions.push((pos - 2) * scale); // CREATIVE는 아래쪽에 위치
        positions.push(0.5);
      }
    });
  });

  console.log(`✅ CREATIVE 파티클 총 ${positions.length / 3}개 생성됨`);
  return new Float32Array(positions);
}

// CREATIVE 글자 패턴 (간단하게)
function getCreativeLetterPattern(letter: string): number[] {
  const patterns: { [key: string]: number[] } = {
    'C': [
      0.2, 0.8,   0, 0.7,    -0.2, 0.5,  -0.2, 0,   -0.2, -0.5,
      0, -0.7,    0.2, -0.8
    ],
    'R': [
      -0.2, 0.8,  -0.2, 0.4,  -0.2, 0,   -0.2, -0.4, -0.2, -0.8,
      -0.2, 0.8,  0, 0.8,     0.2, 0.6,  0, 0.4,     -0.2, 0.4,
      0, 0.4,     0.2, -0.8
    ],
    'E': [
      -0.2, 0.8,  -0.2, 0.4,  -0.2, 0,   -0.2, -0.4, -0.2, -0.8,
      -0.2, 0.8,  0.2, 0.8,   -0.2, 0.4,  0.1, 0.4,
      -0.2, -0.8, 0.2, -0.8
    ],
    'A': [
      -0.2, -0.8, 0, 0.8,     0.2, -0.8,
      -0.1, 0,    0.1, 0
    ],
    'T': [
      -0.2, 0.8,  0, 0.8,     0.2, 0.8,
      0, 0.8,     0, 0.4,     0, 0,       0, -0.4,    0, -0.8
    ],
    'I': [
      0, 0.8,     0, 0.4,     0, 0,       0, -0.4,    0, -0.8
    ],
    'V': [
      -0.2, 0.8,  0, -0.8,    0.2, 0.8
    ]
  };

  return patterns[letter] || patterns['E']; // 기본값으로 E 사용
}

/**
 * 파티클용 버텍스 쉐이더
 */
export const vertexShader = `
  attribute vec3 color;
  attribute float size;
  attribute float opacity;
  varying vec3 vColor;
  varying float vOpacity;
  uniform float time;
  uniform float pixelRatio;

  void main() {
    vColor = color;
    vOpacity = opacity;
    
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    gl_PointSize = size * pixelRatio;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

/**
 * 파티클용 프래그먼트 쉐이더
 */
export const fragmentShader = `
  varying vec3 vColor;
  varying float vOpacity;
  uniform float time;

  void main() {
    // 원형 파티클 생성
    float dist = distance(gl_PointCoord, vec2(0.5));
    if (dist > 0.5) discard;
    
    // 글로우 효과
    float glow = 1.0 - (dist * 2.0);
    glow = pow(glow, 2.0);
    
    // 시간에 따른 펄스 효과
    float pulse = sin(time * 3.0) * 0.3 + 0.7;
    
    gl_FragColor = vec4(vColor * glow * pulse, vOpacity * glow);
  }
`; 
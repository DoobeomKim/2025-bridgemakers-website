// DeepL Free API를 위한 번역 유틸리티
export interface TranslationRequest {
  text: string;
  targetLang: 'EN' | 'KO';
  sourceLang?: 'EN' | 'KO';
}

export interface TranslationResponse {
  translations: Array<{
    detected_source_language: string;
    text: string;
  }>;
}

export class DeepLTranslator {
  private apiKey: string;
  private baseUrl: string;
  private freeApiUrl = 'https://api-free.deepl.com/v2/translate';

  constructor() {
    this.apiKey = process.env.DEEPL_API_KEY || '';
    this.baseUrl = this.freeApiUrl;
    
    if (!this.apiKey) {
      console.warn('⚠️ DeepL API 키가 설정되지 않았습니다. 번역 기능이 비활성화됩니다.');
    }
  }

  /**
   * 텍스트를 번역합니다
   */
  async translateText(text: string, targetLang: 'EN' | 'KO', sourceLang?: 'EN' | 'KO'): Promise<string> {
    if (!this.apiKey) {
      console.warn('DeepL API 키가 없어 번역을 건너뜁니다.');
      return text;
    }

    if (!text || text.trim().length === 0) {
      return text;
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          text: text,
          target_lang: targetLang,
          ...(sourceLang && { source_lang: sourceLang }),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`DeepL API 오류: ${response.status} - ${errorText}`);
      }

      const data: TranslationResponse = await response.json();
      return data.translations[0]?.text || text;
    } catch (error) {
      console.error('번역 오류:', error);
      return text; // 오류 시 원본 텍스트 반환
    }
  }

  /**
   * 프로젝트 데이터의 모든 텍스트 필드를 번역합니다
   */
  async translateProjectData(projectData: any, targetLang: 'EN' | 'KO'): Promise<any> {
    const fieldsToTranslate = [
      'title',
      'description', 
      'content',
      'category',
      'client',
      'country',
      'industry'
    ];

    const translatedData = { ...projectData };

    for (const field of fieldsToTranslate) {
      if (projectData[field] && typeof projectData[field] === 'string') {
        try {
          const translated = await this.translateText(projectData[field], targetLang);
          translatedData[`${field}_en`] = translated;
        } catch (error) {
          console.error(`${field} 번역 실패:`, error);
          translatedData[`${field}_en`] = projectData[field]; // 실패 시 원본 사용
        }
      }
    }

    return translatedData;
  }

  /**
   * API 사용량을 확인합니다 (Free API는 제한이 있음)
   */
  async getUsage(): Promise<{ character_count: number; character_limit: number }> {
    if (!this.apiKey) {
      return { character_count: 0, character_limit: 500000 };
    }

    try {
      const response = await fetch('https://api-free.deepl.com/v2/usage', {
        headers: {
          'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('사용량 확인 오류:', error);
    }

    return { character_count: 0, character_limit: 500000 };
  }
}

// 싱글톤 인스턴스
export const deeplTranslator = new DeepLTranslator();

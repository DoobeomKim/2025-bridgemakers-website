import { NextRequest, NextResponse } from 'next/server';
import { deeplTranslator } from '@/lib/translation/deepl';

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang, sourceLang } = await request.json();

    if (!text || !targetLang) {
      return NextResponse.json(
        { error: '텍스트와 대상 언어가 필요합니다.' },
        { status: 400 }
      );
    }

    // 사용량 확인
    const usage = await deeplTranslator.getUsage();
    if (usage.character_count >= usage.character_limit) {
      return NextResponse.json(
        { error: 'DeepL API 사용량 한도에 도달했습니다.' },
        { status: 429 }
      );
    }

    const translatedText = await deeplTranslator.translateText(
      text,
      targetLang as 'EN' | 'KO',
      sourceLang as 'EN' | 'KO'
    );

    return NextResponse.json({
      original: text,
      translated: translatedText,
      targetLang,
      usage: {
        charactersUsed: usage.character_count,
        characterLimit: usage.character_limit,
        remaining: usage.character_limit - usage.character_count
      }
    });

  } catch (error: any) {
    console.error('번역 API 오류:', error);
    return NextResponse.json(
      { error: error.message || '번역 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const usage = await deeplTranslator.getUsage();
    return NextResponse.json({
      usage: {
        charactersUsed: usage.character_count,
        characterLimit: usage.character_limit,
        remaining: usage.character_limit - usage.character_count
      }
    });
  } catch (error: any) {
    console.error('사용량 확인 오류:', error);
    return NextResponse.json(
      { error: '사용량 확인 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

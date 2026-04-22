import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured.' }, { status: 503 });
  }

  const body = await request.json();
  const { description, title, client, country, category, industry, lang } = body;

  if (!description?.trim()) {
    return NextResponse.json({ error: 'description is required' }, { status: 400 });
  }

  const context = [
    title && `Project title: ${title}`,
    client && `Client: ${client}`,
    country && `Country: ${country}`,
    category && `Category: ${category}`,
    industry && `Industry: ${industry}`,
  ].filter(Boolean).join('\n');

  const isKorean = lang === 'ko';

  const prompt = isKorean
    ? `당신은 크리에이티브 에이전시 Bridgemakers의 포트폴리오 소개 문구 작성을 돕는 전문가입니다.

${context ? `프로젝트 맥락:\n${context}\n` : ''}
아래는 담당자가 적어둔 요약 설명 초안입니다:
"${description}"

이 내용을 포트폴리오 웹사이트에 어울리는 간결하고 전문적인 소개 문구 2~3문장으로 다듬어 주세요.
- 과도한 수식어나 과장 표현은 피하고 핵심을 명확하게
- 완성된 문구만 반환하고 설명이나 부연은 하지 말 것
- 반드시 한국어로 작성할 것`
    : `You are an expert copywriter helping Bridgemakers, a creative agency, write portfolio project descriptions.

${context ? `Project context:\n${context}\n` : ''}
Here are the rough notes for the project description:
"${description}"

Rewrite this as a polished, professional 2-3 sentence project introduction suitable for a portfolio website.
- Be concise and clear, avoid excessive adjectives
- Return only the polished description, no explanations
- Write in English`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: err.error?.message || 'Anthropic API error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const polished = data.content?.[0]?.text?.trim() ?? '';
    return NextResponse.json({ polished });
  } catch (err: any) {
    console.error('[ai-polish] error:', err);
    return NextResponse.json({ error: err.message || 'Unknown error' }, { status: 500 });
  }
}

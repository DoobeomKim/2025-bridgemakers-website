'use client'

import { Locale, getTranslations } from '@/lib/i18n'

interface DocumentTemplateProps {
  lang: string
  documentType: 'privacy' | 'terms' | 'cookiePolicy'
}

export default function DocumentTemplate({ lang, documentType }: DocumentTemplateProps) {
  const locale = lang as Locale
  const t = getTranslations(locale, 'legal')
  const document = t[documentType]

  if (!document) {
    return <div>Document not found</div>
  }

  const formatDate = (locale: Locale) => {
    const date = new Date()
    return locale === 'ko' 
      ? `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const renderSection = (section: any, key: string) => {
    if (!section) return null

    return (
      <section key={key} className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">
          {section.title}
        </h2>
        
        {section.content && (
          <p className="mb-4 text-muted-foreground leading-relaxed">
            {section.content}
          </p>
        )}

        {/* 목적 리스트 렌더링 (개인정보처리방침 1조) */}
        {section.purposes && (
          <ul className="list-disc list-inside mb-4 space-y-2 text-muted-foreground">
            {section.purposes.map((purpose: string, index: number) => (
              <li key={index}>{purpose}</li>
            ))}
          </ul>
        )}

        {/* 카테고리별 개인정보 항목 렌더링 (개인정보처리방침 2조) */}
        {section.categories && (
          <div className="space-y-6">
            {Object.entries(section.categories).map(([categoryKey, category]: [string, any]) => (
              <div key={categoryKey}>
                <h3 className="text-lg font-medium mb-2 text-foreground">{category.title}</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {category.items.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* 수집 방법 렌더링 */}
        {section.methods && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2 text-foreground">{section.methods.title}</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {section.methods.items.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 보유기간 렌더링 (개인정보처리방침 3조) */}
        {section.periods && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2 text-foreground">{section.periods.service.title}</h3>
              <p className="text-muted-foreground">{section.periods.service.period}</p>
              {section.periods.service.note && (
                <p className="text-sm text-muted-foreground mt-1">{section.periods.service.note}</p>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2 text-foreground">{section.periods.legal.title}</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {section.periods.legal.items.map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 일반적인 항목 리스트 렌더링 */}
        {section.items && (
          <ul className="list-disc list-inside mb-4 space-y-2 text-muted-foreground">
            {section.items.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}

        {/* 서비스 변경 관련 렌더링 (이용약관 4조) */}
        {section.changes && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-foreground">{section.changes.title}</h3>
            <p className="text-muted-foreground mb-3">{section.changes.content}</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {section.changes.items.map((item: string, index: number) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {section.exercise && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h3 className="text-lg font-medium mb-2 text-foreground">{section.exercise.title}</h3>
            <p className="text-muted-foreground mb-3">{section.exercise.content}</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {section.exercise.methods.map((method: string, index: number) => (
                <li key={index}>{method}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 제3자 제공 렌더링 (개인정보처리방침 5조) */}
        {section.exceptions && (
          <div className="mb-4">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              {section.exceptions.map((exception: string, index: number) => (
                <li key={index}>{exception}</li>
              ))}
            </ul>
          </div>
        )}

        {section.partners && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4 text-foreground">{section.partners.title}</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr className="bg-muted">
                    <th className="border border-border p-3 text-left text-foreground">수탁업체</th>
                    <th className="border border-border p-3 text-left text-foreground">처리목적</th>
                    <th className="border border-border p-3 text-left text-foreground">처리항목</th>
                    <th className="border border-border p-3 text-left text-foreground">보유기간</th>
                  </tr>
                </thead>
                <tbody>
                  {section.partners.items.map((partner: any, index: number) => (
                    <tr key={index}>
                      <td className="border border-border p-3 text-muted-foreground">{partner.recipient}</td>
                      <td className="border border-border p-3 text-muted-foreground">{partner.purpose}</td>
                      <td className="border border-border p-3 text-muted-foreground">{partner.items}</td>
                      <td className="border border-border p-3 text-muted-foreground">{partner.retention}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 위탁업체 렌더링 (개인정보처리방침 6조) */}
        {section.outsourcing && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-left text-foreground">수탁업체</th>
                  <th className="border border-border p-3 text-left text-foreground">위탁업무</th>
                  <th className="border border-border p-3 text-left text-foreground">위탁기간</th>
                </tr>
              </thead>
              <tbody>
                {section.outsourcing.map((company: any, index: number) => (
                  <tr key={index}>
                    <td className="border border-border p-3 text-muted-foreground">{company.company}</td>
                    <td className="border border-border p-3 text-muted-foreground">{company.tasks}</td>
                    <td className="border border-border p-3 text-muted-foreground">{company.period}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 보안조치 렌더링 (개인정보처리방침 7조) */}
        {section.measures && (
          <div className="space-y-6">
            {Object.entries(section.measures).map(([measureKey, measure]: [string, any]) => (
              <div key={measureKey}>
                <h3 className="text-lg font-medium mb-2 text-foreground">{measure.title}</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {measure.items.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* 쿠키 관련 렌더링 (개인정보처리방침 8조) */}
        {section.definition && (
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground">{section.definition}</p>
          </div>
        )}

        {section.purpose && Array.isArray(section.purpose) && (
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2 text-foreground">쿠키 사용 목적</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {section.purpose.map((purpose: string, index: number) => (
                <li key={index}>{purpose}</li>
              ))}
            </ul>
          </div>
        )}

        {section.rejection && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2 text-foreground">{section.rejection.title}</h3>
            <p className="text-muted-foreground mb-3">{section.rejection.content}</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {section.rejection.methods.map((method: string, index: number) => (
                <li key={index}>{method}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 미성년자 관련 렌더링 (개인정보처리방침 9조) */}
        {section.procedures && (
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            {section.procedures.map((procedure: string, index: number) => (
              <li key={index}>{procedure}</li>
            ))}
          </ul>
        )}

        {/* 연락처 정보 렌더링 (개인정보처리방침 10조) */}
        {section.officer && (
          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-foreground">{section.officer.title}</h3>
              <div className="space-y-1 text-muted-foreground">
                <p><strong>성명:</strong> {section.officer.name}</p>
                <p><strong>직책:</strong> {section.officer.position}</p>
                <p><strong>이메일:</strong> {section.officer.email}</p>
                <p><strong>전화:</strong> {section.officer.phone}</p>
              </div>
            </div>
            
            {section.department && (
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="text-lg font-medium mb-2 text-foreground">{section.department.title}</h3>
                <div className="space-y-1 text-muted-foreground">
                  <p><strong>부서명:</strong> {section.department.name}</p>
                  <p><strong>이메일:</strong> {section.department.email}</p>
                  <p><strong>전화:</strong> {section.department.phone}</p>
                </div>
              </div>
            )}

            {section.complaint && (
              <div>
                <h3 className="text-lg font-medium mb-2 text-foreground">{section.complaint.title}</h3>
                <p className="text-muted-foreground mb-3">{section.complaint.content}</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {section.complaint.agencies.map((agency: string, index: number) => (
                    <li key={index}>{agency}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* 변경사항 알림 렌더링 (개인정보처리방침 11조) */}
        {section.notification && (
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            {section.notification.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}

        {/* 국외이전 렌더링 (개인정보처리방침 12조) */}
        {section.transfers && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-border">
              <thead>
                <tr className="bg-muted">
                  <th className="border border-border p-3 text-left text-foreground">이전국가</th>
                  <th className="border border-border p-3 text-left text-foreground">수령인</th>
                  <th className="border border-border p-3 text-left text-foreground">이전목적</th>
                  <th className="border border-border p-3 text-left text-foreground">이전항목</th>
                  <th className="border border-border p-3 text-left text-foreground">보호조치</th>
                </tr>
              </thead>
              <tbody>
                {section.transfers.map((transfer: any, index: number) => (
                  <tr key={index}>
                    <td className="border border-border p-3 text-muted-foreground">{transfer.country}</td>
                    <td className="border border-border p-3 text-muted-foreground">{transfer.recipient}</td>
                    <td className="border border-border p-3 text-muted-foreground">{transfer.purpose}</td>
                    <td className="border border-border p-3 text-muted-foreground">{transfer.items}</td>
                    <td className="border border-border p-3 text-muted-foreground">{transfer.safeguards}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 쿠키 정책 특별 섹션들 */}
        {section.details && (
          <div className="space-y-4">
            {section.details.firstParty && (
              <p className="text-muted-foreground"><strong>퍼스트 파티 쿠키:</strong> {section.details.firstParty}</p>
            )}
            {section.details.thirdParty && (
              <p className="text-muted-foreground"><strong>서드 파티 쿠키:</strong> {section.details.thirdParty}</p>
            )}
          </div>
        )}

        {section.browserControl && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground">{section.browserControl}</p>
          </div>
        )}

        {section.examples && (
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            {section.examples.map((example: string, index: number) => (
              <li key={index}>{example}</li>
            ))}
          </ul>
        )}

        {section.browsers && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
            {Object.entries(section.browsers).map(([key, browser]: [string, any]) => (
              <div key={key} className="p-2 bg-muted rounded text-center text-muted-foreground">
                {browser}
              </div>
            ))}
          </div>
        )}

        {/* 연락처 정보 (쿠키 정책) */}
        {section.email && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground mb-2">{section.email}</p>
            {section.address && (
              <div className="text-muted-foreground">
                <p>{section.address.company}</p>
                <p>{section.address.street}</p>
                <p>{section.address.city}</p>
                <p>{section.address.country}</p>
              </div>
            )}
            {section.phone && (
              <p className="text-muted-foreground mt-2">{section.phone}</p>
            )}
          </div>
        )}
      </section>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* 헤더 영역 */}
      <div className="pt-20 pb-8 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {document.title}
          </h1>
          {document.description && (
            <p className="text-lg text-muted-foreground mb-4">
              {document.description}
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {document.lastUpdated}: {formatDate(locale)}
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {document.introduction && (
          <div className="mb-12 p-6 bg-muted rounded-lg">
            <p className="text-muted-foreground leading-relaxed">
              {document.introduction}
            </p>
          </div>
        )}

        <div className="space-y-12">
          {document.sections && Object.entries(document.sections).map(([key, section]) => 
            renderSection(section, key)
          )}

          {/* 쿠키 정책의 특별 섹션 */}
          {document.specificCookies && (
            <section className="mb-8">
              <h2 className="text-2xl font-semibold mb-4 text-foreground">
                {document.specificCookies.title}
              </h2>
              <p className="mb-6 text-muted-foreground">
                {document.specificCookies.description}
              </p>
              
              {Object.entries(document.specificCookies.categories).map(([categoryKey, category]: [string, any]) => (
                <div key={categoryKey} className="mb-8">
                  <h3 className="text-lg font-medium mb-4 text-foreground capitalize">
                    {categoryKey === 'essential' ? '필수 쿠키' : 
                     categoryKey === 'analytics' ? '분석 쿠키' : 
                     categoryKey === 'performance' ? '성능 쿠키' : categoryKey}
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-border">
                      <thead>
                        <tr className="bg-muted">
                          <th className="border border-border p-3 text-left text-foreground">쿠키명</th>
                          <th className="border border-border p-3 text-left text-foreground">목적</th>
                          <th className="border border-border p-3 text-left text-foreground">제공자</th>
                          <th className="border border-border p-3 text-left text-foreground">유형</th>
                          <th className="border border-border p-3 text-left text-foreground">만료</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(category).map(([cookieKey, cookie]: [string, any]) => (
                          <tr key={cookieKey}>
                            <td className="border border-border p-3 text-muted-foreground font-mono text-sm">{cookie.name}</td>
                            <td className="border border-border p-3 text-muted-foreground">{cookie.purpose}</td>
                            <td className="border border-border p-3 text-muted-foreground">{cookie.provider}</td>
                            <td className="border border-border p-3 text-muted-foreground">{cookie.type}</td>
                            <td className="border border-border p-3 text-muted-foreground">{cookie.expires}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      </main>
    </div>
  )
} 
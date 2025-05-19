import { validateLocale, getTranslations } from "@/lib/i18n";
import Image from "next/image";

export default function AboutPage({
  params: { lang },
}: {
  params: { lang: string };
}) {
  const locale = validateLocale(lang);
  const translations = getTranslations(locale, "common");

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-20 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              {translations.about} Bridge Makers
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              브릿지메이커스는 혁신적인 기술과 창의적인 솔루션으로 디지털 세계를
              연결합니다. 우리는 고객의 비전을 현실로 만들기 위해 최선을 다하고
              있습니다.
            </p>
            <div className="mt-6 space-y-6">
              <p className="text-base text-gray-500">
                2020년에 설립된 이래로, 우리는 지속적인 성장과 혁신을 추구해왔습니다. 
                최신 기술을 활용한 솔루션 개발에 집중하며, 고객들이 빠르게 변화하는 
                디지털 환경에서 경쟁력을 유지할 수 있도록 지원합니다.
              </p>
              <p className="text-base text-gray-500">
                브릿지메이커스의 핵심 가치는 혁신, 품질, 신뢰입니다. 우리는 이러한 
                가치를 바탕으로 고객, 파트너, 직원들과 함께 발전하며 더 나은 미래를 
                만들어가고 있습니다.
              </p>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-0.5 md:grid-cols-3 lg:mt-0 lg:grid-cols-2">
            <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
              <div className="relative h-12 w-auto">
                <div className="h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  B
                </div>
              </div>
            </div>
            <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
              <div className="relative h-12 w-auto">
                <div className="h-12 w-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  M
                </div>
              </div>
            </div>
            <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
              <div className="relative h-12 w-auto">
                <div className="h-12 w-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  I
                </div>
              </div>
            </div>
            <div className="col-span-1 flex justify-center py-8 px-8 bg-gray-50">
              <div className="relative h-12 w-auto">
                <div className="h-12 w-12 bg-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
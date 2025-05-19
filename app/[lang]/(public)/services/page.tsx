import { Metadata } from "next";
import { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Services | Bridge Makers",
  description: "Services offered by Bridge Makers",
};

export default function ServicesPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const t = getTranslations(lang, "common");
  
  return (
    <div className="container mx-auto pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <section className="mb-16">
        <h1 className="text-4xl font-bold text-white mb-8">{t.services}</h1>
        <div className="h-1 w-24 bg-[#cba967] mb-12"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-black border border-[rgba(255,255,255,0.1)] rounded-lg p-8 hover:border-[#cba967] transition-colors">
            <h3 className="text-2xl font-bold text-white mb-4">서비스 1</h3>
            <p className="text-[#C7C7CC]">
              서비스 1에 대한 설명이 들어갑니다. 실제 서비스 정보로 교체해주세요.
            </p>
          </div>
          
          <div className="bg-black border border-[rgba(255,255,255,0.1)] rounded-lg p-8 hover:border-[#cba967] transition-colors">
            <h3 className="text-2xl font-bold text-white mb-4">서비스 2</h3>
            <p className="text-[#C7C7CC]">
              서비스 2에 대한 설명이 들어갑니다. 실제 서비스 정보로 교체해주세요.
            </p>
          </div>
          
          <div className="bg-black border border-[rgba(255,255,255,0.1)] rounded-lg p-8 hover:border-[#cba967] transition-colors">
            <h3 className="text-2xl font-bold text-white mb-4">서비스 3</h3>
            <p className="text-[#C7C7CC]">
              서비스 3에 대한 설명이 들어갑니다. 실제 서비스 정보로 교체해주세요.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
} 
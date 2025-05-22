import Link from "next/link";
import { Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n";
import { getHeaderMenus } from "@/lib/constants/menus";

interface FooterProps {
  locale: Locale;
}

export default async function Footer({ locale }: FooterProps) {
  const t = getTranslations(locale, "common");
  const headerMenus = await getHeaderMenus(locale);
  
  return (
    <footer className="bg-black text-white border-t border-[rgba(255,255,255,0.1)]">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          <div className="space-y-8 xl:col-span-1">
            <div className="font-bold tracking-[0.5px] leading-[1.2] mb-4 font-roboto">
              <span className="text-[24px] text-white">BRIDGE</span>
              <span className="text-[24px] text-[#cba967]">M</span>
              <span className="text-[24px] text-white">AKERS</span>
            </div>
            <p className="text-[#C7C7CC] text-[16px] leading-[1.5]">              
            © {new Date().getFullYear()} Bridgemakers. All rights reserved.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
            <div>
              <h3 className="text-[14px] font-semibold text-[#cba967] tracking-[0.25px] uppercase leading-[1.4]">
                Links
              </h3>
              <ul className="mt-4 space-y-4">
                {headerMenus.map((item) => (
                  <li key={item.href}>
                  <Link
                      href={item.href}
                    className="text-[16px] text-white hover:text-[#cba967] transition-colors leading-[1.5]"
                  >
                      {item.label}
                  </Link>
                </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[14px] font-semibold text-[#cba967] tracking-[0.25px] uppercase leading-[1.4]">
                Legal
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-[16px] text-white hover:text-[#cba967] transition-colors leading-[1.5]"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-[16px] text-white hover:text-[#cba967] transition-colors leading-[1.5]"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 
import Link from 'next/link';
import { Locale } from '@/lib/i18n';

interface ContactBannerProps {
  locale: Locale;
}

export default function ContactBanner({ locale }: ContactBannerProps) {
  return (
    <section className="bg-[#cba967] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Start Your Project?
          </h2>
          <p className="mt-4 text-lg leading-6 text-white">
            Get in touch with us for a free consultation and quote.
          </p>
          <div className="mt-8">
            <Link
              href={`/${locale}/contact`}
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-[#cba967] bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 
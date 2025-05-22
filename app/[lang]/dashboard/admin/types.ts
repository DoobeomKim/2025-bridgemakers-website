import { Locale } from "@/lib/i18n";

export interface AdminDashboardClientProps {
  locale: Locale;
  translations: { [key: string]: string };
} 
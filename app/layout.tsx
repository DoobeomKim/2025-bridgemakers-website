import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { createServerClient } from '@/lib/supabase/server';
import { AuthProvider } from "@/components/auth/AuthContext";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Bridgemakers - 디지털 컨텐츠 제작 전문업체",
  description: "영상 제작, 웹 디자인, 브로셔 디자인 및 온라인 마케팅 서비스를 제공하는 Bridgemakers 공식 웹사이트입니다.",
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <html lang="ko" className="dark">
      <body className={inter.className}>
        <AuthProvider initialSession={session}>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

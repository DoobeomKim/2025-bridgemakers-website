import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Roboto } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const roboto = Roboto({
  weight: ["700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Bridgemakers - 디지털 컨텐츠 제작 전문업체",
  description: "영상 제작, 웹 디자인, 브로셔 디자인 및 온라인 마케팅 서비스를 제공하는 Bridgemakers 공식 웹사이트입니다.",
};

// 쿠키에서 직접 Clerk 키 추출 (서버 컴포넌트에서 사용할 수 없으므로 클라이언트에서 처리)
const CLERK_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_bG95YWwtdGV0cmEtNTQuY2xlcmsuYWNjb3VudHMuZGV2JA';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      appearance={{
        variables: { colorPrimary: "#4f46e5" },
        elements: {
          formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-sm normal-case",
          footerActionLink: "text-indigo-600 hover:text-indigo-500",
          card: "rounded-xl shadow-md"
        }
      }}
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${roboto.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

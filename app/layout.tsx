import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Bridgemakers - 디지털 컨텐츠 제작 전문업체",
  description: "영상 제작, 웹 디자인, 브로셔 디자인 및 온라인 마케팅 서비스를 제공하는 Bridgemakers 공식 웹사이트입니다.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${roboto.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}

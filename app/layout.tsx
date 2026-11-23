import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE } from "@/constant";
import { rootMetadata } from "@/metadata/staticMetadata";
import "./globals.css";

const pretendard = localFont({
  src: "./fonts/PretendardStdVariable.woff2",
  weight: "300 900",
  variable: "--font-pretendard",
  display: "swap",
});

export const metadata: Metadata = rootMetadata();

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

/**
 * 루트 레이아웃은 html·body·글꼴만 맡는다.
 * 헤더와 푸터는 시안마다 다르므로 각 시안의 Shell이 그린다.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={SITE.lang} className={pretendard.variable}>
      <body>{children}</body>
    </html>
  );
}

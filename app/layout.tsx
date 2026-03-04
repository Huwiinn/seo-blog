import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { navItems } from "./site-data";
import localFont from "next/font/local";
import { staticWebsiteMetaData } from "@/metadata/staticMetadata";
import { seoData } from "@/constant";
import { GoogleTagManager } from "@next/third-parties/google";

const pretendard = localFont({
  src: "./fonts/PretendardStdVariable.woff2",
  weight: "300 900",
  variable: "--font-pretendard",
});

const mainMetadata = staticWebsiteMetaData({
  robots: true,
  path: "",
  description: seoData.common.description,
});

export const metadata: Metadata = mainMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <GoogleTagManager
        gtmId={process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID as string}
      />
      <html lang="ko">
        <body className={`${pretendard.variable} antialiased`}>
          <div className="site-shell">
            <header className="site-header">
              <div className="site-header__inner">
                <Link href="/" className="brand">
                  <span className="brand__eyebrow">SEO LAB</span>
                  <span className="brand__title">SEO Lab Notes</span>
                </Link>
                <nav className="main-nav" aria-label="Primary">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="main-nav__link"
                    >
                      {item.title}
                    </Link>
                  ))}
                </nav>
              </div>
            </header>
            <main>{children}</main>
            <footer className="site-footer">
              <div className="site-footer__inner">
                <p className="site-footer__title">SEO Lab Notes</p>
                <p className="site-footer__copy">
                  테크니컬 SEO, 콘텐츠 전략, 분석과 실험을 기록하는 개인 지식
                  베이스
                </p>
              </div>
            </footer>
          </div>
        </body>
      </html>
    </>
  );
}

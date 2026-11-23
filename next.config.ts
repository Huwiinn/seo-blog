import type { NextConfig } from "next";

/** 예전 카테고리 주소 → 새 주소 (301) */
const legacyRedirects: [from: string, to: string][] = [
  ["/technical-seo", "/seo"],
  ["/content-seo", "/seo"],
  ["/ga", "/posts"],
  ["/marketing-terms", "/posts"],
  ["/learning-log", "/posts"],
];

const nextConfig: NextConfig = {
  async redirects() {
    return legacyRedirects.map(([source, destination]) => ({
      source,
      destination,
      // permanent: true는 308을 보낸다. 오래된 크롤러도 확실히 따라오도록 301을 쓴다.
      statusCode: 301,
    }));
  },
  async headers() {
    return [
      {
        // 시안 갤러리와 에디터는 검색 결과에 나오지 않게 한다.
        source: "/:section(designs|admin)/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;

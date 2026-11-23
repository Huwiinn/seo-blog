import { serializeJsonLd, type JsonLd as JsonLdData } from "@/lib/seo/jsonld";

/** 구조화 데이터. 시안과 무관하게 페이지 단위에서 출력한다. */
export function JsonLd({ data }: { data: JsonLdData | JsonLdData[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(item) }}
        />
      ))}
    </>
  );
}

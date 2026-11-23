import type { Extensions } from "@tiptap/core";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import StarterKit from "@tiptap/starter-kit";
import { isSafeHref } from "./url";

/**
 * 본문 에디터와 렌더러가 공유하는 확장 목록.
 * 서버 컴포넌트에서도 import하므로 @tiptap/react·Placeholder는 넣지 않는다.
 *
 * - heading: false → 본문 안에서는 제목을 만들 수 없다. H2/H3는 섹션 구조로만 생긴다.
 * - link: 기본값(rel="nofollow", target="_blank")을 해제한다. 외부 링크의 rel은 렌더러가 붙인다.
 * - table: 비교·용어 정리용 표. 열 너비 조절은 쓰지 않는다(화면 폭에 맞춰 흐르게 둔다).
 */
export const bodyExtensions: Extensions = [
  StarterKit.configure({
    heading: false,
    link: {
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      defaultProtocol: "https",
      isAllowedUri: (url) => isSafeHref(url),
      HTMLAttributes: { rel: null, target: null },
    },
  }),
  Image.configure({ inline: false, allowBase64: false }),
  TableKit.configure({ table: { resizable: false } }),
];

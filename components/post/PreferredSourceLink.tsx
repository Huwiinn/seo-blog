import { preferredSourceUrl } from "@/lib/seo/preferred-source";

/**
 * 글 시작 지점에 두는 "Google 선호하는 매체에 추가" 버튼.
 * 구글 스크립트(publisher.js) 대신 공식 딥링크를 써서 외부 JS 없이 정적으로 렌더한다.
 * 훅이 없어 RSC·에디터 미리보기 양쪽에서 그대로 쓴다.
 */
export function PreferredSourceLink({ className }: { className?: string }) {
  return (
    <a
      className={["preferred-source", className].filter(Boolean).join(" ")}
      href={preferredSourceUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Google 검색에서 이 블로그를 선호하는 매체로 추가 (새 탭에서 열림)"
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
        <path
          fill="currentColor"
          d="M12 2.5l2.94 5.96 6.56.95-4.75 4.63 1.12 6.53L12 17.49l-5.87 3.08 1.12-6.53L2.5 9.41l6.56-.95L12 2.5z"
        />
      </svg>
      <span>
        <span className="preferred-source__brand">Google</span> 선호하는 매체에 추가
      </span>
    </a>
  );
}

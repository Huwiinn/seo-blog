import { formatDate, toDateAttr } from "@/lib/format";

/** <time dateTime="2026-11-19">2026년 11월 19일</time> (한국 시간 기준) */
export function PostDate({ value, className }: { value: string | null; className?: string }) {
  if (!value) return <span className={className}>발행 전</span>;
  return (
    <time className={className} dateTime={toDateAttr(value)}>
      {formatDate(value)}
    </time>
  );
}

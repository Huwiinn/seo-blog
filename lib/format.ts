const KST = "Asia/Seoul";

const longDate = new Intl.DateTimeFormat("ko-KR", {
  timeZone: KST,
  year: "numeric",
  month: "long",
  day: "numeric",
});

const partsFormat = new Intl.DateTimeFormat("en-CA", {
  timeZone: KST,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function kstParts(value: string | number | Date): Record<string, string> {
  const parts: Record<string, string> = {};
  for (const part of partsFormat.formatToParts(new Date(value))) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  return parts;
}

/** 2026년 11월 19일 (한국 시간 기준) */
export function formatDate(value: string | number | Date): string {
  return longDate.format(new Date(value));
}

/** 2026.11.19 */
export function formatDateDots(value: string | number | Date): string {
  const p = kstParts(value);
  return `${p.year}.${p.month}.${p.day}`;
}

/** <time dateTime> 용 2026-11-19 */
export function toDateAttr(value: string | number | Date): string {
  const p = kstParts(value);
  return `${p.year}-${p.month}-${p.day}`;
}

/** 구조화 데이터용 ISO 8601 (한국 시간 오프셋 포함): 2026-11-19T21:30:00+09:00 */
export function toKstIso(value: string | number | Date): string {
  const p = kstParts(value);
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}+09:00`;
}

/** 오후 9:30 (저장 시각 표시용) */
export function formatTime(value: string | number | Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: KST,
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

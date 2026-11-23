import { SITE } from "../../constant/site";
import { buildOutline } from "../content/anchors";
import {
  allBodies,
  collectImages,
  collectLinks,
  contentBodyText,
  countCharacters,
  countWords,
  estimateReadingMinutes,
  firstParagraph,
  isRichTextEmpty,
  richTextToPlain,
  topLevelParagraphs,
} from "../content/text";
import type { CoverImage, PostContent } from "../content/types";
import { classifyHref } from "../content/url";
import { isValidSlug, suggestSlug } from "../posts/slug";
import { estimateTextWidth, type MeasureFn } from "./measure";
import { resolvePostMeta } from "./meta";
import { SEO_RULES } from "./rules";

export type SeoGroup = "structure" | "meta" | "keyword" | "content" | "aeo";
/** error만 발행을 막는다. warning은 점수에 반영되는 권고, info는 점수와 무관한 제안. */
export type SeoSeverity = "error" | "warning" | "info";
export type SeoStatus = "pass" | "fail";

export interface SeoCheck {
  id: string;
  group: SeoGroup;
  status: SeoStatus;
  severity: SeoSeverity;
  message: string;
  /** 문제가 있는 섹션 id (에디터에서 해당 블록으로 이동할 때 사용) */
  targets?: string[];
}

export interface SeoStats {
  chars: number;
  readingMinutes: number;
  h2: number;
  h3: number;
  images: number;
  internalLinks: number;
  externalLinks: number;
  titleWidth: number;
  descriptionWidth: number;
}

export interface SeoReport {
  /** 0~100 */
  score: number;
  checks: SeoCheck[];
  errors: SeoCheck[];
  warnings: SeoCheck[];
  canPublish: boolean;
  stats: SeoStats;
}

export interface SeoInput {
  title: string;
  slug: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  coverImage: CoverImage | null;
  content: PostContent;
}

export interface SeoContext {
  /** 글자 폭 측정 함수. 생략하면 추정치를 쓴다. */
  measure?: MeasureFn;
  /** 다른 글이 같은 슬러그를 쓰고 있는지 */
  slugTaken?: boolean;
}

export const SEO_GROUP_LABELS: Record<SeoGroup, string> = {
  structure: "구조",
  meta: "검색 노출",
  keyword: "포커스 키워드",
  content: "콘텐츠",
  aeo: "AEO·GEO",
};

const WEIGHTS: Record<string, number> = {
  h1: 10,
  "h2-empty": 10,
  "h3-empty": 10,
  slug: 10,
  "h2-count": 5,
  "heading-duplicate": 3,
  "empty-body": 4,
  "slug-length": 2,
  "title-width": 5,
  description: 6,
  cover: 3,
  "keyword-title": 5,
  "keyword-description": 3,
  "keyword-intro": 3,
  "keyword-h2": 3,
  "keyword-slug": 2,
  "keyword-body": 3,
  length: 6,
  "image-alt": 4,
  "links-internal": 3,
  "links-external": 3,
  "long-paragraph": 2,
  summary: 6,
  "direct-answer": 3,
};

const QUESTION_PATTERN =
  /[?？]\s*$|무엇|뭘까|뭔가|어떻게|어떤|왜\s|왜$|언제|어디|얼마|누가|인가요|일까|할까|될까|하나요|되나요|인가$|는가$|은가$|방법/;

/** 한글은 띄어쓰기가 흔들리므로 공백을 모두 지우고 소문자로 비교한다. */
function compact(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "");
}

function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

function quote(text: string): string {
  return `“${text}”`;
}

export function analyzePost(input: SeoInput, context: SeoContext = {}): SeoReport {
  const measure = context.measure ?? estimateTextWidth;
  const { content } = input;
  const checks: SeoCheck[] = [];

  const add = (
    id: string,
    group: SeoGroup,
    ok: boolean,
    severity: SeoSeverity,
    passMessage: string,
    failMessage: string,
    targets?: string[],
  ) => {
    checks.push({
      id,
      group,
      status: ok ? "pass" : "fail",
      severity,
      message: ok ? passMessage : failMessage,
      targets: ok ? undefined : targets,
    });
  };

  const title = input.title.trim();
  const slug = input.slug.trim();
  const summary = input.summary.trim();
  const meta = resolvePostMeta(input);
  const outline = buildOutline(content);
  const sections = content.sections;
  const subsections = sections.flatMap((section) => section.subsections);
  const bodies = allBodies(content);
  const bodyText = contentBodyText(content);
  const chars = countCharacters(bodyText);
  const images = bodies.flatMap((body) => collectImages(body));
  const links = bodies.flatMap((body) => collectLinks(body));
  const internalLinks = links.filter((l) => classifyHref(l.href, SITE.url) === "internal");
  const externalLinks = links.filter((l) => classifyHref(l.href, SITE.url) === "external");

  /* ───── 구조 ───── */
  add("h1", "structure", title.length > 0, "error", "H1 제목이 있습니다.", "H1 제목을 입력하세요.");

  checks.push({
    id: "hierarchy",
    group: "structure",
    status: "pass",
    severity: "info",
    message: "제목 계층(H1 › H2 › H3)은 구조로 보장됩니다. H1은 하나뿐입니다.",
  });

  if (sections.length > 0) {
    const emptyH2 = sections.filter((s) => !s.heading.trim());
    add(
      "h2-empty",
      "structure",
      emptyH2.length === 0,
      "error",
      "모든 H2 섹션에 제목이 있습니다.",
      `제목이 비어 있는 H2 섹션이 ${emptyH2.length}개 있습니다.`,
      emptyH2.map((s) => s.id),
    );
  }

  if (subsections.length > 0) {
    const emptyH3 = subsections.filter((s) => !s.heading.trim());
    add(
      "h3-empty",
      "structure",
      emptyH3.length === 0,
      "error",
      "모든 H3 소제목에 제목이 있습니다.",
      `제목이 비어 있는 H3 소제목이 ${emptyH3.length}개 있습니다.`,
      emptyH3.map((s) => s.id),
    );
  }

  add(
    "h2-count",
    "structure",
    sections.length >= 2,
    "warning",
    `H2 섹션 ${sections.length}개, H3 소제목 ${subsections.length}개로 나뉘어 있습니다.`,
    `H2 섹션을 2개 이상으로 나누세요 (현재 ${sections.length}개).`,
  );

  const seen = new Map<string, string>();
  const duplicated = new Set<string>();
  const duplicateTargets: string[] = [];
  for (const item of outline.flatMap((o) => [o, ...o.children])) {
    if (!item.heading) continue;
    const key = compact(item.heading);
    if (seen.has(key)) {
      duplicated.add(item.heading);
      duplicateTargets.push(item.id);
    } else {
      seen.set(key, item.id);
    }
  }
  if (sections.length > 0) {
    add(
      "heading-duplicate",
      "structure",
      duplicated.size === 0,
      "warning",
      "제목이 서로 겹치지 않습니다.",
      `같은 제목이 반복됩니다: ${[...duplicated].map(quote).join(", ")}`,
      duplicateTargets,
    );

    const emptyBodies = [
      ...sections.filter((s) => isRichTextEmpty(s.body) && s.subsections.length === 0),
      ...subsections.filter((s) => isRichTextEmpty(s.body)),
    ];
    add(
      "empty-body",
      "structure",
      emptyBodies.length === 0,
      "warning",
      "모든 섹션에 본문이 있습니다.",
      `본문이 비어 있는 섹션이 ${emptyBodies.length}개 있습니다.`,
      emptyBodies.map((s) => s.id),
    );
  }

  /* ───── 검색 노출 ───── */
  const slugOk = slug.length > 0 && isValidSlug(slug) && !context.slugTaken;
  add(
    "slug",
    "meta",
    slugOk,
    "error",
    `주소: /posts/${slug}`,
    !slug
      ? "슬러그(주소)를 입력하세요."
      : !isValidSlug(slug)
        ? "슬러그는 영문 소문자·숫자·하이픈만 쓸 수 있습니다."
        : "다른 글이 이미 쓰고 있는 슬러그입니다.",
  );
  if (slug && isValidSlug(slug)) {
    add(
      "slug-length",
      "meta",
      slug.length <= SEO_RULES.slug.recommendedLength,
      "warning",
      `슬러그 길이가 적절합니다 (${slug.length}자).`,
      `슬러그가 깁니다 (${slug.length}자, 권장 ${SEO_RULES.slug.recommendedLength}자 이하).`,
    );
  }

  const titleWidth = meta.title ? measure(meta.fullTitle, SEO_RULES.serp.titleFontPx) : 0;
  if (meta.title) {
    const { titleMaxPx, titleMinPx } = SEO_RULES.serp;
    add(
      "title-width",
      "meta",
      titleWidth <= titleMaxPx && titleWidth >= titleMinPx,
      "warning",
      `검색 결과 제목 길이가 적절합니다 (${titleWidth}px / ${titleMaxPx}px).`,
      titleWidth > titleMaxPx
        ? `검색 결과에서 제목이 잘릴 수 있습니다 (${titleWidth}px / ${titleMaxPx}px). 메타 제목을 줄여 보세요.`
        : `검색 결과 제목이 짧습니다 (${titleWidth}px). 핵심 키워드를 담아 조금 더 구체적으로 써 보세요.`,
    );
  }

  const descriptionWidth = meta.description
    ? measure(meta.description, SEO_RULES.serp.descriptionFontPx)
    : 0;
  {
    const { descriptionMaxPx, descriptionMinPx } = SEO_RULES.serp;
    const hasOwn = meta.descriptionSource === "meta" || meta.descriptionSource === "summary";
    add(
      "description",
      "meta",
      hasOwn && descriptionWidth <= descriptionMaxPx && descriptionWidth >= descriptionMinPx,
      "warning",
      `메타 설명 길이가 적절합니다 (${descriptionWidth}px / ${descriptionMaxPx}px).`,
      !hasOwn
        ? "메타 설명이 없습니다. 핵심 요약이나 메타 설명을 입력하세요."
        : descriptionWidth > descriptionMaxPx
          ? `검색 결과에서 설명이 잘릴 수 있습니다 (${descriptionWidth}px / ${descriptionMaxPx}px).`
          : `메타 설명이 짧습니다 (${descriptionWidth}px). 글의 답을 한두 문장으로 요약해 보세요.`,
    );
  }

  add(
    "cover",
    "meta",
    Boolean(input.coverImage && input.coverImage.alt.trim()),
    "warning",
    "대표 이미지와 대체 텍스트가 있습니다.",
    input.coverImage
      ? "대표 이미지의 대체 텍스트(alt)를 입력하세요."
      : "대표 이미지가 없습니다. 공유할 때 사이트 기본 이미지가 쓰입니다.",
  );

  /* ───── 포커스 키워드 ───── */
  const keyword = input.focusKeyword.trim();
  if (!keyword) {
    checks.push({
      id: "keyword-missing",
      group: "keyword",
      status: "fail",
      severity: "info",
      message: "포커스 키워드를 설정하면 제목·설명·본문의 키워드 배치를 점검합니다.",
    });
  } else {
    const needle = compact(keyword);
    const has = (text: string) => compact(text).includes(needle);
    add(
      "keyword-title",
      "keyword",
      has(title) || has(meta.title),
      "warning",
      "H1 제목에 키워드가 있습니다.",
      `H1 제목에 ${quote(keyword)}를 넣어 보세요.`,
    );
    add(
      "keyword-description",
      "keyword",
      has(meta.description),
      "warning",
      "메타 설명에 키워드가 있습니다.",
      "메타 설명(또는 핵심 요약)에 키워드가 없습니다.",
    );
    add(
      "keyword-intro",
      "keyword",
      has(firstParagraph(content.intro)),
      "warning",
      "도입부 첫 문단에 키워드가 있습니다.",
      "도입부 첫 문단에 키워드를 자연스럽게 넣어 보세요.",
    );
    add(
      "keyword-h2",
      "keyword",
      sections.some((s) => has(s.heading)),
      "warning",
      "H2 제목 중 하나 이상에 키워드가 있습니다.",
      "H2 제목 중 하나에 키워드를 넣어 보세요.",
    );
    const keywordSlug = suggestSlug(keyword);
    if (keywordSlug) {
      add(
        "keyword-slug",
        "keyword",
        slug.includes(keywordSlug),
        "warning",
        "슬러그에 키워드가 있습니다.",
        `슬러그에 ${quote(keywordSlug)}를 넣어 보세요.`,
      );
    }
    const occurrences = countOccurrences(compact(bodyText), needle);
    const words = countWords(bodyText);
    const density = words > 0 ? occurrences / words : 0;
    add(
      "keyword-body",
      "keyword",
      occurrences > 0 && density <= SEO_RULES.keyword.maxDensity,
      "warning",
      `본문에 키워드가 ${occurrences}번 나옵니다.`,
      occurrences === 0
        ? "본문에 키워드가 한 번도 나오지 않습니다."
        : `키워드 반복이 많습니다 (${occurrences}번). 동의어나 관련 표현으로 바꿔 보세요.`,
    );
  }

  /* ───── 콘텐츠 ───── */
  add(
    "length",
    "content",
    chars >= SEO_RULES.content.minChars,
    "warning",
    `본문 ${chars.toLocaleString("ko-KR")}자 (공백 제외).`,
    `본문이 짧습니다 (${chars.toLocaleString("ko-KR")}자, 권장 ${SEO_RULES.content.minChars.toLocaleString("ko-KR")}자 이상).`,
  );

  if (images.length > 0) {
    const missingAlt = images.filter((image) => !image.alt);
    add(
      "image-alt",
      "content",
      missingAlt.length === 0,
      "warning",
      `본문 이미지 ${images.length}개 모두 대체 텍스트가 있습니다.`,
      `대체 텍스트(alt)가 없는 이미지가 ${missingAlt.length}개 있습니다.`,
    );
  }

  add(
    "links-internal",
    "content",
    internalLinks.length > 0,
    "warning",
    `내부 링크 ${internalLinks.length}개.`,
    "내부 링크가 없습니다. 관련된 다른 글로 연결해 보세요.",
  );
  add(
    "links-external",
    "content",
    externalLinks.length > 0,
    "warning",
    `외부 출처 링크 ${externalLinks.length}개.`,
    "외부 출처 링크가 없습니다. 근거가 되는 자료를 연결하면 신뢰도가 높아집니다.",
  );

  const longParagraphs = bodies
    .flatMap((body) => topLevelParagraphs(body))
    .filter((text) => text.length > SEO_RULES.content.longParagraphChars);
  add(
    "long-paragraph",
    "content",
    longParagraphs.length === 0,
    "warning",
    "문단 길이가 읽기 좋습니다.",
    `${SEO_RULES.content.longParagraphChars}자를 넘는 문단이 ${longParagraphs.length}개 있습니다. 나누면 읽기 쉽습니다.`,
  );

  /* ───── AEO·GEO ───── */
  {
    const { minChars, maxChars } = SEO_RULES.summary;
    add(
      "summary",
      "aeo",
      summary.length >= minChars && summary.length <= maxChars,
      "warning",
      `핵심 요약이 있습니다 (${summary.length}자).`,
      !summary
        ? "핵심 요약을 입력하세요. AI 답변과 스니펫이 인용하기 좋은 2~3문장입니다."
        : `핵심 요약은 ${minChars}~${maxChars}자가 적절합니다 (현재 ${summary.length}자).`,
    );
  }

  const headings = outline.flatMap((o) => [o.heading, ...o.children.map((c) => c.heading)]);
  const questions = headings.filter((heading) => QUESTION_PATTERN.test(heading));
  add(
    "question-heading",
    "aeo",
    questions.length > 0,
    "info",
    `질문형 제목 ${questions.length}개.`,
    "질문형 제목(예: “~란 무엇인가?”)을 쓰면 답변 엔진이 질문과 답을 짝짓기 쉽습니다.",
  );

  const answerable = sections.filter((s) => firstParagraph(s.body).length > 0);
  if (answerable.length > 0) {
    const longFirst = answerable.filter(
      (s) => firstParagraph(s.body).length > SEO_RULES.directAnswer.maxChars,
    );
    add(
      "direct-answer",
      "aeo",
      longFirst.length === 0,
      "warning",
      "각 섹션이 짧은 첫 문단으로 바로 답합니다.",
      `첫 문단이 긴 섹션이 ${longFirst.length}개 있습니다. 첫 문단(${SEO_RULES.directAnswer.maxChars}자 이하)에서 바로 답하세요.`,
      longFirst.map((s) => s.id),
    );
  }

  const numbers = bodyText.match(/\d+(?:[.,]\d+)?\s?(?:%|퍼센트|배|명|개|건|초|ms|px|원|달러|년|위)/g) ?? [];
  add(
    "evidence",
    "aeo",
    numbers.length > 0 && externalLinks.length > 0,
    "info",
    `수치 ${numbers.length}곳, 외부 출처 ${externalLinks.length}개가 근거로 제시되어 있습니다.`,
    "구체적인 수치와 출처를 함께 제시하면 AI 답변에 인용될 가능성이 높아집니다.",
  );

  const faqSections = sections.filter((s) => s.kind === "faq" && s.subsections.length > 0);
  add(
    "faq",
    "aeo",
    faqSections.length > 0,
    "info",
    "FAQ 섹션이 있습니다 (FAQPage 구조화 데이터 출력).",
    "자주 묻는 질문은 FAQ로 표시한 H2 섹션과 H3 질문으로 정리할 수 있습니다.",
  );

  /* ───── 점수 ───── */
  let total = 0;
  let earned = 0;
  for (const check of checks) {
    if (check.severity === "info") continue;
    const weight = WEIGHTS[check.id] ?? 3;
    total += weight;
    if (check.status === "pass") earned += weight;
  }

  const failed = checks.filter((check) => check.status === "fail");
  const errors = failed.filter((check) => check.severity === "error");
  const warnings = failed.filter((check) => check.severity === "warning");

  return {
    score: total > 0 ? Math.round((earned / total) * 100) : 0,
    checks,
    errors,
    warnings,
    canPublish: errors.length === 0,
    stats: {
      chars,
      readingMinutes: estimateReadingMinutes(chars, SEO_RULES.reading.charsPerMinute),
      h2: sections.length,
      h3: subsections.length,
      images: images.length,
      internalLinks: internalLinks.length,
      externalLinks: externalLinks.length,
      titleWidth,
      descriptionWidth,
    },
  };
}

/** FAQ 섹션에서 질문·답변 쌍을 뽑는다 (JSON-LD와 점검에서 사용). */
export function extractFaq(content: PostContent): { question: string; answer: string }[] {
  return content.sections
    .filter((section) => section.kind === "faq")
    .flatMap((section) => section.subsections)
    .map((sub) => ({ question: sub.heading.trim(), answer: richTextToPlain(sub.body) }))
    .filter((pair) => pair.question && pair.answer);
}

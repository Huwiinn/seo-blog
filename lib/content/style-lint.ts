import { allBodies, richTextToPlain, topLevelParagraphs } from "./text";
import type { PostContent } from "./types";

/**
 * 원고 문체 점검(윤문 보조). 사람이 읽고 고치는 윤문을 대신하지는 않고,
 * 기계로 잡을 수 있는 것만 잡는다: 금지 표현, 줄표, 타임스탬프, 지나치게 긴 문장, 문체 혼용.
 */
export interface StyleIssue {
  rule: string;
  message: string;
  sample?: string;
}

export interface StyleLintInput {
  title: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  tags: string[];
  content: PostContent;
}

const BANNED: [RegExp, string][] = [
  [/알아보겠습니다|살펴보겠습니다|알아봅시다|살펴봅시다/, "상투적인 예고 문장"],
  [/결론적으로|한마디로|요약하자면/, "상투적인 정리 표현"],
  [/게임 ?체인저|혁신적인|획기적인|놀라운/, "과장 표현"],
  [/되어집니다|되어지는|보여집니다|보여지는|쓰여지는|불리우는/, "이중 피동"],
  [/라고 볼 수 있습니다|라고 할 수 있습니다|할 수 있을 것입니다/, "에두른 표현"],
];

const TIMESTAMP = /\[\d{1,2}:\d{2}(?::\d{2})?\]|\b\d{1,2}:\d{2}\s?[~-]\s?\d{1,2}:\d{2}\b/;
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B55}]/u;
const SENTENCE_LIMIT = 110;

function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function clip(text: string, length = 44): string {
  return text.length > length ? `${text.slice(0, length)}…` : text;
}

function between(value: string, min: number, max: number): boolean {
  return value.length >= min && value.length <= max;
}

export function lintStyle(input: StyleLintInput): StyleIssue[] {
  const issues: StyleIssue[] = [];
  const add = (rule: string, message: string, sample?: string) =>
    issues.push({ rule, message, sample: sample ? clip(sample) : undefined });

  /* 머리말 길이 */
  if (!between(input.title, 12, 40)) add("title-length", `제목 ${input.title.length}자 (권장 18~34자)`);
  if (input.metaTitle && input.metaTitle.length > 24) add("meta-title-length", `메타 제목 ${input.metaTitle.length}자 (22자 이하)`);
  if (!between(input.summary, 60, 220)) add("summary-length", `핵심 요약 ${input.summary.length}자 (80~200자)`);
  if (input.metaDescription && !between(input.metaDescription, 40, 85)) {
    add("meta-description-length", `메타 설명 ${input.metaDescription.length}자 (50~75자)`);
  }
  if (input.tags.length < 3 || input.tags.length > 5) add("tags-count", `태그 ${input.tags.length}개 (3~5개)`);

  /* 본문 */
  const bodies = allBodies(input.content);
  const headings = input.content.sections.flatMap((section) => [
    section.heading,
    ...section.subsections.map((sub) => sub.heading),
  ]);
  const prose = bodies.flatMap((body) => topLevelParagraphs(body));
  const everything = [input.title, input.summary, ...headings, ...bodies.map((body) => richTextToPlain(body))].join("\n");

  for (const [pattern, label] of BANNED) {
    const match = pattern.exec(everything);
    if (match) add("banned-phrase", `${label}: "${match[0]}"`, everything.slice(Math.max(0, match.index - 14), match.index + 24));
  }
  if (everything.includes("—")) {
    const index = everything.indexOf("—");
    add("em-dash", "줄표(—)로 문장을 이었습니다. 쉼표나 마침표로 바꾸세요.", everything.slice(Math.max(0, index - 16), index + 16));
  }
  const stamp = TIMESTAMP.exec(everything);
  if (stamp) add("timestamp", `영상 타임스탬프가 남아 있습니다: ${stamp[0]}`);
  if (EMOJI.test(everything)) add("emoji", "이모지가 있습니다.");
  if (/\[\[|\]\]/.test(everything)) add("wikilink", "Obsidian 링크([[…]])가 남아 있습니다.");

  const long = prose.flatMap((paragraph) => sentences(paragraph)).filter((sentence) => sentence.length > SENTENCE_LIMIT);
  if (long.length > 0) add("long-sentence", `${SENTENCE_LIMIT}자를 넘는 문장 ${long.length}개`, long[0]);

  // 문단은 합니다체여야 한다. 해요체·반말·명사형 종결이 섞였는지 본다.
  const mixed = prose
    .flatMap((paragraph) => sentences(paragraph))
    .filter((sentence) => /[가-힣]/.test(sentence))
    .filter((sentence) => /(해요|예요|이에요|어요|아요|네요|군요|죠|한다|이다|있다|된다|했다)[.!?]?$/.test(sentence));
  if (mixed.length > 0) add("tone-mixed", `합니다체가 아닌 문장 ${mixed.length}개`, mixed[0]);

  for (const heading of headings) {
    if (/^\d+(\.\d+)*[.)]?\s/.test(heading)) add("numbered-heading", "제목 앞의 번호(1., 4.1 등)를 지우세요.", heading);
    if (heading.length > 44) add("long-heading", `제목이 깁니다 (${heading.length}자)`, heading);
  }

  return issues;
}

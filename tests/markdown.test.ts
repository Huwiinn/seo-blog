import { describe, expect, it } from "vitest";
import { parsePostMarkdown } from "@/lib/content/markdown";
import { richTextToPlain } from "@/lib/content/text";
import { postContentSchema } from "@/lib/content/validate";
import { extractFaq } from "@/lib/seo/analyze";

const SAMPLE = `---
source: 개발/2026/버튼 모션 용어 9개.md
slug: button-motion-terms
category: ux-ui
title: 버튼 모션 용어 9개: 이름만 말해도 통하는 인터랙션
metaTitle: "버튼 모션 용어 9개"
summary: 요약 문장입니다.
tags: [버튼 모션, "UI 인터랙션", 바이브코딩]
---

도입부 **첫** 문단입니다. [원본 영상](https://www.youtube.com/shorts/abc)을 정리했습니다.

둘째 문단은 \`code\`와 *기울임*, ~~취소선~~을 씁니다.

## 버튼 모션은 왜 이름으로 요청하나?

이름이 정확하면 한 줄로 충분합니다.

| 용어 | 영문 이름 | 동작 |
| :--- | :--- | :--- |
| 마그넷 | \`Magnet Button\` | 커서 쪽으로 **끌려옵니다** |
| 샤이니 | Shiny Button | 빛이 따라다닙니다 |

### 고르는 기준

1. 목적을 정합니다.
2. 이름을 고릅니다.
   - 한 화면에 하나만 씁니다.

> 모션은 적을수록 눈에 띕니다.

\`\`\`css
.btn { transition: transform 0.3s; }
\`\`\`

## 자주 묻는 질문

### 모션을 여러 개 써도 되나요?

한 화면에 하나가 적당합니다.
`;

describe("마크다운 초안 → 글 구조", () => {
  const parsed = parsePostMarkdown(SAMPLE);

  it("머리말을 읽는다 (콜론이 든 제목, 따옴표, 태그 목록)", () => {
    expect(parsed.meta).toMatchObject({
      source: "개발/2026/버튼 모션 용어 9개.md",
      slug: "button-motion-terms",
      category: "ux-ui",
      title: "버튼 모션 용어 9개: 이름만 말해도 통하는 인터랙션",
      metaTitle: "버튼 모션 용어 9개",
    });
    expect(parsed.tags).toEqual(["버튼 모션", "UI 인터랙션", "바이브코딩"]);
  });

  it("첫 H2 앞은 도입부, ##는 H2 섹션, ###는 그 아래 H3가 된다", () => {
    const { content } = parsed;
    expect(richTextToPlain(content.intro)).toContain("도입부 첫 문단입니다.");
    expect(content.sections.map((section) => section.heading)).toEqual([
      "버튼 모션은 왜 이름으로 요청하나?",
      "자주 묻는 질문",
    ]);
    expect(content.sections[0].subsections.map((sub) => sub.heading)).toEqual(["고르는 기준"]);
    expect(content.sections.map((section) => section.id)).toEqual(["sec-1", "sec-2"]);
    expect(content.sections[0].subsections[0].id).toBe("sec-1-1");
  });

  it("FAQ 제목을 알아보고 질문·답변 쌍을 만든다", () => {
    expect(parsed.content.sections[1].kind).toBe("faq");
    expect(extractFaq(parsed.content)).toEqual([
      { question: "모션을 여러 개 써도 되나요?", answer: "한 화면에 하나가 적당합니다." },
    ]);
  });

  it("굵게·기울임·코드·취소선·링크를 마크로 바꾼다", () => {
    const intro = parsed.content.intro.content ?? [];
    const first = intro[0].content ?? [];
    expect(first.find((node) => node.text === "첫")?.marks).toEqual([{ type: "bold" }]);
    expect(first.find((node) => node.text === "원본 영상")?.marks).toEqual([
      { type: "link", attrs: { href: "https://www.youtube.com/shorts/abc" } },
    ]);
    const second = intro[1].content ?? [];
    expect(second.find((node) => node.text === "code")?.marks).toEqual([{ type: "code" }]);
    expect(second.find((node) => node.text === "기울임")?.marks).toEqual([{ type: "italic" }]);
    expect(second.find((node) => node.text === "취소선")?.marks).toEqual([{ type: "strike" }]);
  });

  it("표는 머리글 행과 본문 행으로 바꾼다", () => {
    const table = parsed.content.sections[0].body.content?.find((node) => node.type === "table");
    expect(table?.content).toHaveLength(3);
    expect(table?.content?.[0].content?.map((item) => item.type)).toEqual([
      "tableHeader",
      "tableHeader",
      "tableHeader",
    ]);
    expect(table?.content?.[1].content?.[1].type).toBe("tableCell");
    expect(richTextToPlain(table)).toContain("Magnet Button");
  });

  it("목록(중첩 포함), 인용, 코드 블록을 바꾼다", () => {
    const blocks = parsed.content.sections[0].subsections[0].body.content ?? [];
    expect(blocks.map((node) => node.type)).toEqual(["orderedList", "blockquote", "codeBlock"]);
    const items = blocks[0].content ?? [];
    expect(items).toHaveLength(2);
    expect(items[1].content?.map((node) => node.type)).toEqual(["paragraph", "bulletList"]);
    expect(blocks[2].attrs).toEqual({ language: "css" });
    expect(blocks[2].content?.[0].text).toBe(".btn { transition: transform 0.3s; }");
  });

  it("결과가 저장 검증(본문 스키마)을 통과한다", () => {
    const result = postContentSchema.safeParse(parsed.content);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
    expect(parsed.warnings).toEqual([]);
  });
});

describe("받아들이지 않는 것", () => {
  it("이미지·HTML·mermaid·구분선·H1·H4는 건너뛰거나 낮추고 경고를 남긴다", () => {
    const parsed = parsePostMarkdown(`---
slug: x
---

# 본문 H1

문단 ![그림](assets/a.gif) 뒤.

<div class="callout">HTML</div>

## 섹션

\`\`\`mermaid
flowchart TD
\`\`\`

---

#### 작은 제목

[위험한 링크](javascript:alert(1)) 문장.
`);
    expect(parsed.content.sections).toHaveLength(1);
    expect(richTextToPlain(parsed.content.intro)).toBe("문단  뒤.");
    const body = parsed.content.sections[0].body.content ?? [];
    expect(body.map((node) => node.type)).toEqual(["paragraph", "paragraph"]);
    expect(body[0].content?.[0]).toEqual({ type: "text", text: "작은 제목", marks: [{ type: "bold" }] });
    expect(JSON.stringify(body)).not.toContain("javascript:");
    expect(parsed.warnings.length).toBeGreaterThanOrEqual(6);
    expect(postContentSchema.safeParse(parsed.content).success).toBe(true);
  });

  it("H2 없이 H3가 먼저 나오면 오류로 알린다", () => {
    expect(() => parsePostMarkdown("### 소제목\n\n본문")).toThrow(/H3/);
  });

  it("머리말이 없어도 본문은 읽는다", () => {
    const parsed = parsePostMarkdown("도입\n\n## 하나\n\n본문");
    expect(parsed.meta).toEqual({});
    expect(parsed.content.sections).toHaveLength(1);
  });
});

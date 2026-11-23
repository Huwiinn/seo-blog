import { describe, expect, it } from "vitest";
import { lintStyle, type StyleLintInput } from "@/lib/content/style-lint";
import { content, doc, p, section, sub } from "./helpers";

function input(overrides: Partial<StyleLintInput> = {}): StyleLintInput {
  return {
    title: "버튼 모션 용어 9개: 이름으로 요청하는 법",
    metaTitle: "버튼 모션 용어 9개 정리",
    summary:
      "버튼 모션은 표면 질감, 커서 반응, 조명 효과 세 갈래로 나뉩니다. 동작의 이름을 알면 AI 코딩 도구에 한 줄로 정확히 요청할 수 있습니다.",
    metaDescription: "버튼 모션 9가지의 이름과 동작, 어울리는 쓰임새를 표로 정리한 글입니다. 요청 문장도 함께 봅니다.",
    focusKeyword: "버튼 모션",
    tags: ["버튼 모션", "UI 인터랙션", "바이브코딩"],
    content: content(
      [section("sec-1", "버튼 모션은 왜 이름으로 요청하나?", doc(p("이름이 정확하면 한 줄로 충분합니다.")), [sub("sec-1-1", "고르는 기준")])],
      doc(p("버튼 모션은 이름으로 요청하면 정확합니다.")),
    ),
    ...overrides,
  };
}

const rules = (value: StyleLintInput) => lintStyle(value).map((issue) => issue.rule);

describe("원고 문체 점검", () => {
  it("규칙을 지킨 원고는 지적이 없다", () => {
    expect(lintStyle(input())).toEqual([]);
  });

  it("머리말 길이를 본다", () => {
    expect(rules(input({ title: "짧은 제목" }))).toContain("title-length");
    expect(rules(input({ metaTitle: "스물네 자를 넘기는 아주 긴 메타 제목입니다 정말로요" }))).toContain("meta-title-length");
    expect(rules(input({ summary: "너무 짧은 요약." }))).toContain("summary-length");
    expect(rules(input({ metaDescription: "짧음" }))).toContain("meta-description-length");
    expect(rules(input({ tags: ["하나"] }))).toContain("tags-count");
  });

  it("금지 표현, 줄표, 타임스탬프, 이모지, Obsidian 링크를 잡는다", () => {
    const body = (text: string) =>
      input({ content: content([section("sec-1", "제목", doc(p(text)))], doc(p("도입부입니다."))) });
    expect(rules(body("이제 버튼 모션에 대해 알아보겠습니다."))).toContain("banned-phrase");
    expect(rules(body("결론적으로 이름이 중요합니다."))).toContain("banned-phrase");
    expect(rules(body("이 방식은 혁신적인 변화입니다."))).toContain("banned-phrase");
    expect(rules(body("이 값은 자동으로 계산되어집니다."))).toContain("banned-phrase");
    expect(rules(body("모션은 세 갈래입니다 — 표면, 커서, 조명입니다."))).toContain("em-dash");
    expect(rules(body("발표자는 [02:45] 지점에서 수치를 밝혔습니다."))).toContain("timestamp");
    expect(rules(body("자세한 내용은 [[다른 노트]]를 참고합니다."))).toContain("wikilink");
    expect(rules(body("정말 좋습니다 \u{1F680}"))).toContain("emoji");
  });

  it("지나치게 긴 문장과 합니다체가 아닌 문장을 센다", () => {
    const long = `${"아주 긴 문장을 계속 이어서 쓰면 읽는 사람이 주어와 서술어를 놓치기 쉽고 ".repeat(4)}결국 다시 읽게 됩니다.`;
    const value = input({
      content: content([section("sec-1", "제목", doc(p(long), p("이건 해요체로 썼어요."), p("이 문장은 반말이다.")))], doc(p("도입부입니다."))),
    });
    const issues = lintStyle(value);
    expect(issues.find((issue) => issue.rule === "long-sentence")?.message).toMatch(/1개/);
    expect(issues.find((issue) => issue.rule === "tone-mixed")?.message).toMatch(/2개/);
  });

  it("제목 앞 번호와 너무 긴 제목을 잡는다", () => {
    const value = input({
      content: content(
        [
          section("sec-1", "4.1 구간별 분석", doc(p("본문입니다."))),
          section("sec-2", "이 제목은 마흔네 글자를 훌쩍 넘길 만큼 길어서 목차에서 읽기 어렵고 검색 결과에서도 잘립니다", doc(p("본문입니다."))),
        ],
        doc(p("도입부입니다.")),
      ),
    });
    expect(rules(value)).toEqual(expect.arrayContaining(["numbered-heading", "long-heading"]));
  });

  it("표와 목록 안의 명사형 표현은 문체 혼용으로 보지 않는다", () => {
    const value = input({
      content: content(
        [
          section(
            "sec-1",
            "용어 정리",
            doc(p("표로 정리했습니다."), {
              type: "bulletList",
              content: [{ type: "listItem", content: [p("커서 쪽으로 끌려온다")] }],
            }),
          ),
        ],
        doc(p("도입부입니다.")),
      ),
    });
    expect(rules(value)).not.toContain("tone-mixed");
  });
});

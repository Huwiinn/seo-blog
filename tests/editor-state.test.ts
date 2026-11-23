import { describe, expect, it } from "vitest";
import { draftReducer, type DraftAction, type EditorDraft } from "@/components/editor/state";
import { emptyContent, emptyDoc } from "@/lib/content/types";
import { doc, p } from "./helpers";

function draft(): EditorDraft {
  return {
    id: "post-000000001",
    slug: "",
    category: "seo",
    title: "",
    summary: "",
    metaTitle: "",
    metaDescription: "",
    focusKeyword: "",
    tags: [],
    coverImage: null,
    featured: false,
    content: emptyContent(),
  };
}

function run(actions: DraftAction[], start = draft()): EditorDraft {
  return actions.reduce(draftReducer, start);
}

const h2 = (state: EditorDraft) => state.content.sections.map((section) => section.id);
const h3 = (state: EditorDraft, sectionId: string) =>
  state.content.sections.find((section) => section.id === sectionId)?.subsections.map((sub) => sub.id);

describe("H2 섹션", () => {
  it("끝에 추가하고, afterId가 있으면 그 섹션 바로 아래에 넣는다", () => {
    const state = run([
      { type: "ADD_SECTION", id: "sec-a" },
      { type: "ADD_SECTION", id: "sec-b" },
      { type: "ADD_SECTION", id: "sec-c", afterId: "sec-a" },
    ]);
    expect(h2(state)).toEqual(["sec-a", "sec-c", "sec-b"]);
    expect(state.content.sections[0]).toMatchObject({ heading: "", kind: "default", subsections: [] });
    expect(state.content.sections[0].body).toEqual(emptyDoc());
  });

  it("같은 id를 두 번 추가하지 않는다", () => {
    const state = run([
      { type: "ADD_SECTION", id: "sec-a" },
      { type: "ADD_SECTION", id: "sec-a" },
    ]);
    expect(h2(state)).toEqual(["sec-a"]);
  });

  it("삭제하면 그 아래 H3도 함께 사라진다", () => {
    const state = run([
      { type: "ADD_SECTION", id: "sec-a" },
      { type: "ADD_SUBSECTION", sectionId: "sec-a", id: "sub-1" },
      { type: "ADD_SECTION", id: "sec-b" },
      { type: "REMOVE_SECTION", id: "sec-a" },
    ]);
    expect(h2(state)).toEqual(["sec-b"]);
    expect(h3(state, "sec-a")).toBeUndefined();
  });

  it("위아래로 옮기고, 끝에서는 더 움직이지 않는다", () => {
    const start = run([
      { type: "ADD_SECTION", id: "sec-a" },
      { type: "ADD_SECTION", id: "sec-b" },
      { type: "ADD_SECTION", id: "sec-c" },
    ]);
    expect(h2(draftReducer(start, { type: "MOVE_SECTION", id: "sec-c", direction: -1 }))).toEqual([
      "sec-a",
      "sec-c",
      "sec-b",
    ]);
    expect(draftReducer(start, { type: "MOVE_SECTION", id: "sec-a", direction: -1 })).toBe(start);
    expect(draftReducer(start, { type: "MOVE_SECTION", id: "sec-c", direction: 1 })).toBe(start);
  });

  it("제목·본문·FAQ 표시를 고친다", () => {
    const body = doc(p("본문"));
    const state = run([
      { type: "ADD_SECTION", id: "sec-a" },
      { type: "UPDATE_SECTION", id: "sec-a", patch: { heading: "GEO란?" } },
      { type: "UPDATE_SECTION", id: "sec-a", patch: { body } },
      { type: "UPDATE_SECTION", id: "sec-a", patch: { kind: "faq" } },
    ]);
    expect(state.content.sections[0]).toMatchObject({ heading: "GEO란?", kind: "faq", body });
  });
});

describe("H3 소제목", () => {
  const base = () =>
    run([
      { type: "ADD_SECTION", id: "sec-a" },
      { type: "ADD_SECTION", id: "sec-b" },
    ]);

  it("지정한 H2 아래에만 추가된다", () => {
    const state = run(
      [
        { type: "ADD_SUBSECTION", sectionId: "sec-a", id: "sub-1" },
        { type: "ADD_SUBSECTION", sectionId: "sec-a", id: "sub-2" },
        { type: "ADD_SUBSECTION", sectionId: "sec-a", id: "sub-3", afterId: "sub-1" },
        { type: "ADD_SUBSECTION", sectionId: "sec-b", id: "sub-9" },
      ],
      base(),
    );
    expect(h3(state, "sec-a")).toEqual(["sub-1", "sub-3", "sub-2"]);
    expect(h3(state, "sec-b")).toEqual(["sub-9"]);
  });

  it("없는 H2에는 추가할 수 없다 (H2 없이 H3만 생기지 않는다)", () => {
    const start = base();
    expect(draftReducer(start, { type: "ADD_SUBSECTION", sectionId: "nope", id: "sub-1" })).toBe(start);
  });

  it("삭제와 이동은 같은 H2 안에서만 일어난다", () => {
    const start = run(
      [
        { type: "ADD_SUBSECTION", sectionId: "sec-a", id: "sub-1" },
        { type: "ADD_SUBSECTION", sectionId: "sec-a", id: "sub-2" },
        { type: "ADD_SUBSECTION", sectionId: "sec-b", id: "sub-9" },
      ],
      base(),
    );
    const moved = draftReducer(start, { type: "MOVE_SUBSECTION", sectionId: "sec-a", id: "sub-2", direction: -1 });
    expect(h3(moved, "sec-a")).toEqual(["sub-2", "sub-1"]);
    expect(h3(moved, "sec-b")).toEqual(["sub-9"]);

    const removed = draftReducer(moved, { type: "REMOVE_SUBSECTION", sectionId: "sec-a", id: "sub-2" });
    expect(h3(removed, "sec-a")).toEqual(["sub-1"]);

    // 다른 H2의 id로는 지워지지 않는다
    expect(draftReducer(removed, { type: "REMOVE_SUBSECTION", sectionId: "sec-b", id: "sub-1" })).toBe(removed);
    expect(draftReducer(removed, { type: "MOVE_SUBSECTION", sectionId: "sec-a", id: "sub-1", direction: 1 })).toBe(removed);
  });

  it("제목과 본문을 고친다", () => {
    const body = doc(p("답변"));
    const state = run(
      [
        { type: "ADD_SUBSECTION", sectionId: "sec-a", id: "sub-1" },
        { type: "UPDATE_SUBSECTION", sectionId: "sec-a", id: "sub-1", patch: { heading: "질문?" } },
        { type: "UPDATE_SUBSECTION", sectionId: "sec-a", id: "sub-1", patch: { body } },
      ],
      base(),
    );
    expect(state.content.sections[0].subsections[0]).toEqual({ id: "sub-1", heading: "질문?", body });
  });
});

describe("바뀌지 않은 부분은 같은 객체로 유지한다", () => {
  it("한 섹션을 고쳐도 다른 섹션 객체는 그대로다", () => {
    const start = run([
      { type: "ADD_SECTION", id: "sec-a" },
      { type: "ADD_SECTION", id: "sec-b" },
      { type: "ADD_SUBSECTION", sectionId: "sec-b", id: "sub-1" },
    ]);
    const next = draftReducer(start, { type: "UPDATE_SECTION", id: "sec-a", patch: { heading: "새 제목" } });
    expect(next).not.toBe(start);
    expect(next.content.sections[1]).toBe(start.content.sections[1]);
    expect(next.content.intro).toBe(start.content.intro);

    const sub = draftReducer(start, {
      type: "UPDATE_SUBSECTION",
      sectionId: "sec-b",
      id: "sub-1",
      patch: { heading: "소제목" },
    });
    expect(sub.content.sections[0]).toBe(start.content.sections[0]);
  });

  it("값이 같으면 상태를 새로 만들지 않는다", () => {
    const start = draft();
    expect(draftReducer(start, { type: "SET_FIELD", field: "title", value: "" })).toBe(start);
    expect(draftReducer(start, { type: "REMOVE_SECTION", id: "nope" })).toBe(start);
  });
});

describe("그 밖의 동작", () => {
  it("필드와 도입부를 바꾸고, REPLACE로 통째로 교체한다", () => {
    const intro = doc(p("도입"));
    const state = run([
      { type: "SET_FIELD", field: "title", value: "제목" },
      { type: "SET_FIELD", field: "tags", value: ["SEO"] },
      { type: "SET_FIELD", field: "featured", value: true },
      { type: "SET_INTRO", body: intro },
    ]);
    expect(state).toMatchObject({ title: "제목", tags: ["SEO"], featured: true });
    expect(state.content.intro).toBe(intro);

    const other = { ...draft(), title: "다른 글" };
    expect(draftReducer(state, { type: "REPLACE", draft: other })).toBe(other);
  });
});

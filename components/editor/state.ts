import type { CategoryId } from "@/constant";
import {
  createSection,
  createSubsection,
  type CoverImage,
  type PostContent,
  type RichText,
  type Section,
  type Subsection,
} from "@/lib/content/types";

/** 에디터가 다루는 글 한 편. 저장할 때 이 모양 그대로 서버로 보낸다. */
export interface EditorDraft {
  id: string;
  slug: string;
  category: CategoryId;
  title: string;
  summary: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  tags: string[];
  coverImage: CoverImage | null;
  featured: boolean;
  content: PostContent;
}

type ScalarField =
  | "slug"
  | "category"
  | "title"
  | "summary"
  | "metaTitle"
  | "metaDescription"
  | "focusKeyword"
  | "tags"
  | "coverImage"
  | "featured";

export type DraftAction =
  | { type: "SET_FIELD"; field: ScalarField; value: EditorDraft[ScalarField] }
  | { type: "SET_INTRO"; body: RichText }
  /** H2 섹션 추가. afterId가 있으면 그 섹션 바로 아래, 없으면 맨 끝. */
  | { type: "ADD_SECTION"; id: string; afterId?: string }
  | { type: "REMOVE_SECTION"; id: string }
  | { type: "MOVE_SECTION"; id: string; direction: -1 | 1 }
  | { type: "UPDATE_SECTION"; id: string; patch: Partial<Pick<Section, "heading" | "kind" | "body">> }
  /** H3 소제목 추가. 항상 특정 H2 섹션 아래에만 만들 수 있다. */
  | { type: "ADD_SUBSECTION"; sectionId: string; id: string; afterId?: string }
  | { type: "REMOVE_SUBSECTION"; sectionId: string; id: string }
  | { type: "MOVE_SUBSECTION"; sectionId: string; id: string; direction: -1 | 1 }
  | {
      type: "UPDATE_SUBSECTION";
      sectionId: string;
      id: string;
      patch: Partial<Pick<Subsection, "heading" | "body">>;
    }
  | { type: "REPLACE"; draft: EditorDraft };

function insertAfter<T extends { id: string }>(list: T[], item: T, afterId?: string): T[] {
  const index = afterId ? list.findIndex((entry) => entry.id === afterId) : -1;
  if (index === -1) return [...list, item];
  return [...list.slice(0, index + 1), item, ...list.slice(index + 1)];
}

function move<T extends { id: string }>(list: T[], id: string, direction: -1 | 1): T[] {
  const from = list.findIndex((entry) => entry.id === id);
  const to = from + direction;
  if (from === -1 || to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}

function withSections(draft: EditorDraft, sections: Section[]): EditorDraft {
  if (sections === draft.content.sections) return draft;
  return { ...draft, content: { ...draft.content, sections } };
}

/** 한 섹션만 바꾸고 나머지 섹션은 같은 객체를 그대로 둔다 (바뀌지 않은 카드는 다시 그리지 않는다). */
function mapSection(
  draft: EditorDraft,
  sectionId: string,
  update: (section: Section) => Section,
): EditorDraft {
  let changed = false;
  const sections = draft.content.sections.map((section) => {
    if (section.id !== sectionId) return section;
    const next = update(section);
    if (next !== section) changed = true;
    return next;
  });
  return changed ? withSections(draft, sections) : draft;
}

/**
 * 글 구조를 바꾸는 순수 함수. 제목 계층은 이 구조로만 만들어진다:
 *   글(H1) → sections(H2) → subsections(H3)
 * 새 블록의 id는 호출하는 쪽(이벤트 핸들러)에서 만들어 넘긴다.
 */
export function draftReducer(draft: EditorDraft, action: DraftAction): EditorDraft {
  switch (action.type) {
    case "SET_FIELD":
      if (draft[action.field] === action.value) return draft;
      return { ...draft, [action.field]: action.value };

    case "SET_INTRO":
      return { ...draft, content: { ...draft.content, intro: action.body } };

    case "ADD_SECTION": {
      if (draft.content.sections.some((section) => section.id === action.id)) return draft;
      return withSections(
        draft,
        insertAfter(draft.content.sections, createSection(action.id), action.afterId),
      );
    }

    case "REMOVE_SECTION": {
      const sections = draft.content.sections.filter((section) => section.id !== action.id);
      return sections.length === draft.content.sections.length ? draft : withSections(draft, sections);
    }

    case "MOVE_SECTION":
      return withSections(draft, move(draft.content.sections, action.id, action.direction));

    case "UPDATE_SECTION":
      return mapSection(draft, action.id, (section) => ({ ...section, ...action.patch }));

    case "ADD_SUBSECTION":
      return mapSection(draft, action.sectionId, (section) => {
        if (section.subsections.some((sub) => sub.id === action.id)) return section;
        return {
          ...section,
          subsections: insertAfter(section.subsections, createSubsection(action.id), action.afterId),
        };
      });

    case "REMOVE_SUBSECTION":
      return mapSection(draft, action.sectionId, (section) => {
        const subsections = section.subsections.filter((sub) => sub.id !== action.id);
        return subsections.length === section.subsections.length ? section : { ...section, subsections };
      });

    case "MOVE_SUBSECTION":
      return mapSection(draft, action.sectionId, (section) => {
        const subsections = move(section.subsections, action.id, action.direction);
        return subsections === section.subsections ? section : { ...section, subsections };
      });

    case "UPDATE_SUBSECTION":
      return mapSection(draft, action.sectionId, (section) => {
        let changed = false;
        const subsections = section.subsections.map((sub) => {
          if (sub.id !== action.id) return sub;
          changed = true;
          return { ...sub, ...action.patch };
        });
        return changed ? { ...section, subsections } : section;
      });

    case "REPLACE":
      return action.draft;
  }
}

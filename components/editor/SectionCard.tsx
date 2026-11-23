"use client";

import { nanoid } from "nanoid";
import { memo, useState, type Dispatch } from "react";
import { isRichTextEmpty } from "@/lib/content/text";
import type { Section, Subsection } from "@/lib/content/types";
import { RichTextEditor } from "./RichTextEditor";
import type { DraftAction } from "./state";

interface MoveButtonsProps {
  index: number;
  count: number;
  label: string;
  onMove: (direction: -1 | 1) => void;
}

function MoveButtons({ index, count, label, onMove }: MoveButtonsProps) {
  return (
    <>
      <button
        type="button"
        className="ed-icon"
        aria-label={`${label} 위로 옮기기`}
        title="위로"
        disabled={index === 0}
        onClick={() => onMove(-1)}
      >
        ↑
      </button>
      <button
        type="button"
        className="ed-icon"
        aria-label={`${label} 아래로 옮기기`}
        title="아래로"
        disabled={index === count - 1}
        onClick={() => onMove(1)}
      >
        ↓
      </button>
    </>
  );
}

/** 내용이 있으면 한 번 더 확인하고 지운다. 비어 있으면 바로 지운다. */
function DeleteButton({ label, needsConfirm, onDelete }: { label: string; needsConfirm: boolean; onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <span className="ed-confirm" role="group" aria-label={`${label} 삭제 확인`}>
        <button type="button" className="ed-btn ed-btn--danger" onClick={onDelete} autoFocus>
          삭제
        </button>
        <button type="button" className="ed-btn" onClick={() => setConfirming(false)}>
          취소
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      className="ed-icon ed-icon--danger"
      aria-label={`${label} 삭제`}
      title="삭제"
      onClick={() => (needsConfirm ? setConfirming(true) : onDelete())}
    >
      ✕
    </button>
  );
}

interface SubsectionCardProps {
  sectionId: string;
  subsection: Subsection;
  index: number;
  count: number;
  faq: boolean;
  epoch: number;
  dispatch: Dispatch<DraftAction>;
}

/** H3 소제목 블록. 항상 H2 섹션 카드 안에만 놓인다. */
const SubsectionCard = memo(function SubsectionCard({
  sectionId,
  subsection,
  index,
  count,
  faq,
  epoch,
  dispatch,
}: SubsectionCardProps) {
  const label = `H3 소제목 ${index + 1}`;
  const hasContent = Boolean(subsection.heading.trim()) || !isRichTextEmpty(subsection.body);

  return (
    <div className="ed-block ed-block--h3" data-block-id={subsection.id}>
      <div className="ed-block__head">
        <span className="ed-badge ed-badge--h3">H3</span>
        <input
          className="ed-block__heading"
          data-heading-id={subsection.id}
          value={subsection.heading}
          placeholder={faq ? "질문 (H3)" : "소제목 (H3)"}
          aria-label={`${label} 제목`}
          onChange={(event) =>
            dispatch({
              type: "UPDATE_SUBSECTION",
              sectionId,
              id: subsection.id,
              patch: { heading: event.target.value },
            })
          }
        />
        <div className="ed-block__tools">
          <MoveButtons
            index={index}
            count={count}
            label={label}
            onMove={(direction) =>
              dispatch({ type: "MOVE_SUBSECTION", sectionId, id: subsection.id, direction })
            }
          />
          <DeleteButton
            label={label}
            needsConfirm={hasContent}
            onDelete={() => dispatch({ type: "REMOVE_SUBSECTION", sectionId, id: subsection.id })}
          />
        </div>
      </div>
      <RichTextEditor
        key={epoch}
        initialContent={subsection.body}
        placeholder={faq ? "답변을 두세 문장으로 바로 적습니다." : "소제목 본문"}
        label={`${label} 본문`}
        onChange={(body) =>
          dispatch({ type: "UPDATE_SUBSECTION", sectionId, id: subsection.id, patch: { body } })
        }
      />
    </div>
  );
});

interface SectionCardProps {
  section: Section;
  index: number;
  count: number;
  /** 백업 복원 등으로 본문 에디터를 새로 만들어야 할 때 바뀌는 값 */
  epoch: number;
  dispatch: Dispatch<DraftAction>;
  /** 새로 만든 블록의 제목 입력 칸으로 초점을 옮긴다 */
  requestFocus: (id: string) => void;
}

/**
 * H2 섹션 카드: 제목 입력 + 본문 에디터 + 그 아래 H3 소제목 목록.
 * H3는 이 카드 안에서만 추가·삭제할 수 있으므로 H2 없이 H3가 생기지 않는다.
 */
export const SectionCard = memo(function SectionCard({
  section,
  index,
  count,
  epoch,
  dispatch,
  requestFocus,
}: SectionCardProps) {
  const label = `H2 섹션 ${index + 1}`;
  const faq = section.kind === "faq";
  const hasContent =
    Boolean(section.heading.trim()) ||
    !isRichTextEmpty(section.body) ||
    section.subsections.length > 0;

  const addSubsection = () => {
    const id = nanoid(10);
    dispatch({ type: "ADD_SUBSECTION", sectionId: section.id, id });
    requestFocus(id);
  };

  return (
    <section className="ed-block ed-block--h2" data-block-id={section.id} data-kind={section.kind}>
      <div className="ed-block__head">
        <span className="ed-badge ed-badge--h2">H2</span>
        <input
          className="ed-block__heading"
          data-heading-id={section.id}
          value={section.heading}
          placeholder={faq ? "자주 묻는 질문 (H2)" : "섹션 제목 (H2) — 질문으로 쓰면 답변 엔진에 유리합니다"}
          aria-label={`${label} 제목`}
          onChange={(event) =>
            dispatch({ type: "UPDATE_SECTION", id: section.id, patch: { heading: event.target.value } })
          }
        />
        <div className="ed-block__tools">
          {/* Toggle: FAQ로 표시하면 H3 = 질문, 본문 = 답변으로 보고 FAQPage 구조화 데이터를 함께 출력한다 */}
          <label className="ed-switch" title="H3를 질문, 그 본문을 답변으로 표시합니다">
            <input
              type="checkbox"
              role="switch"
              checked={faq}
              onChange={(event) =>
                dispatch({
                  type: "UPDATE_SECTION",
                  id: section.id,
                  patch: { kind: event.target.checked ? "faq" : "default" },
                })
              }
            />
            <span className="ed-switch__track" aria-hidden="true" />
            FAQ
          </label>
          <MoveButtons
            index={index}
            count={count}
            label={label}
            onMove={(direction) => dispatch({ type: "MOVE_SECTION", id: section.id, direction })}
          />
          <DeleteButton
            label={label}
            needsConfirm={hasContent}
            onDelete={() => dispatch({ type: "REMOVE_SECTION", id: section.id })}
          />
        </div>
      </div>

      <RichTextEditor
        key={epoch}
        initialContent={section.body}
        placeholder={
          faq
            ? "FAQ 소개 문장 (선택). 질문은 아래에서 H3로 추가합니다."
            : "첫 문단에서 제목의 질문에 바로 답하세요."
        }
        label={`${label} 본문`}
        onChange={(body) => dispatch({ type: "UPDATE_SECTION", id: section.id, patch: { body } })}
      />

      <div className="ed-subs">
        {section.subsections.map((subsection, subIndex) => (
          <SubsectionCard
            key={subsection.id}
            sectionId={section.id}
            subsection={subsection}
            index={subIndex}
            count={section.subsections.length}
            faq={faq}
            epoch={epoch}
            dispatch={dispatch}
          />
        ))}
        <button type="button" className="ed-add ed-add--h3" onClick={addSubsection}>
          <span aria-hidden="true">+</span> {faq ? "질문(H3) 추가" : "H3 소제목 추가"}
        </button>
      </div>
    </section>
  );
});

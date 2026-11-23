import type { ReactNode } from "react";

export interface AccordionItem {
  question: string;
  answer: ReactNode;
}

/**
 * Accordion: 제목을 누르면 내용이 아래로 펼쳐지고 다시 접힌다.
 * 브라우저 기본 <details>를 쓰므로 자바스크립트 없이 동작하고 키보드·화면 낭독기를 그대로 지원한다.
 * 같은 name을 가진 항목은 하나만 열린다.
 */
export function Accordion({
  items,
  name,
  className,
  as: Heading = "h3",
}: {
  items: readonly AccordionItem[];
  name: string;
  className?: string;
  as?: "h3" | "h4";
}) {
  return (
    <div className={className ? `accordion ${className}` : "accordion"}>
      {items.map((item, index) => (
        <details key={index} className="accordion__item" name={name}>
          <summary className="accordion__summary">
            <Heading className="accordion__question">{item.question}</Heading>
            <span className="accordion__icon" aria-hidden="true" />
          </summary>
          <div className="accordion__answer">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}

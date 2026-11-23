"use client";

import { SEO_GROUP_LABELS, type SeoCheck, type SeoGroup, type SeoReport } from "@/lib/seo/analyze";

const GROUP_ORDER: SeoGroup[] = ["structure", "meta", "keyword", "content", "aeo"];

function tone(score: number): "good" | "fair" | "poor" {
  return score >= 80 ? "good" : score >= 55 ? "fair" : "poor";
}

/** Progress ring: 동그란 링이 점수만큼 차오른다 */
export function ScoreRing({ score, size = 64 }: { score: number; size?: number }) {
  const radius = 26;
  const length = 2 * Math.PI * radius;
  return (
    <span className="ed-ring" data-tone={tone(score)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <circle cx="32" cy="32" r={radius} className="ed-ring__track" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          className="ed-ring__value"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - score / 100)}
        />
      </svg>
      <span className="ed-ring__label">{score}</span>
    </span>
  );
}

function CheckIcon({ check }: { check: SeoCheck }) {
  if (check.status === "pass") {
    // Checkbox draw: 체크 표시가 선을 따라 그려진다
    return (
      <svg className="ed-check__icon ed-check__icon--pass" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="9" />
        <path d="M5.8 10.4l2.8 2.8 5.6-6" pathLength={1} />
      </svg>
    );
  }
  const symbol = check.severity === "error" ? "✕" : check.severity === "warning" ? "!" : "i";
  return (
    <span className={`ed-check__icon ed-check__icon--${check.severity}`} aria-hidden="true">
      {symbol}
    </span>
  );
}

const STATUS_TEXT: Record<string, string> = {
  pass: "통과",
  error: "오류",
  warning: "권고",
  info: "제안",
};

interface SeoPanelProps {
  report: SeoReport;
  /** 문제가 있는 섹션으로 편집 화면을 옮긴다 */
  onJump: (blockId: string) => void;
}

/**
 * SEO 점검 목록. 오류(✕)만 발행을 막고, 권고(!)는 점수에만 반영되며, 제안(i)은 점수와 무관하다.
 */
export function SeoPanel({ report, onJump }: SeoPanelProps) {
  return (
    <div className="ed-seo">
      <div className="ed-seo__summary">
        <ScoreRing score={report.score} size={76} />
        <div>
          <p className="ed-seo__headline">
            {report.errors.length > 0
              ? `발행 전에 고칠 오류 ${report.errors.length}건`
              : report.warnings.length > 0
                ? `발행할 수 있습니다 · 권고 ${report.warnings.length}건`
                : "모든 점검을 통과했습니다"}
          </p>
          <p className="ed-seo__stats">
            본문 {report.stats.chars.toLocaleString("ko-KR")}자 · 읽는 시간 {report.stats.readingMinutes}분 · H2{" "}
            {report.stats.h2}개 · H3 {report.stats.h3}개 · 내부 링크 {report.stats.internalLinks} · 외부 링크{" "}
            {report.stats.externalLinks}
          </p>
        </div>
      </div>

      {GROUP_ORDER.map((group) => {
        const checks = report.checks.filter((check) => check.group === group);
        if (checks.length === 0) return null;
        return (
          <section key={group} className="ed-seo__group" aria-label={SEO_GROUP_LABELS[group]}>
            <h3>{SEO_GROUP_LABELS[group]}</h3>
            <ul>
              {checks.map((check) => (
                <li
                  key={check.id}
                  className="ed-check"
                  data-status={check.status === "pass" ? "pass" : check.severity}
                >
                  <CheckIcon check={check} />
                  <p>
                    <span className="visually-hidden">
                      {STATUS_TEXT[check.status === "pass" ? "pass" : check.severity]}:{" "}
                    </span>
                    {check.message}
                  </p>
                  {check.targets && check.targets.length > 0 && (
                    <button type="button" className="ed-link" onClick={() => onJump(check.targets![0])}>
                      이동
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

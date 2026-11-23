import type { CSSProperties, ReactNode } from "react";
import { getCategory, type CategoryId } from "@/constant";
import type { PostCard } from "@/lib/posts/types";

function sparkle(cx: number, cy: number, r: number, k = 0.16): string {
  const d = r * k;
  return [
    `M${cx} ${cy - r}`,
    `Q${cx + d} ${cy - d} ${cx + r} ${cy}`,
    `Q${cx + d} ${cy + d} ${cx} ${cy + r}`,
    `Q${cx - d} ${cy + d} ${cx - r} ${cy}`,
    `Q${cx - d} ${cy - d} ${cx} ${cy - r}Z`,
  ].join("");
}

const tintA: CSSProperties = { fill: "var(--cat-a)" };
const tintB: CSSProperties = { fill: "var(--cat-b)" };

/** 카테고리별 추상 그래픽 (400×300 기준, 커버 비율에 맞춰 잘린다) */
const ART: Record<CategoryId, ReactNode> = {
  seo: (
    <>
      <circle cx="84" cy="270" r="136" fill="#fff" fillOpacity=".09" />
      <circle cx="252" cy="126" r="82" fill="none" stroke="#fff" strokeOpacity=".94" strokeWidth="14" />
      <circle cx="252" cy="126" r="46" fill="#fff" fillOpacity=".2" />
      <path d="M312 186l54 54" stroke="#fff" strokeOpacity=".94" strokeWidth="16" strokeLinecap="round" />
    </>
  ),
  geo: (
    <>
      <circle cx="330" cy="40" r="120" fill="#fff" fillOpacity=".08" />
      <path d={sparkle(248, 142, 98)} fill="#fff" fillOpacity=".95" />
      <path d={sparkle(132, 86, 36)} fill="#fff" fillOpacity=".7" />
      <path d={sparkle(146, 218, 22)} fill="#fff" fillOpacity=".5" />
    </>
  ),
  aeo: (
    <>
      <circle cx="70" cy="40" r="110" fill="#fff" fillOpacity=".08" />
      <rect x="52" y="152" width="124" height="84" rx="26" fill="#fff" fillOpacity=".24" />
      <rect x="140" y="56" width="206" height="134" rx="36" fill="#fff" fillOpacity=".95" />
      <path d="M196 184l-20 44 58-44z" fill="#fff" fillOpacity=".95" />
      <circle cx="203" cy="123" r="11" style={tintA} />
      <circle cx="243" cy="123" r="11" style={tintA} fillOpacity=".7" />
      <circle cx="283" cy="123" r="11" style={tintB} fillOpacity=".8" />
    </>
  ),
  "ux-ui": (
    <>
      <circle cx="350" cy="280" r="120" fill="#fff" fillOpacity=".08" />
      <rect x="160" y="50" width="184" height="128" rx="22" fill="#fff" fillOpacity=".2" />
      <rect x="116" y="84" width="184" height="128" rx="22" fill="#fff" fillOpacity=".42" />
      <rect x="72" y="118" width="184" height="128" rx="22" fill="#fff" fillOpacity=".96" />
      <rect x="94" y="142" width="72" height="12" rx="6" style={tintA} />
      <rect x="94" y="168" width="124" height="8" rx="4" fill="#000" fillOpacity=".12" />
      <rect x="94" y="186" width="98" height="8" rx="4" fill="#000" fillOpacity=".12" />
      <rect x="94" y="210" width="58" height="20" rx="10" style={tintB} />
    </>
  ),
  dev: (
    <>
      <circle cx="60" cy="270" r="126" fill="#fff" fillOpacity=".07" />
      <rect x="84" y="56" width="248" height="176" rx="22" fill="#fff" fillOpacity=".95" />
      <circle cx="110" cy="82" r="7" fill="#000" fillOpacity=".16" />
      <circle cx="132" cy="82" r="7" fill="#000" fillOpacity=".16" />
      <circle cx="154" cy="82" r="7" fill="#000" fillOpacity=".16" />
      <path
        d="M134 130l-26 22 26 22M186 130l26 22-26 22"
        fill="none"
        stroke="#3a3a3c"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="232" y="146" width="72" height="10" rx="5" fill="#000" fillOpacity=".14" />
      <rect x="108" y="196" width="150" height="10" rx="5" fill="#000" fillOpacity=".1" />
    </>
  ),
};

function variantOf(seed: string): number {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + (char.codePointAt(0) ?? 0)) >>> 0;
  return hash % 3;
}

interface PostCoverProps {
  post: Pick<PostCard, "id" | "slug" | "category" | "cover" | "title">;
  className?: string;
  /** 첫 화면의 큰 이미지(LCP 후보)는 지연 로딩하지 않는다. */
  priority?: boolean;
  /** 카테고리 라벨을 그림 안에 표시할지 */
  label?: boolean;
}

/**
 * 글의 대표 이미지. 업로드한 이미지가 없으면 카테고리 색의 그래픽을 그린다.
 * 그래픽은 장식이므로 보조 기술에서는 숨긴다.
 */
export function PostCover({ post, className, priority = false, label = true }: PostCoverProps) {
  const classes = (name: string) => (className ? `${name} ${className}` : name);

  if (post.cover) {
    return (
      <span className={classes("cover cover--image")}>
        {/* eslint-disable-next-line @next/next/no-img-element -- 업로드 시 이미 WebP로 최적화한다 */}
        <img
          src={post.cover.src}
          alt={post.cover.alt}
          width={post.cover.width}
          height={post.cover.height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          decoding="async"
        />
      </span>
    );
  }

  return (
    <span
      className={classes("cover")}
      data-cat={post.category}
      data-v={variantOf(post.slug || post.id)}
      aria-hidden="true"
    >
      <svg
        className="cover__art"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        {ART[post.category]}
      </svg>
      {label && <span className="cover__label">{getCategory(post.category).label}</span>}
    </span>
  );
}

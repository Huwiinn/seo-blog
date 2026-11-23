"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { deletePost } from "@/app/admin/actions";
import { getCategory, type CategoryId } from "@/constant";
import { formatDateDots } from "@/lib/format";
import type { PostStatus } from "@/lib/content/types";

export interface PostListItem {
  id: string;
  title: string;
  slug: string | null;
  status: PostStatus;
  category: CategoryId;
  updatedAt: string;
  sample: boolean;
}

/** 글 목록. 삭제는 확인창(Modal scale-in)을 거친다. */
export function PostList({ items }: { items: PostListItem[] }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [target, setTarget] = useState<PostListItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const ask = (item: PostListItem) => {
    setTarget(item);
    setError(null);
    dialogRef.current?.showModal();
  };

  const close = () => dialogRef.current?.close();

  const confirm = () => {
    if (!target) return;
    startTransition(async () => {
      const result = await deletePost(target.id);
      if (!result.ok) {
        setError(result.errors.join(" "));
        return;
      }
      window.localStorage.removeItem(`seo-blog:draft:${target.id}`);
      close();
      router.refresh();
    });
  };

  if (items.length === 0) {
    return <p className="ed-empty">아직 글이 없습니다. 새 글 쓰기로 시작해 보세요.</p>;
  }

  return (
    <>
      <ul className="ed-list">
        {items.map((item) => (
          <li key={item.id} className="ed-list__row">
            <span className="ed-pill" data-status={item.status}>
              {item.status === "published" ? "발행됨" : "초안"}
            </span>
            <div className="ed-list__main">
              <Link href={`/admin/posts/${item.id}`} className="ed-list__title">
                {item.title || "(제목 없음)"}
              </Link>
              <p className="ed-list__meta">
                {getCategory(item.category).label} · {item.slug ? `/posts/${item.slug}` : "슬러그 없음"} ·{" "}
                {formatDateDots(item.updatedAt)} 저장{item.sample ? " · 샘플 글" : ""}
              </p>
            </div>
            <div className="ed-list__actions">
              {item.status === "published" && item.slug && (
                <Link href={`/posts/${item.slug}`} className="ed-btn" target="_blank">
                  보기
                </Link>
              )}
              <Link href={`/admin/posts/${item.id}`} className="ed-btn">
                편집
              </Link>
              <button type="button" className="ed-btn ed-btn--quiet-danger" onClick={() => ask(item)}>
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>

      <dialog ref={dialogRef} className="ed-dialog" aria-labelledby="ed-dialog-title" onClose={() => setTarget(null)}>
        <h2 id="ed-dialog-title">이 글을 삭제할까요?</h2>
        <p>
          <strong>{target?.title || "(제목 없음)"}</strong>
          {target?.status === "published" ? " — 발행한 글입니다. 삭제하고 배포하면 주소가 404가 됩니다." : ""}
        </p>
        <p className="ed-dialog__note">삭제한 글은 되돌릴 수 없습니다.</p>
        {error && (
          <p className="ed-dialog__error" role="alert">
            {error}
          </p>
        )}
        <div className="ed-dialog__actions">
          <button type="button" className="ed-btn" onClick={close} autoFocus>
            취소
          </button>
          <button type="button" className="ed-btn ed-btn--danger" disabled={pending} onClick={confirm}>
            {pending ? "삭제하는 중…" : "삭제"}
          </button>
        </div>
      </dialog>
    </>
  );
}

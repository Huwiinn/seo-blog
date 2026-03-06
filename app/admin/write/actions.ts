"use server";

import { supabaseAdmin } from "@/lib/supabase";
import { redirect } from "next/navigation";

export type PostFormState = {
  error?: string;
  success?: boolean;
};

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function createPost(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const href = formData.get("href") as string;
  const summary = formData.get("summary") as string;
  const content = formData.get("content") as string;
  const tagsRaw = formData.get("tags") as string;
  const featured = formData.get("featured") === "on";

  if (!title || !category || !summary || !content) {
    return { error: "제목, 카테고리, 요약, 본문은 필수입니다." };
  }

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const slug = toSlug(title);
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, ".");

  const { error } = await supabaseAdmin.from("posts").insert({
    title,
    slug,
    category,
    href,
    summary,
    content,
    tags,
    featured,
    published: true,
    date,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/admin/write?success=true");
}

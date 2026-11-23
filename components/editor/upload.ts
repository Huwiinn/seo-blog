export interface UploadedImage {
  src: string;
  width: number;
  height: number;
}

/** 이미지를 /admin/upload로 올린다. 서버에서 WebP 변환·리사이즈·EXIF 제거를 한다. */
export async function uploadImage(file: File): Promise<UploadedImage> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/admin/upload", { method: "POST", body });
  const result = (await response.json().catch(() => null)) as
    | (Partial<UploadedImage> & { error?: string })
    | null;
  if (!response.ok || !result?.src || !result.width || !result.height) {
    throw new Error(result?.error ?? "이미지를 올리지 못했습니다.");
  }
  return { src: result.src, width: result.width, height: result.height };
}

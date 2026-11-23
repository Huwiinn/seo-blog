import { nanoid } from "nanoid";
import fs from "node:fs/promises";
import path from "node:path";
import { isEditorEnabled } from "@/lib/env";

const MAX_BYTES = 15 * 1024 * 1024;
const MAX_WIDTH = 1600;
const ALLOWED = /^image\/(jpeg|png|webp|avif|gif)$/;

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

/**
 * 이미지 업로드 (에디터 전용, 로컬 개발 서버에서만 동작).
 * 최대 폭 1600px로 줄이고 WebP로 바꾸며, 촬영 위치 같은 메타데이터(EXIF)를 지운다.
 * 결과는 public/uploads/연/월/ 아래에 저장되고, DB와 함께 git에 커밋한다.
 */
export async function POST(request: Request) {
  if (!isEditorEnabled()) return new Response("Not Found", { status: 404 });

  // 다른 사이트가 localhost로 보내는 요청을 막는다.
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host || new URL(origin).host !== host) {
    return json({ error: "허용되지 않는 요청입니다." }, 403);
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return json({ error: "이미지 파일을 선택하세요." }, 400);
  if (!ALLOWED.test(file.type)) {
    return json({ error: "JPEG, PNG, WebP, AVIF, GIF 이미지만 올릴 수 있습니다." }, 415);
  }
  if (file.size > MAX_BYTES) return json({ error: "이미지는 15MB 이하여야 합니다." }, 413);

  try {
    const { default: sharp } = await import("sharp");
    const { data, info } = await sharp(Buffer.from(await file.arrayBuffer()), { failOn: "error" })
      .rotate() // EXIF 방향을 실제 픽셀에 반영한 뒤 메타데이터는 버린다
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    const now = new Date();
    const folder = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
    const name = `${nanoid(12)}.webp`;
    // turbopackIgnore: 올린 이미지는 정적 파일로 배포된다. 서버 함수 묶음에 넣을 필요가 없다.
    const directory = path.join(/* turbopackIgnore: true */ process.cwd(), "public", "uploads", folder);
    await fs.mkdir(/* turbopackIgnore: true */ directory, { recursive: true });
    await fs.writeFile(/* turbopackIgnore: true */ path.join(directory, name), data);

    return json({ src: `/uploads/${folder}/${name}`, width: info.width, height: info.height });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return json({ error: `이미지를 처리하지 못했습니다: ${reason}` }, 422);
  }
}

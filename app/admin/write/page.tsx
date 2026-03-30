import { Suspense } from "react";
import WriteForm from "./WriteForm";
import SuccessBanner from "./SuccessBanner";

export const metadata = {
  title: "콘텐츠 작성 | SEO Hi",
  robots: { index: false, follow: false },
};

export default function WritePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">콘텐츠 작성</h1>
        <p className="mt-1 text-sm text-muted">새 콘텐츠를 작성하고 발행합니다.</p>
      </div>

      <Suspense>
        <SuccessBanner />
      </Suspense>

      <div className="rounded-xl border border-[var(--color-border,#e5e7eb)] bg-white p-6 shadow-sm">
        <WriteForm />
      </div>
    </main>
  );
}

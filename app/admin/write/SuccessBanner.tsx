"use client";

import { useSearchParams } from "next/navigation";

export default function SuccessBanner() {
  const params = useSearchParams();
  if (params.get("success") !== "true") return null;

  return (
    <div className="mb-6 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
      콘텐츠가 성공적으로 발행되었습니다.
    </div>
  );
}

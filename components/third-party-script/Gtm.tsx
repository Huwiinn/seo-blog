import { GoogleTagManager } from "@next/third-parties/google";

export default function Gtm({ id }: { id: string }) {
  return <GoogleTagManager gtmId={id} />;
}

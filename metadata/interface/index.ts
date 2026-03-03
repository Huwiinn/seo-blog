export type StaticMetaDataProps = {
  title?: string;
  description?: string;
  robots?: boolean;
  routePath?: string;
  image?: string;
  width?: number;
  height?: number;
  path: string;
  canonical?: string;
};

export interface IDynamicMetadataObjProps {
  title: string;
  description: string;
  robots: boolean;
  path: string;
  canonical?: string;
  /** When set, used for openGraph and twitter title only; browser tab uses `title`. */
  openGraphTitle?: string;
}

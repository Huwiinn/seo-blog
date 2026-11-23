export interface PageMetaInput {
  /** 사이트명을 제외한 페이지 제목. title.template으로 " | 사이트명"이 붙는다. */
  title: string;
  /** true면 template을 쓰지 않고 title을 그대로 <title>에 넣는다. */
  absoluteTitle?: boolean;
  description: string;
  /** canonical·og:url에 쓰는 경로 (예: "/posts/what-is-geo") */
  path: string;
  image?: { url: string; width: number; height: number; alt?: string };
  noindex?: boolean;
  /** 글 페이지 전용 Open Graph 정보 */
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
  };
}

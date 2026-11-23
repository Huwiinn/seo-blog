import type { DesignId, DesignLinks } from "./types";

/** 운영 사이트 주소 */
export const siteLinks: DesignLinks = {
  home: "/",
  posts: "/posts",
  category: (id) => `/${id}`,
  post: (slug) => `/posts/${slug}`,
};

/** 시안 갤러리 안에서는 같은 시안 안에서만 이동한다. */
export function galleryLinks(design: DesignId): DesignLinks {
  const base = `/designs/${design}`;
  return {
    home: base,
    posts: `${base}/posts`,
    category: (id) => `${base}/category/${id}`,
    post: (slug) => `${base}/posts/${slug}`,
  };
}

/** 에디터 미리보기: 페이지를 떠나지 않는다 (목차 같은 #앵커 링크만 동작). */
export const previewLinks: DesignLinks = {
  home: "#",
  posts: "#",
  category: () => "#",
  post: () => "#",
};

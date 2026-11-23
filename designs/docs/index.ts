import "./styles.css";

import type { DesignTheme } from "../types";
import { Article } from "./Article";
import { Home } from "./Home";
import { Listing } from "./Listing";
import { Shell } from "./Shell";

const docs: DesignTheme = {
  id: "docs",
  name: "C. Docs",
  reference: "Apple Developer 문서 · Human Interface Guidelines",
  description:
    "왼쪽 탐색 사이드바와 오른쪽 '이 페이지에서' 목차를 둔 문서형. 글이 쌓일수록 지식 베이스처럼 찾아 읽기 좋습니다.",
  Shell,
  Home,
  Listing,
  Article,
};

export default docs;

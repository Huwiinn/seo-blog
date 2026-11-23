import "./styles.css";

import type { DesignTheme } from "../types";
import { Article } from "./Article";
import { Home } from "./Home";
import { Listing } from "./Listing";
import { Shell } from "./Shell";

const newsroom: DesignTheme = {
  id: "newsroom",
  name: "A. Newsroom",
  reference: "Apple Newsroom",
  description:
    "흰 배경 위에 큰 대표 글과 타일 그리드를 배치한 에디토리얼형. 글 상세는 가운데 한 칼럼으로 읽기에 집중합니다.",
  Shell,
  Home,
  Listing,
  Article,
};

export default newsroom;

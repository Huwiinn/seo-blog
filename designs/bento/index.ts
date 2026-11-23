import "./styles.css";

import type { DesignTheme } from "../types";
import { Article } from "./Article";
import { Home } from "./Home";
import { Listing } from "./Listing";
import { Shell } from "./Shell";

const bento: DesignTheme = {
  id: "bento",
  name: "D. Bento",
  reference: "Apple 이벤트·제품 하이라이트의 벤토 그리드",
  description:
    "밝은 회색 바탕에 크기가 다른 둥근 카드를 격자로 배치한 벤토형. 추천 글·통계·주제를 한 화면에 요약하고, 글 상세는 섹션마다 카드로 나뉩니다.",
  Shell,
  Home,
  Listing,
  Article,
};

export default bento;

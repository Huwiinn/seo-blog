import "./styles.css";

import type { DesignTheme } from "../types";
import { Article } from "./Article";
import { Home } from "./Home";
import { Listing } from "./Listing";
import { Shell } from "./Shell";

const pro: DesignTheme = {
  id: "pro",
  name: "B. Pro",
  reference: "Apple 제품 페이지 (Pro 라인)",
  description:
    "검정 배경에 큰 그라데이션 헤드라인을 쓰는 다크 시네마틱형. 주제별 챕터와 가로로 넘기는 하이라이트, 어두운 읽기 화면이 특징입니다.",
  Shell,
  Home,
  Listing,
  Article,
};

export default pro;

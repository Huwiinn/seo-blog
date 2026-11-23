import "./styles.css";

import type { DesignTheme } from "../types";
import { Article } from "./Article";
import { Home } from "./Home";
import { Listing } from "./Listing";
import { Shell } from "./Shell";

const glass: DesignTheme = {
  id: "glass",
  name: "E. Liquid Glass",
  reference: "iOS 26 · visionOS의 유리 머티리얼",
  description:
    "부드러운 색 배경 위에 반투명 유리 패널을 띄운 형태. 떠 있는 알약 내비게이션과 모바일 하단 메뉴바, 유리 시트 위의 본문이 특징입니다.",
  Shell,
  Home,
  Listing,
  Article,
};

export default glass;

/**
 * 운영 사이트에 적용할 시안. 이 한 줄만 바꾸면 홈·목록·글 상세가 모두 바뀐다.
 *
 *   ./newsroom  A. 에디토리얼    ./pro    B. 다크 시네마틱    ./docs  C. 문서형
 *   ./bento     D. 벤토 그리드   ./glass  E. 리퀴드 글래스
 *
 * 정적 import이므로 운영 페이지에는 고른 시안의 CSS만 포함된다.
 */
export { default } from "./docs";

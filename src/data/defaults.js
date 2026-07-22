// 지출 분류 5색 — 데모 시리즈 공통 팔레트
export const CATS = [
  { id: "meal", name: "식비", color: "#E4574B" },
  { id: "transport", name: "교통", color: "#4E8FD9" },
  { id: "office", name: "사무용품", color: "#57A867" },
  { id: "social", name: "접대·경조", color: "#D96BA0" },
  { id: "etc", name: "기타", color: "#E8B93E" },
];

export const CAT_BY_ID = Object.fromEntries(CATS.map((c) => [c.id, c]));

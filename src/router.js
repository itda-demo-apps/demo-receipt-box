// 경량 라우터 — 의존성 없이 history API. URL로 화면을 복원한다.
// 경로 체계:
//   /                목록(홈)
//   /new             신규 등록(pendingBlob은 메모리 — 새로고침 시 사진만 사라짐)
//   /edit/:recordId  기존 레코드 편집(localStorage — 새로고침 복원, 없는 id는 홈)
//   /stats           집계
//   /contact         문의
import { useEffect, useState } from "react";

// 현재 위치 → { view, recordId?, isNew? }
export function parseLocation(loc = window.location) {
  const path = (loc.pathname || "/").replace(/\/+$/, "") || "/";
  if (path === "/stats") return { view: "stats" };
  if (path === "/contact") return { view: "contact" };
  if (path === "/new") return { view: "edit", recordId: null, isNew: true };
  const m = path.match(/^\/edit\/([^/]+)$/);
  if (m) return { view: "edit", recordId: decodeURIComponent(m[1]), isNew: false };
  return { view: "home" }; // "/" 및 알 수 없는 경로 → 홈
}

const listeners = new Set();
function emit() {
  const r = parseLocation();
  listeners.forEach((fn) => fn(r));
}

// 경로 이동 — 기본 pushState, replace 옵션 시 replaceState. 이후 구독자에 통지.
export function navigate(path, { replace = false } = {}) {
  if (replace) window.history.replaceState(null, "", path);
  else window.history.pushState(null, "", path);
  emit();
}

if (typeof window !== "undefined") {
  window.addEventListener("popstate", emit); // 뒤로/앞으로
}

// 현재 라우트 구독 훅
export function useRoute() {
  const [route, setRoute] = useState(() => parseLocation());
  useEffect(() => {
    listeners.add(setRoute);
    return () => listeners.delete(setRoute);
  }, []);
  return route;
}

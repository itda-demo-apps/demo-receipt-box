// 영수증 사진 저장소 — IndexedDB (localStorage는 5MB 한계라 이미지는 여기에)
// 레코드 메타(금액·분류 등)는 storage.js(localStorage), 사진 blob만 이 모듈이 담당한다.
const DB_NAME = "receipt-box";
const STORE = "images";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const imageDB = {
  put: (id, blob) => tx("readwrite", (s) => s.put(blob, id)),
  get: (id) => tx("readonly", (s) => s.get(id)),
  delete: (id) => tx("readwrite", (s) => s.delete(id)),
};

// 업로드 사진을 긴 변 1200px·JPEG로 축소 — 수백 KB 수준으로 보관
export async function resizeImage(file, maxSize = 1200) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
}

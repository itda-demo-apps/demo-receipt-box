// 영수증 레코드 유틸 — 메타데이터는 localStorage 단일 키, 사진은 imageDB(IndexedDB)
import { storage } from "./storage";
import { imageDB } from "./db";

export const APP_KEY = "receipt-app-v1"; // {records: [...]} — 키를 쪼개지 말 것
const LIMIT = 1000;

// record: {id, date(YYYY-MM-DD), store, amount(원), cat, memo, hasImage, ts(등록시각)}

export async function loadRecords() {
  try {
    const saved = await storage.get(APP_KEY);
    if (!saved) return [];
    const data = JSON.parse(saved.value);
    return Array.isArray(data.records) ? data.records : [];
  } catch {
    return [];
  }
}

async function save(records) {
  await storage.set(APP_KEY, JSON.stringify({ records: records.slice(0, LIMIT) }));
  return records;
}

export async function addRecord(partial) {
  const records = await loadRecords();
  const rec = {
    id: `r${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    date: new Date().toISOString().slice(0, 10),
    store: "",
    amount: 0,
    cat: "meal",
    memo: "",
    hasImage: false,
    ts: Date.now(),
    ...partial,
  };
  return { records: await save([rec, ...records]), rec };
}

export async function updateRecord(id, patch) {
  const records = await loadRecords();
  return save(records.map((r) => (r.id === id ? { ...r, ...patch } : r)));
}

export async function removeRecord(id) {
  const records = await loadRecords();
  await imageDB.delete(id).catch(() => {});
  return save(records.filter((r) => r.id !== id));
}

// 월(YYYY-MM)별 필터 + 분류별 합계
export function monthOf(r) {
  return (r.date || "").slice(0, 7);
}

export function summarize(records, month) {
  const inMonth = records.filter((r) => monthOf(r) === month);
  const byCat = {};
  let total = 0;
  for (const r of inMonth) {
    const amt = Number(r.amount) || 0;
    byCat[r.cat] = (byCat[r.cat] || 0) + amt;
    total += amt;
  }
  return { inMonth, byCat, total };
}

export function fmtWon(n) {
  return (Number(n) || 0).toLocaleString("ko-KR") + "원";
}

// CSV 내보내기 — 엑셀 한글 호환을 위해 BOM 포함
export function exportCSV(records, catName) {
  const rows = [
    ["날짜", "상호", "금액", "분류", "메모"],
    ...records.map((r) => [r.date, r.store, r.amount, catName(r.cat), r.memo]),
  ];
  const csv = rows
    .map((row) => row.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\r\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `영수증정리_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

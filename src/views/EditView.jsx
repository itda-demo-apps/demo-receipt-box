import { useState } from "react";

import Header from "../components/Header";
import Thumb from "../components/Thumb";
import { CATS } from "../data/defaults";
import { imageDB } from "../db";
import { readReceipt } from "../ai";

export default function EditView({ view, setView, record, hasAI, patchRecord, deleteRecord }) {
  const [form, setForm] = useState({
    date: record.date,
    store: record.store,
    amount: record.amount || "",
    cat: record.cat,
    memo: record.memo,
  });
  const [aiState, setAiState] = useState("idle"); // idle | running | done | error
  const [saved, setSaved] = useState(false);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  };

  const save = async () => {
    await patchRecord(record.id, { ...form, amount: Number(form.amount) || 0 });
    setSaved(true);
  };

  const remove = () => {
    if (window.confirm("이 영수증을 삭제할까요? 사진도 함께 지워져요.")) deleteRecord(record.id);
  };

  // AI로 읽기 — 온디바이스 멀티모달로 사진에서 날짜·상호·금액·분류 추출 후 폼 프리필
  const aiRead = async () => {
    setAiState("running");
    try {
      const blob = await imageDB.get(record.id);
      const out = await readReceipt(blob);
      setForm((f) => ({
        ...f,
        date: out.date || f.date,
        store: out.store || f.store,
        amount: out.amount || f.amount,
        cat: CATS.some((c) => c.id === out.cat) ? out.cat : f.cat,
      }));
      setAiState("done");
      setSaved(false);
    } catch {
      setAiState("error");
    }
  };

  return (
    <div className="app">
      <Header view={view} setView={setView} />

      <button className="btn back-btn" onClick={() => setView("home")}>
        ← 목록으로
      </button>

      <div className="edit-photo">
        <Thumb id={record.id} hasImage={record.hasImage} large />
        {record.hasImage && hasAI && (
          <button className="btn ai-btn" disabled={aiState === "running"} onClick={aiRead}>
            {aiState === "running" ? "읽는 중... (기기 안에서)" : "✨ AI로 읽기 — 사진에서 자동 입력"}
          </button>
        )}
        {aiState === "done" && <div className="ai-note ai-note--ok">읽었어요 — 내용을 확인·수정 후 저장하세요</div>}
        {aiState === "error" && <div className="ai-note ai-note--err">읽기에 실패했어요 — 직접 입력해 주세요</div>}
      </div>

      <div className="edit-form">
        <label className="field">
          <span className="field-label">날짜</span>
          <input className="input" type="date" value={form.date} onChange={(e) => set("date", e.target.value)} />
        </label>
        <label className="field">
          <span className="field-label">상호</span>
          <input
            className="input"
            value={form.store}
            onChange={(e) => set("store", e.target.value)}
            placeholder="예: 김밥천국 역삼점"
            maxLength={50}
          />
        </label>
        <label className="field">
          <span className="field-label">금액(원)</span>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            placeholder="예: 12000"
            min="0"
          />
        </label>
        <div className="field">
          <span className="field-label">분류</span>
          <div className="cat-chips cat-chips--form">
            {CATS.map((c) => (
              <button
                key={c.id}
                className={`btn cat-chip ${form.cat === c.id ? "cat-chip--on" : ""}`}
                style={form.cat === c.id ? { borderColor: c.color, color: c.color } : undefined}
                onClick={() => set("cat", c.id)}
              >
                <span className="dot" style={{ background: form.cat === c.id ? c.color : "var(--muted)" }} />
                {c.name}
              </button>
            ))}
          </div>
        </div>
        <label className="field">
          <span className="field-label">메모</span>
          <input
            className="input"
            value={form.memo}
            onChange={(e) => set("memo", e.target.value)}
            placeholder="예: 팀 점심 (4인)"
            maxLength={100}
          />
        </label>
      </div>

      <button className="btn save-btn" onClick={save}>
        {saved ? "저장됐어요 ✓" : "저장"}
      </button>
      <button className="btn delete-btn" onClick={remove}>
        삭제
      </button>
    </div>
  );
}

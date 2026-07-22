import { useEffect, useMemo, useState } from "react";

import Header from "../components/Header";
import Thumb from "../components/Thumb";
import { CATS } from "../data/defaults";
import { todayLocal } from "../receipts";

// 신규 등록(record 없음 — pendingBlob 미리보기, 저장해야 등록)과 기존 편집(record 있음)을 겸한다
export default function EditView({
  view,
  setView,
  record,
  pendingBlob,
  createRecord,
  patchRecord,
  deleteRecord,
  closeEdit,
}) {
  const isNew = !record;
  const [form, setForm] = useState({
    date: record?.date || todayLocal(),
    store: record?.store || "",
    amount: record?.amount || "",
    cat: record?.cat || "meal",
    memo: record?.memo || "",
  });
  const [saved, setSaved] = useState(false);

  // 신규 사진 미리보기용 objectURL
  const pendingUrl = useMemo(() => (pendingBlob ? URL.createObjectURL(pendingBlob) : null), [pendingBlob]);
  useEffect(() => () => pendingUrl && URL.revokeObjectURL(pendingUrl), [pendingUrl]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    setSaved(false);
  };

  const save = async () => {
    const data = { ...form, amount: Number(form.amount) || 0 };
    if (isNew) {
      await createRecord(data, pendingBlob); // 저장 시에만 레코드 생성 — 이후 홈으로
      return;
    }
    await patchRecord(record.id, data);
    setSaved(true);
  };

  const remove = () => {
    if (window.confirm("이 영수증을 삭제할까요? 사진도 함께 지워져요.")) deleteRecord(record.id);
  };

  return (
    <div className="app">
      <Header view={view} setView={setView} />

      <button className="btn back-btn" onClick={closeEdit}>
        {isNew ? "← 취소 (저장 안 함)" : "← 목록으로"}
      </button>

      <div className="edit-photo">
        {isNew ? (
          pendingUrl ? (
            <img className="thumb thumb--large" src={pendingUrl} alt="영수증" />
          ) : (
            <span className="thumb thumb--large thumb--empty">🧾</span>
          )
        ) : (
          <Thumb id={record.id} hasImage={record.hasImage} large />
        )}
        {isNew && (
          <div className="ai-note ai-note--warn">사진을 보며 아래 내용을 입력하고 저장해야 등록돼요</div>
        )}
        {isNew && (
          <div className="ai-why">
            <b>✨ AI 자동 인식은 왜 없나요?</b> 브라우저 내장 AI(Gemini Nano)로 사진에서 금액을 자동
            추출하는 기능을 만들어 실험했지만, 실제 영수증 검증에서 인식 정확도가 기준에 못 미쳐{" "}
            <b>일부러 껐습니다</b>. 온디바이스 AI 모델이 더 정확해지면 다시 켤 예정이에요 — 내 기기의 AI
            지원 상태는{" "}
            <a href="https://itda-demo-ondevice-ai.vercel.app" target="_blank" rel="noreferrer">
              온디바이스 AI 데모
            </a>
            에서 확인할 수 있습니다.
          </div>
        )}
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
        {isNew ? "저장하고 등록" : saved ? "저장됐어요 ✓" : "저장"}
      </button>
      {!isNew && (
        <button className="btn delete-btn" onClick={remove}>
          삭제
        </button>
      )}
    </div>
  );
}

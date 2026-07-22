import { useRef, useState } from "react";

import Header from "../components/Header";
import InstallHint from "../components/InstallHint";
import SeriesLinks from "../components/SeriesLinks";
import Thumb from "../components/Thumb";
import { CAT_BY_ID } from "../data/defaults";
import { fmtWon } from "../receipts";

export default function HomeView({ view, setView, records, addFiles, addManual, openEdit }) {
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files?.length || busy) return;
    setBusy(true);
    await addFiles(files);
    setBusy(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="app">
      <Header view={view} setView={setView} />
      <InstallHint />

      {/* 드롭존 — 사진을 끌어다 놓거나 탭해서 촬영/선택 */}
      <button
        className={`dropzone ${dragOver ? "dropzone--over" : ""}`}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <span className="dropzone-icon">🧾</span>
        <span className="dropzone-main">{busy ? "등록 중..." : "영수증 사진을 끌어다 놓으세요"}</span>
        <span className="dropzone-sub">탭하면 촬영·앨범 선택 — 여러 장 한 번에 가능</span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <button className="btn manual-btn" onClick={addManual}>
        사진 없이 직접 입력
      </button>

      <div className="privacy-note">사진과 내역은 전부 내 기기에만 저장돼요 — 서버 전송 없음</div>

      {/* 최근 목록 */}
      {records.length === 0 ? (
        <div className="empty-hint">
          아직 영수증이 없어요.
          <br />
          법인카드 영수증부터 한 장 올려보세요.
        </div>
      ) : (
        <div className="rec-list">
          <div className="list-label">최근 등록 {records.length}건</div>
          {records.slice(0, 50).map((r) => {
            const cat = CAT_BY_ID[r.cat];
            return (
              <button key={r.id} className="btn rec-item" onClick={() => openEdit(r.id)}>
                <Thumb id={r.id} hasImage={r.hasImage} />
                <span className="rec-item-body">
                  <span className="rec-item-top">
                    <span className="rec-item-store">{r.store || "상호 미입력"}</span>
                    <span className="rec-item-amount">{fmtWon(r.amount)}</span>
                  </span>
                  <span className="rec-item-meta">
                    <span className="dot" style={{ background: cat?.color }} /> {cat?.name} · {r.date}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}

      <SeriesLinks />
    </div>
  );
}

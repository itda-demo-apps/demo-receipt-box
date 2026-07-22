import { useRef, useState } from "react";

import Header from "../components/Header";
import InstallHint from "../components/InstallHint";
import SeriesLinks from "../components/SeriesLinks";
import Thumb from "../components/Thumb";
import { CAT_BY_ID } from "../data/defaults";
import { fmtWon } from "../receipts";

export default function HomeView({ view, setView, records, startCreate, openEdit }) {
  const [dragOver, setDragOver] = useState(false);
  const [notice, setNotice] = useState("");
  const fileRef = useRef(null);

  // 자동 인식이 없으므로 한 장씩 — 여러 장이 와도 첫 장만 열고 안내한다
  const handleFiles = (files) => {
    const images = [...(files || [])].filter((f) => f.type.startsWith("image/"));
    if (!images.length) return;
    setNotice(images.length > 1 ? "자동 인식 기능이 없어 한 장씩 입력해요 — 첫 장을 열었어요" : "");
    startCreate(images[0]);
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

      {/* 드롭존 — 사진 한 장 → 편집 화면에서 입력 후 저장해야 등록된다 */}
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
        <span className="dropzone-main">영수증 사진 한 장을 올리고 바로 입력하세요</span>
        <span className="dropzone-sub">
          사진은 증빙 보관용 — 내용(상호·금액)은 직접 입력해요 (자동 인식 없음)
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {notice && <div className="dz-notice">{notice}</div>}
      <button className="btn manual-btn" onClick={() => startCreate(null)}>
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

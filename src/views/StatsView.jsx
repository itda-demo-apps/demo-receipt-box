import { useMemo, useState } from "react";

import Header from "../components/Header";
import { CATS, CAT_BY_ID } from "../data/defaults";
import { summarize, monthOf, fmtWon, exportCSV, todayLocal } from "../receipts";

export default function StatsView({ view, setView, records }) {
  // 기록이 있는 월 목록(최신순), 기본은 이번 달
  const months = useMemo(() => {
    const set = new Set(records.map(monthOf).filter(Boolean));
    set.add(todayLocal().slice(0, 7));
    return [...set].sort().reverse();
  }, [records]);
  const [month, setMonth] = useState(months[0]);

  const { inMonth, byCat, total } = summarize(records, month);
  const maxCat = Math.max(1, ...Object.values(byCat));

  return (
    <div className="app">
      <Header view={view} setView={setView} />

      {/* 월 선택 */}
      <div className="month-row">
        {months.slice(0, 6).map((m) => (
          <button
            key={m}
            className={`btn month-chip ${m === month ? "month-chip--on" : ""}`}
            onClick={() => setMonth(m)}
          >
            {Number(m.slice(5))}월
          </button>
        ))}
      </div>

      <div className="total-card">
        <div className="total-label">{month.replace("-", "년 ")}월 지출 {inMonth.length}건</div>
        <div className="display total-amount">{fmtWon(total)}</div>
      </div>

      {/* 분류별 막대 */}
      <div className="cat-bars">
        {CATS.map((c) => {
          const amt = byCat[c.id] || 0;
          if (!amt) return null;
          return (
            <div key={c.id} className="cat-bar-row">
              <span className="cat-bar-name">
                <span className="dot" style={{ background: c.color }} /> {c.name}
              </span>
              <span className="cat-bar-track">
                <span className="cat-bar-fill" style={{ width: `${(amt / maxCat) * 100}%`, background: c.color }} />
              </span>
              <span className="cat-bar-amt">{fmtWon(amt)}</span>
            </div>
          );
        })}
        {inMonth.length === 0 && (
          <div className="empty-hint">이 달에는 기록이 없어요.</div>
        )}
      </div>

      <button
        className="btn export-btn"
        disabled={!inMonth.length}
        onClick={() => exportCSV(inMonth, (id) => CAT_BY_ID[id]?.name || id)}
      >
        이 달 내역 CSV로 내보내기 (엑셀 호환)
      </button>
      <div className="privacy-note">CSV는 파일로 다운로드될 뿐, 서버로는 아무것도 가지 않아요</div>
    </div>
  );
}

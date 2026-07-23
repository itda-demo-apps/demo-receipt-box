import { navigate } from "../router";

export default function Header({ view, setView }) {
  const tabs = [
    { id: "home", label: "영수증" },
    { id: "stats", label: "집계" },
    { id: "contact", label: "문의" },
  ];
  const active = view === "edit" ? "home" : view; // 편집은 영수증 탭의 하위 화면
  return (
    <div className="header">
      <button className="btn header-logo-btn display header-logo" onClick={() => navigate("/")}>
        영수증 <span className="accent">정리함</span>
      </button>
      <nav className="header-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`btn tab ${active === t.id ? "tab--active" : ""}`}
            onClick={() => setView(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

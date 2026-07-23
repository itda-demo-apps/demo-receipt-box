import { useEffect, useState } from "react";

import { loadRecords, addRecord, updateRecord, removeRecord } from "./receipts";
import { imageDB, resizeImage } from "./db";
import { useRoute, navigate } from "./router";
import HomeView from "./views/HomeView";
import EditView from "./views/EditView";
import StatsView from "./views/StatsView";
import ContactView from "./views/ContactView";

// 화면 이름 → 경로. Header 탭 등 setView 호출을 navigate로 이어 준다.
const PATHS = { home: "/", stats: "/stats", contact: "/contact" };

export default function App() {
  const [ready, setReady] = useState(false);
  const route = useRoute(); // URL이 화면 상태의 진실 소스
  const view = route.view; // home | edit | stats | contact
  const editId = view === "edit" ? route.recordId : null; // /edit/:id → 편집 대상, /new → null
  const setView = (v) => navigate(PATHS[v] ?? "/");
  const [pendingBlob, setPendingBlob] = useState(null); // 신규 등록 중인 사진 (저장 전엔 레코드 없음)
  const [records, setRecords] = useState([]);

  useEffect(() => {
    (async () => {
      setRecords(await loadRecords());
      setReady(true);
    })();
  }, []);

  // 신규 등록 시작 — 사진은 선택 사항. 자동 인식이 없으므로 한 장씩, 저장 전엔 아무것도 만들지 않는다.
  const startCreate = async (file) => {
    setPendingBlob(file ? await resizeImage(file) : null);
    navigate("/new");
  };

  // 저장 시에만 레코드 생성 — 입력 없이 나가면 빈 레코드가 남지 않는다
  const createRecord = async (form, blob) => {
    const { records: next, rec } = await addRecord({ ...form, hasImage: !!blob });
    if (blob) await imageDB.put(rec.id, blob);
    setRecords(next);
    setPendingBlob(null);
    navigate("/");
  };

  const patchRecord = async (id, patch) => setRecords(await updateRecord(id, patch));
  const deleteRecord = async (id) => {
    setRecords(await removeRecord(id));
    navigate("/");
  };
  const openEdit = (id) => {
    setPendingBlob(null);
    navigate(`/edit/${encodeURIComponent(id)}`);
  };
  const closeEdit = () => {
    setPendingBlob(null); // 저장 안 한 신규 등록은 폐기
    navigate("/");
  };

  // /edit/:id 직접 진입인데 해당 레코드가 없으면 홈으로 폴백
  useEffect(() => {
    if (!ready) return;
    if (view === "edit" && editId && !records.find((r) => r.id === editId)) {
      navigate("/", { replace: true });
    }
  }, [ready, view, editId, records]);

  if (!ready) return <div className="app app--center loading">불러오는 중...</div>;

  const shared = { view, setView };
  if (view === "edit") {
    const rec = editId ? records.find((r) => r.id === editId) : null;
    if (rec || !editId)
      return (
        <EditView
          {...shared}
          record={rec}
          pendingBlob={pendingBlob}
          createRecord={createRecord}
          patchRecord={patchRecord}
          deleteRecord={deleteRecord}
          closeEdit={closeEdit}
        />
      );
  }
  if (view === "stats") return <StatsView {...shared} records={records} />;
  if (view === "contact") return <ContactView {...shared} />;
  return <HomeView {...shared} records={records} startCreate={startCreate} openEdit={openEdit} />;
}

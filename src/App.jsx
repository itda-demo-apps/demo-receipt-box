import { useEffect, useState } from "react";

import { loadRecords, addRecord, updateRecord, removeRecord } from "./receipts";
import { imageDB, resizeImage } from "./db";
import HomeView from "./views/HomeView";
import EditView from "./views/EditView";
import StatsView from "./views/StatsView";
import ContactView from "./views/ContactView";

export default function App() {
  const [ready, setReady] = useState(false);
  const [view, setView] = useState("home"); // home | edit | stats | contact
  const [editId, setEditId] = useState(null); // 기존 레코드 편집 대상
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
    setEditId(null);
    setView("edit");
  };

  // 저장 시에만 레코드 생성 — 입력 없이 나가면 빈 레코드가 남지 않는다
  const createRecord = async (form, blob) => {
    const { records: next, rec } = await addRecord({ ...form, hasImage: !!blob });
    if (blob) await imageDB.put(rec.id, blob);
    setRecords(next);
    setPendingBlob(null);
    setView("home");
  };

  const patchRecord = async (id, patch) => setRecords(await updateRecord(id, patch));
  const deleteRecord = async (id) => {
    setRecords(await removeRecord(id));
    setView("home");
  };
  const openEdit = (id) => {
    setPendingBlob(null);
    setEditId(id);
    setView("edit");
  };
  const closeEdit = () => {
    setPendingBlob(null); // 저장 안 한 신규 등록은 폐기
    setView("home");
  };

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

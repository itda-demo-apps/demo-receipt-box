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
  const [editId, setEditId] = useState(null);
  const [records, setRecords] = useState([]);

  useEffect(() => {
    (async () => {
      setRecords(await loadRecords());
      setReady(true);
    })();
  }, []);

  // 사진 파일들 등록 — 리사이즈 → IndexedDB, 레코드 생성. 1장이면 바로 편집으로.
  const addFiles = async (files) => {
    const images = [...files].filter((f) => f.type.startsWith("image/"));
    let lastId = null;
    for (const file of images) {
      const blob = await resizeImage(file);
      const { records: next, rec } = await addRecord({ hasImage: true });
      await imageDB.put(rec.id, blob);
      setRecords(next);
      lastId = rec.id;
    }
    if (images.length === 1 && lastId) {
      setEditId(lastId);
      setView("edit");
    }
    return images.length;
  };

  // 사진 없이 수기 등록
  const addManual = async () => {
    const { records: next, rec } = await addRecord({});
    setRecords(next);
    setEditId(rec.id);
    setView("edit");
  };

  const patchRecord = async (id, patch) => setRecords(await updateRecord(id, patch));
  const deleteRecord = async (id) => {
    setRecords(await removeRecord(id));
    setView("home");
  };
  const openEdit = (id) => {
    setEditId(id);
    setView("edit");
  };

  if (!ready) return <div className="app app--center loading">불러오는 중...</div>;

  const shared = { view, setView };
  if (view === "edit" && editId) {
    const rec = records.find((r) => r.id === editId);
    if (rec)
      return <EditView {...shared} record={rec} patchRecord={patchRecord} deleteRecord={deleteRecord} />;
  }
  if (view === "stats") return <StatsView {...shared} records={records} />;
  if (view === "contact") return <ContactView {...shared} />;
  return (
    <HomeView {...shared} records={records} addFiles={addFiles} addManual={addManual} openEdit={openEdit} />
  );
}

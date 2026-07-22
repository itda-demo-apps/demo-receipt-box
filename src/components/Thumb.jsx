import { useEffect, useState } from "react";

import { imageDB } from "../db";

// 영수증 썸네일 — IndexedDB에서 blob을 꺼내 objectURL로 표시
export default function Thumb({ id, hasImage, large }) {
  const [url, setUrl] = useState(null);

  useEffect(() => {
    if (!hasImage) return;
    let objectUrl = null;
    imageDB
      .get(id)
      .then((blob) => {
        if (blob) {
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        }
      })
      .catch(() => {});
    return () => objectUrl && URL.revokeObjectURL(objectUrl);
  }, [id, hasImage]);

  if (!hasImage) return <span className={`thumb thumb--empty ${large ? "thumb--large" : ""}`}>🧾</span>;
  if (!url) return <span className={`thumb ${large ? "thumb--large" : ""}`} />;
  return <img className={`thumb ${large ? "thumb--large" : ""}`} src={url} alt="영수증" />;
}

// AI로 읽기 — Chrome 148+ Prompt API 멀티모달(이미지 입력)로 영수증 자동 인식.
// progressive enhancement: 지원 기기에서만 버튼이 나타나고, 전 과정 온디바이스(무전송)다.
import { CATS } from "./data/defaults";

const SCHEMA = {
  type: "object",
  properties: {
    date: { type: "string", description: "YYYY-MM-DD, 모르면 빈 문자열" },
    store: { type: "string", description: "상호명, 모르면 빈 문자열" },
    amount: { type: "number", description: "합계 금액(원), 모르면 0" },
    cat: { type: "string", enum: CATS.map((c) => c.id), description: "지출 분류 추정" },
  },
  required: ["date", "store", "amount", "cat"],
};

let session = null;

export async function aiAvailable() {
  try {
    if (!("LanguageModel" in self)) return false;
    const st = await LanguageModel.availability({ expectedInputs: [{ type: "image" }] });
    return st === "available";
  } catch {
    return false;
  }
}

export async function readReceipt(imageBlob) {
  if (!session) session = await LanguageModel.create({ expectedInputs: [{ type: "image" }] });
  const bitmap = await createImageBitmap(imageBlob);
  const result = await session.prompt(
    [
      {
        role: "user",
        content: [
          {
            type: "text",
            value:
              "이 영수증 사진에서 결제 정보를 추출해줘. 분류는 식비(meal)/교통(transport)/사무용품(office)/접대·경조(social)/기타(etc) 중 추정.",
          },
          { type: "image", value: bitmap },
        ],
      },
    ],
    { responseConstraint: SCHEMA }
  );
  bitmap.close?.();
  return JSON.parse(result);
}

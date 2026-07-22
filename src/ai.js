// AI로 읽기 — Chrome 148+ Prompt API 멀티모달(이미지 입력)로 영수증 자동 인식.
// progressive enhancement: 지원 기기에서만 버튼이 나타나고, 전 과정 온디바이스(무전송)다.
import { CATS } from "./data/defaults";

const SCHEMA = {
  type: "object",
  properties: {
    date: { type: "string", description: "영수증에 인쇄된 거래 날짜 YYYY-MM-DD. 확실하지 않으면 빈 문자열" },
    store: { type: "string", description: "영수증 상단의 점포명 — 브랜드와 지점명을 합쳐서. 확실하지 않으면 빈 문자열" },
    amount: {
      type: "number",
      description:
        "'결제금액'/'합계'/'총구매액' 라벨 바로 옆의 숫자만. 바코드 숫자·카드번호·승인번호·사업자등록번호·전화번호는 절대 금액이 아니다. 라벨 옆 숫자를 명확히 읽지 못했으면 반드시 0",
    },
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
              "이 영수증 사진에서 결제 정보를 추출해줘. 규칙: ① 금액(amount)은 '결제금액'·'합계'·'총구매액' 라벨 바로 옆 숫자만 — 하단 바코드 숫자, 카드번호, 승인번호, 사업자등록번호, 전화번호는 금액이 아니므로 절대 쓰지 마. 라벨 옆 숫자가 또렷하지 않으면 amount는 0. ② 날짜(date)는 인쇄된 거래 일자. ③ 상호(store)는 상단 점포명(브랜드+지점). ④ 분류는 식비(meal)/교통(transport)/사무용품(office)/접대·경조(social)/기타(etc) 중 추정.",
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

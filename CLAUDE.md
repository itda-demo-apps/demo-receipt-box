# 영수증 정리함 (demo-receipt-box)

영수증 사진 분류·집계 PWA. 교육용 데모 시리즈 B축 — 원형은 교육 실습 과제 '영수증 지침'. "실습 한 조각 → 완성 제품" 도약을 보여주는 것이 목적.

## 배경과 목적

사용자 문제: 법인카드·경비 영수증이 지갑과 폰 사진첩에 흩어져 월말 정산 때 고통.
해결 접근: 드래그/촬영으로 등록 → 분류·집계 → CSV. **사진(IndexedDB)·내역(localStorage) 전부 기기 안** — 회사 지출 데이터가 외부로 안 나간다.

### ⚠️ AI 자동 인식은 실측 판정으로 제거됨 (2026-07-23 마스터 결정 — 되살리기 전에 반드시 읽을 것)

v0.1에서 Chrome 148 멀티모달 Prompt API(Gemini Nano)로 "AI로 읽기"를 구현했으나, **실제 CU 영수증 판정에서 결제금액 2,000원을 40,190원으로 오독**(바코드/승인번호 숫자를 주움). 프롬프트 강화(라벨 옆 숫자만·불확실 시 0)로도 신뢰 확보 실패 → "성능이 낮으면 없는 게 나음" 기준으로 **기능 전체 제거**(커밋 이력에 ai.js 있음). 결론: Nano급 온디바이스 모델은 감열지 영수증의 숫자 정밀 OCR에 부적합. 영수증에 항목 여러 건이 섞이는 경우는 더 무리. 재도입하려면 ① 모델 세대 교체로 정밀도 입증 또는 ② 클라우드 OCR(무전송 원칙 파괴 — 앱 정체성과 충돌) 중 하나가 필요하다.

## 실행

```bash
npm install
npm run dev / build / preview
npm run icons                       # 아이콘 재생성 (Pillow)
python3 scripts/generate-og.py      # OG 이미지 — 저장소 루트에서 실행
python3 scripts/generate-splash.py  # iOS 스플래시 17종 — 저장소 루트에서 실행
```

## 구조

```
src/
  main.jsx               # 엔트리 — SW 등록
  App.jsx                # 상태 소유(records·hasAI) + 화면 전환(home/edit/stats/contact) + addFiles 파이프라인
  receipts.js            # 레코드 정본 — APP_KEY(receipt-app-v1)·add/update/remove·summarize·exportCSV(BOM)
  db.js                  # imageDB(IndexedDB blob 저장) + resizeImage(긴 변 1200px JPEG)
  storage.js             # localStorage 어댑터 (시리즈 공용)
  data/defaults.js       # CATS(분류 5색)
  data/series.js         # 데모 시리즈 목록
  views/
    HomeView.jsx         # 드롭존(드래그/탭 촬영·앨범, multiple) + 최근 목록
    EditView.jsx         # 사진 미리보기 + AI로 읽기 + 날짜/상호/금액/분류/메모 폼 + 삭제
    StatsView.jsx        # 월 칩 + 총액 + 분류별 막대 + CSV 내보내기
    ContactView.jsx      # 문의 폼 (시리즈 공용 패턴)
  components/
    Header.jsx           # 영수증/집계/문의 탭 (edit는 영수증 탭 하위)
    Thumb.jsx            # IndexedDB blob → objectURL 썸네일 (revoke 처리)
    InstallHint.jsx, SeriesLinks.jsx  # 시리즈 공용
api/contact.js           # 문의 폼 → Telegram
scripts/                 # PIL 아이콘/OG/스플래시 (영수증 지그재그 도안)
```

## 핵심 로직

- **저장 이원화**: 메타는 `receipt-app-v1`(localStorage 단일 키, 상한 1000건), 사진은 imageDB(IndexedDB, key=record.id). 등록 시 `resizeImage`로 긴 변 1200px·JPEG q0.8 축소(장당 수백 KB). 삭제 시 양쪽 모두 제거.
- **등록 흐름** (`App.addFiles`): 이미지 파일마다 리사이즈→IDB→레코드 생성. **1장이면 바로 편집 화면**으로(현장 UX), 여러 장이면 목록에 쌓고 나중에 채움.
- **집계** (`receipts.summarize`): date의 YYYY-MM 기준 월 필터 + 분류별 합계. StatsView 막대는 최대값 대비 비율.
- **CSV**: `﻿` BOM + CRLF + 전체 필드 쿼팅 — 한글 엑셀 호환. 다운로드는 Blob objectURL.
- **PWA**: 앱 셸만 프리캐시 — 사용자 데이터는 어차피 로컬이라 오프라인 완결.

## 규약 (데모 시리즈 공통)

- UI·주석 한국어. 배경 `#1E2126`(주철)·텍스트 `#F2EFE9`(초크), 분류 5색은 시리즈 공통 팔레트. Black Han Sans + Noto Sans KR.
- 앱 아이콘: 영수증(지그재그 하단) + 분류 점. 재생성 `npm run icons`.
- 모바일 퍼스트(maxWidth 480). 입력 필드 font-size 16px(iOS 자동 확대 방지).
- **시리즈 상호 링크 + 교육 카드**: `data/series.js` — 새 데모 앱 추가 시 모든 형제 앱 갱신·재배포(마스터 지시 2026-07-22).
- SEO·교육 홍보 규약: sitemap/robots·JSON-LD creator(잇다)·푸터 교육 카드 적용됨.

## 배포

- Vercel 프로젝트 `itda-demo-receipt-box`, 프로덕션 https://itda-demo-receipt-box.vercel.app
- 문의 폼: Vercel 환경변수 `TELEGRAM_BOT_TOKEN`·`TELEGRAM_CHAT_ID`(Production) — 원본 `~/Apps/demo-apps/.env`
- 강의 배포 관례: 프로덕션 URL → QR. 폰 카메라 촬영 등록이 모바일 시연 포인트.

## 미착수 / 로드맵 후보

- [x] AI로 읽기 실기기 검증 → **기준 미달로 제거** (위 결정 기록 참조)
- [ ] 한 영수증에 여러 항목(분류가 갈리는 경우) — 금액 분할 입력 UI 검토 (마스터 언급 2026-07-23)
- [ ] 영수증 사진 원본 보기(확대·회전)
- [ ] 월 예산 설정 + 초과 경고
- [ ] 팀 공유(정산 담당자에게 월 묶음 전달) — 서버 필요, storage.js 교체 지점

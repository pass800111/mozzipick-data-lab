# MOZZIPICK 1번 실시간 발굴: n8n Production Webhook 연결 규약 (r29)

상태: GitHub Pages 사이트의 실시간 발굴 호출/검증 UI는 준비되었으나 실제 n8n Production Webhook 주소와 실행 워크플로는 확인 및 연결되지 않았습니다. 이 문서는 동작 계약이며 활성화 완료 증빙이 아닙니다.

## 서버 쪽 설정

1. 사용자의 기존 n8n Cloud 작업공간 pass800111.app.n8n.cloud에서 POST Webhook 트리거를 만듭니다. 예측하기 어려운 랜덤 Path를 사용하고 활성화/Publish한 뒤 실제 Production URL을 확인합니다. webhook-test URL은 사이트에서 거절합니다.
2. 사이트는 Webhook URL과 워크플로 접근 코드를 열린 탭의 자바스크립트 메모리에서만 사용합니다. 공개 HTML, GitHub, localStorage, history에는 저장하지 않습니다. n8n에서 최소 12자 이상 접근 코드를 서버 측에서 확인한 후에만 Apify, GitHub 또는 다른 유료 작업을 시작해야 합니다. 비밀키를 이 저장소에 기록하지 마세요.
3. 사이트는 브라우저의 단순 CORS 요청이 되도록 Content-Type: text/plain;charset=UTF-8 로 JSON 문자열을 POST합니다. Webhook body가 문자열이면 n8n Code 노드에서 JSON.parse 하세요. n8n Webhook Allowed Origins (CORS)에 https://pass800111.github.io 를 허용하고 실제 브라우저 응답 헤더를 검증하세요.
4. 허용 command: 1 (SNS+쿠팡 교차검색), 1-1 (국내 인스타), 1-2 (해외 인스타), 1-3 (쿠팡 신규 통합검색). 기존 Instagram Apify → 필터 → GitHub data/instagram-electronics.json 흐름은 보존해 재사용하세요. 1번 또는 1-3번 실제 외부 검색 수행 분기가 아직 없다면 200/ok:true 를 주지 말고 명시적인 미구현 오류를 반환하세요. products.json만 다시 읽어 실시간 검색이라고 부르면 안 됩니다.
5. 입력을 검증해 워크플로가 특정 요청을 실제 접수했을 때만 다음 응답을 반환하세요: {"ok":true,"status":"accepted","requestId":"원본-requestId"}. 짧은 동기 검색이 실제 완료됐고 확인 가능한 items가 있다면 status:"completed", items:[...], registeredCount:실제 커밋 수를 줄 수 있습니다. 기본 응답 'Workflow got started'만으로는 사이트가 성공 표시하지 않습니다.
6. accepted를 응답한 경우, 실제 검색과 GitHub 등록 완료 후 data/discovery-runs/<requestId>.json 파일을 커밋하세요. 아래 공개 파일 규약을 지키세요. 등록 상품이 없어도 status:completed / items:[] / registeredCount:0은 유효합니다. 예외 시 status:failed 와 원인을 남기세요.
7. 보고서 출처는 실제 Instagram Reel, TikTok, Xiaohongshu, Coupang 원본 URL만 사용합니다. 게시일/좋아요/조회수/판매/리뷰 등 미확인 수치는 null로 남겨 두고 추정하지 않습니다. 중복은 원본 릴스 코드/검증된 제품명·모델/Coupang 상품 ID 기준으로 제거합니다. 기존 상품·이미지·배포 디자인을 삭제하거나 리셋하지 마세요.

## 브라우저 요청 예시 — 이 접근 코드는 실제 암호가 아닙니다

    {"schema":"mozzipick.discovery.v1","command":"1-1","requestId":"8e13d093-99e3-44ee-bc4d-3e9d84caa2ac","requestedAt":"2026-09-27T06:00:00.000Z","limit":20,"days":14,"origin":"https://pass800111.github.io","accessKey":"YOUR_PRIVATE_N8N_WORKFLOW_CODE"}

## 완료 파일 예시 — GitHub Pages에서 같은 요청 ID로 조회

    {
      "schema":"mozzipick.discovery.v1",
      "requestId":"8e13d093-99e3-44ee-bc4d-3e9d84caa2ac",
      "command":"1-1",
      "status":"completed",
      "completedAt":"2026-09-27T06:20:00.000Z",
      "registeredCount":0,
      "items":[{"name":"실제 조사한 상품명","sourceUrl":"https://www.instagram.com/reel/ACTUAL_POST_CODE/","description":"실제 확인 근거","views":null,"likes":null,"comments":null,"postedAt":null}]
    }

GitHub Pages 배포 반영 전에는 결과 파일이 404일 수 있고 사이트는 이를 대기 상태로 표시합니다. 실제 commit 전에는 registeredCount를 올리지 마세요. 브라우저의 '결과 다시 확인' 버튼은 요청 ID별 파일을 확인합니다.

공식 n8n Webhook 문서: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/

## 현 상태

- 사이트 측 안전한 실행, 오류·진행 상태, 별도 저장자료 조회 및 결과 파일 인터페이스: 구현 중 / QA 검증 대상.
- 실제 n8n Production Webhook 주소 및 접근 코드: 저장소에서 확인되지 않아 사이트에 임의로 하드코딩하지 않음.
- n8n 워크플로의 실전 실행·수집·등록 확인: n8n 직접 접근 및 Production URL 설정 후만 가능.

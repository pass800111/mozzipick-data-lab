# MOZZIPICK V3.5 r30 — 채팅 발굴 → 사이트 보고서

현재 운영 방식: 채팅에서 1, 1-1, 1-2, 1-3 명령어 실행 → 공개 출처 실시간 조사·교차검증 → GitHub 연결 권한으로 `data/command-reports.json`에 보고서 기록 → GitHub Pages에서 읽기만 함. **사이트에서 Apify/n8n/유료 수집기를 호출하지 않는다.** ChatGPT의 해당 작업을 수행하는 동안에만 조사와 GitHub 저장이 진행되며, 독립적인 24시간 자동 실행은 제공하지 않는다.

기존 `data/products.json`, `data/instagram-electronics.json`과 제품 카드·이미지·제작관리 정보는 이 보고서가 자동으로 덮어쓰지 않는다. 이전 수집 자료는 별도 `📁 저장자료 조회` 버튼에 유지한다. 과거 미검증 자료를 신규 채팅 조사 결과로 포장하지 않는다.

## 명령어

- `1`: Instagram·샤오홍슈·TikTok·Coupang 최신 전자제품/생활불편 해결 제품 통합 발굴과 출처별 교차검증, 중복 제거.
- `1-1`: 국내 인스타 리뷰형 전자제품 릴스, 최근 14일, 원본 게시물·계정 링크, 최대 20개/보고서·5개/사이트 페이지.
- `1-2`: 해외 인스타 리뷰형 테크 릴스, 최근 14일, 위와 같은 근거.
- `1-3`: 쿠팡 상품 통합 조사. S 최근 3일, A 3일 초과~15일, B 15일 초과; **등록일을 랭킹 관측일로 둔갑시키지 않는다.** 정확한 관측일·판매/리뷰 데이터가 없으면 명시적으로 미확인.

## 저장 형식

`data/command-reports.json`: `{ "schema":"mozzipick.chat-reports.v1", "updatedAt":"실제 ISO-8601 커밋 시각", "reports": { "1":[], "1-1":[], "1-2":[], "1-3":[] } }`.
각 `reports[command]`에 최근 보고서를 앞에 추가하고 구버전 기록을 보존. 보고서 ID 고유값, 중복 제거 기준 및 근거 링크를 포함한다.

보고서 예시 (아래 값은 **형식 참고일 뿐 수집된 실제 상품이 아니며** 저장 파일에 삽입하지 않는다):

```json
{
  "id":"unique-run-id",
  "command":"1-1",
  "title":"국내 인스타 전자제품 조사",
  "createdAt":"ISO-8601 조사 시각",
  "period":"최근 14일 · YYYY-MM-DD~YYYY-MM-DD",
  "summary":"조회할 수 있는 공개 지표와 추천 근거 요약",
  "notes":"게시일/조회수 비공개 항목의 한계 명시",
  "items":[{
    "productName":"실제로 확인된 제품명 또는 상품명 미확인",
    "model":"정확한 모델명 또는 빈 문자열",
    "category":"PC 주변기기 등 확인된 범주",
    "sourcePlatform":"Instagram",
    "reelUrl":"https://www.instagram.com/reel/검증된코드/",
    "accountUrl":"https://www.instagram.com/검증된계정/",
    "caption":"실제 릴스 내용 요약",
    "publishedAt":null,
    "metricsObservedAt":null,
    "metrics":{"views":null,"likes":null,"comments":null,"shares":null},
    "sale":{"status":"unknown","platform":null,"url":null,"checkedAt":null,"price":null},
    "sponsored":null,
    "recommendation":"모찌픽의 콘텐츠 제작 이유",
    "cautions":"추가로 확인이 필요한 부분",
    "crossChecks":[],
    "sources":[{"label":"원본 근거","url":"https://검증된-공개-출처/"}]
  }]
}
```

상품별 `metrics` 필드는 검증된 공개 지표만 숫자로 기록; 조회 불가·비공개는 반드시 null. 판매 상태: `verified-on-sale`은 실제 상품과 판매 URL, 확인 시각이 모두 있을 때만; `search-result-only`는 검색 결과만, `not-found`는 조사 중 미발견, `unavailable`은 판매 중단 검증, `unknown`은 확인 못함. 실제 판매 검증이 안 된 쇼핑몰 검색 결과를 `verified-on-sale`로 표시하지 않는다. 광고 표시는 게시물에서 확인된 경우만. 평가적 추천은 사실과 구분해 연구자의 콘텐츠 관점에서 기술한다.

새 보고서에서 제품 중복은 릴스 원본 shortcode + 상품 모델/판매 페이지 ID를 대조해 제거하고, 출처와 조사 시각을 유지한다. 상품 상세는 별도 등록을 승인받은 경우에만 반영한다.

## 배포와 비용

채팅에서 수행한 조사 결과를 GitHub 연결 도구로 커밋한 뒤 Pages 배포가 완료되어야 사이트에 표시된다. 사이트 명령어 버튼은 이 저장 파일만 읽고, 누를 때마다 외부 조사나 상품 등록을 시작하지 않는다. n8n/Apify 호출·비밀번호·Webhook URL 불필요. GitHub Pages 및 ChatGPT 각 사용자 요금제/서비스 약관은 별개이며 무제한 무료 사용을 보장하는 것은 아니다.

r29 n8n 연결은 사이트에서 더 이상 로드하지 않는다. n8n 초안 `MOZZIPICK - LIVE DISCOVERY`는 Publish하지 않고 중단할 것. 기존 원본 수동 워크플로 및 r29 백업 브랜치 보존.

# 인스타 릴스 썸네일 수집 · MOZZIPICK V3.4

## 현재 상태
`data/instagram-electronics.json`에는 국내 6개/해외 20개의 원본 게시물 링크와 반응 지표가 있고, 현재 26개 모두 썸네일 필드는 없다. 임의로 비슷한 제품의 사진을 배정하면 안 된다.

## n8n + Apify 수집 시점에 함께 저장
1. Apify에서 사용 권한이 있는 게시물 메타데이터를 가져온다. 각 결과에서 실제 원본 게시물의 `reel`/`url`/`postUrl`과 함께 `thumbnailUrl` 또는 `displayUrl`(사용 중인 Actor의 실제 출력 필드 확인)을 보존한다.
2. n8n에서는 원본 게시물 shortcode(`/p/XXXXX/` 또는 `/reel/XXXXX/`)를 키로 같은 게시물만 병합한다. 상품명으로 이미지를 추측해 연결하지 않는다.
3. 테스트: Apify JSON export를 저장하고 `node scripts/merge-instagram-thumbnails.mjs ./apify-export.json` 으로 dry-run. 검토 후 `--write`를 붙이면 `data/instagram-electronics.json`을 갱신한다.
4. `thumbnail` 필드는 사진 표시용 URL이며 `thumbnailSource`와 `thumbnailStatus`에 출처 및 실제 로딩 검증 여부를 별도 표기한다. 수집된 URL이 맞다는 것과 사이트에서 실제로 열리는 것, 재사용 권한은 서로 다르다.
5. 배포용 안정성: 사용 허가된 썸네일만 로컬 `assets/instagram/<shortcode>.webp` 등으로 보관하고 `thumbnail`을 상대 경로로 바꾼다. 외부 CDN URL은 만료되거나 차단될 수 있으므로 장기 운영에 의존하지 않는다. 무단 복사 대신 공식 게시물 임베드와 원본 바로가기 제공도 가능하다.
6. 매번 신규 릴스 등록 시 메타데이터와 표지 필드를 동시에 확인한다. 사진 주소가 없으면 표시 영역에 원본 릴스 링크가 연결된 안내를 띄우고, 다른 영상/상품의 이미지를 대신 사용하지 않는다.

주의: Instagram의 임베드 제한, 접근 제한, 공개 여부와 이미지 저작권은 실제 사용 전에 확인해야 한다. 사이트가 공개된다고 원본 이미지 재사용 권한이 자동 부여되는 것은 아니다.
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

## GitHub Actions 자동 연결 (V3.4 r16)
- 저장소 Settings → Secrets and variables → Actions → Repository secrets: `APIFY_TOKEN`을 추가한다. 채팅이나 소스 코드에 토큰을 입력하지 않는다.
- Repository variables: `APIFY_DATASET_ID`에 기존 n8n/Apify Instagram Scraper 결과 데이터셋 ID를 넣는다. 존재하지 않는 ID를 임의로 추정하지 않는다.
- `.github/workflows/instagram-thumbnail-sync.yml`은 `data/instagram-electronics.json` 갱신 또는 수동 Workflow Dispatch 시 실행한다. 인증 설정이 없으면 안전하게 SKIP한다.
- 원본 게시물 shortcode가 같은 경우에만 썸네일 URL을 병합한다. 새로 확인한 이미지 메타데이터만 저장하고 기존 데이터는 보존한다. 이 과정은 **사진의 재사용 권리/다운로드/이미지 유효성 자체를 검증하지 않는다**.
- Apify Actor에서 썸네일 URL 필드가 없다면 빈 상태로 남는다. `sourceRecords`, `matchedImageRecords`, `added`, `missingCount` 로그로 누락 원인을 확인한다.

## 국내 6개 원본 매칭 및 만료 대응 (2026-09-27)
- 업로드한 Apify JSON의 원본 게시물 6개가 현재 `data/instagram-electronics.json`의 국내 6개와 모두 정확히 일치한다. 매칭 증빙은 `data/instagram-domestic-source-audit.json`에 보존했다.
- 파일에 포함된 이미지 CDN 주소는 모두 2026-09-26에 만료됐다. 기존 주소를 사이트에 올리거나, 주소의 `oe`만 임의 변경해서는 안 된다.
- `scripts/merge-instagram-thumbnails.mjs`는 만료된 링크를 거부하고 유효한 최신 원본 게시물의 이미지 주소만 병합한다. 각 이미지의 사용 권한, 접근 가능 여부는 별도로 검증한다.
- `scripts/sync-apify-instagram-thumbnails.mjs`는 `APIFY_TASK_ID`가 있으면 마지막 성공 실행의 최신 데이터셋을 조회한다. 없으면 `APIFY_DATASET_ID`로 기존 데이터셋을 조회한다. **새로운 유료 Apify 스크레이핑 작업을 자동으로 시작하지 않는다.**
- GitHub Settings → Secrets and variables → Actions에서 repository secret `APIFY_TOKEN` 및 repository variable `APIFY_TASK_ID` (또는 `APIFY_DATASET_ID`)를 설정하면 데이터 파일 업데이트와 일일 동기화 시 새 데이터의 URL을 병합한다. 토큰은 채팅에 붙여넣지 않는다.
- 유효기간이 지난 이미지 URL은 사이트에서 숨기며 원본 게시물 상세보기·원본 링크는 계속 작동한다. CDN 재발급 후에도 만료 가능성이 있어 장기 영구 호스팅과 혼동하지 않는다.


## 완전 무료 표지 제작 및 원본 재생 (V3.4 r19)
- 추가 비용이 드는 Apify Actor 재실행, 예약 실행, 새 유료 API 호출을 사용하지 않는다. 기존 `.github/workflows/instagram-thumbnail-sync.yml`은 오프라인 데이터·썸네일 매칭 검사만 수행한다.
- 썸네일이 없는 카드의 표지/무료 미리보기 버튼을 누르면 해당 게시물 URL에서 파생한 **공식 Instagram 임베드**를 필요할 때만 불러온다. 외부 삽입이 차단되거나 로그인 요구 시 원본 릴스 링크로 이동한다. 자체 영상 파일을 호스팅하거나 임의로 재생을 보장하지 않는다.
- 공개 게시물에서 캡처 사용 권한을 확인한 경우 사용자가 직접 확보한 원본 게시물 스크린샷을 9:16으로 잘라 제공할 수 있다. 유사 상품 사진, 다른 게시물의 화면, 무단으로 얻은 파일은 대신 사용하지 않는다.
- `node scripts/register-instagram-capture.mjs DdJJLFShWgQ ./captures/DdJJLFShWgQ.png --use-approved`처럼 원본 shortcode와 이미지 파일을 함께 지정하면 `assets/instagram/<shortcode>.<ext>`에 저장하고 정확히 매칭되는 1개 상품의 썸네일 필드만 갱신한다. `--use-approved`는 제출자가 사이트 사용에 필요한 이미지 이용 승인을 확인했다는 의미다.
- 아직 캡처하지 못한 항목은 기본 표지와 무료 원본 플레이어를 사용한다. 해당 항목을 완료 처리하거나 가상의 제품 사진으로 채우지 않는다.

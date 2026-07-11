# 부동산 모니터

관심 자산의 매매·전월세·임장·뉴스·거시 변수를 한 화면에서 보는 개인용 모니터링 앱입니다.

## 실행

국토부 API 프록시가 필요하므로 아래 Node 서버로 실행합니다.

```bash
MOLIT_SERVICE_KEY=공공데이터포털_서비스키 HOST=127.0.0.1 PORT=4177 node server.mjs
```

도커로 실행하려면:

```bash
docker build -t real-estate-monitor .
docker run --rm -p 4177:4177 \
  -e MOLIT_SERVICE_KEY=공공데이터포털_서비스키 \
  real-estate-monitor
```

Vercel로 배포할 때는 저장소를 연결한 뒤 프로젝트 환경변수에 `MOLIT_SERVICE_KEY`를 넣으면 됩니다. 정적 파일은 루트에서 서빙되고, `/api/news`와 `/api/molit/*`는 Vercel Serverless Function이 처리합니다.

복구 이메일을 Supabase Edge Function으로 보낼 때는 Vercel과 Supabase에 아래 값을 설정합니다.

- Vercel: `SUPABASE_RECOVERY_URL`, `RECOVERY_SHARED_SECRET`
- Supabase: `RESEND_API_KEY`, `RECOVERY_FROM_EMAIL`, `RECOVERY_SHARED_SECRET`

Supabase 프로젝트 ID는 `pyvnpynvvkyrkrtpeyzt`이고, 함수 설정은 `supabase/config.toml`에 있습니다.

Supabase CLI로 함수만 배포할 때는:

```bash
supabase functions deploy admin-recovery --project-ref pyvnpynvvkyrkrtpeyzt
```

## 현재 포함된 기능

- 랜딩과 앱 분리
- 모바일 우선 대시보드
- 관심 자산 지도와 마커 표시
- 관심 목록 페이지 분리, 검색, 편집, 삭제
- 임장 기록 페이지 분리, 사진 업로드, 메모, 평점 저장
- 실거래/전월세 시세 표시와 12개월 흐름 그래프
- 관심 자산 중심 뉴스 모니터링
- 정책, 금리, 환율 같은 거시 신호 모니터링
- Admin 잠금, 비밀번호 찾기, 임시 비밀번호 복구
- gb_r001 기반 입지 점수와 근거 보기
- 브라우저 `localStorage` 저장

## gb_r001 확인 결과

다운로드 폴더의 `gb_r001.zip`, `gb_r001_테이블정의서.xlsx`를 확인했습니다.

- 데이터명: 서울특별시 청년 1인 가구를 위한 주택 입지 선정 모델 분석
- 형식: Shapefile
- 공간 범위: `126.9184,37.5610 - 126.9435,37.5841`
- 레코드 수: 4,415개 폴리곤
- 주요 컬럼:
  - `USG_SCR`: 용도지역 점수
  - `PLD_DST`: 경찰관서 거리
  - `UNV_DST`: 대학교 거리
  - `SBW_DST`: 지하철역 거리
  - `PLC_SCR`: 경찰관서 점수
  - `UNV_SCR`: 대학교 점수
  - `TOT_SCR`: 총점

이 데이터는 실거래가가 아니라 입지 적합도 레이어입니다. 그래서 가격 데이터 소스로 쓰기보다는 관심 자산의 입지 평가, 임장 체크, 필터링 점수로 반영하는 것이 적합합니다.

## Supabase가 꼭 필요한가?

필수는 아닙니다. Supabase는 인증, Postgres, 파일 저장, Edge Function, 스케줄 작업을 빨리 붙일 수 있어서 추천 후보였을 뿐입니다.

운영 단계 선택지는 다음과 같습니다.

- 빠른 MVP: `localStorage` 또는 단일 SQLite
- 개인용/소규모: SQLite + 백엔드 서버
- 운영용: PostgreSQL 직접 운영
- 운영 속도 우선: Supabase, Neon, Railway, Render 같은 관리형 Postgres

이번 MVP는 특정 DB에 묶이지 않도록 프론트 데이터 모델을 먼저 잡았습니다. 다음 단계에서 백엔드를 붙이면 `localStorage` 저장부만 API 호출로 교체하면 됩니다.

## 기본 보안 설정

현재 정적 MVP에 반영된 보안:

- Admin 패스코드 잠금
- 패스코드 원문 미저장, 브라우저 Web Crypto 기반 SHA-256 해시 저장
- 로그인 실패 5회 시 5분 제한
- Admin 해제 후 10분 자동 잠금
- 브라우저 탭 숨김 시 Admin 자동 잠금
- 국토부/VWorld API 키 입력 필드 마스킹
- CSP, Referrer Policy 메타 태그 적용
- 서비스키는 코드와 문서에 저장하지 않음

로컬에서만 자동 입력이 필요하면 `private-config.js`에 값을 둘 수 있습니다. 이 파일은 `.gitignore`에 포함되어 있으며, 배포 저장소에는 올리지 않아야 합니다.

한계:

- `localStorage`는 같은 브라우저 사용자에게는 노출될 수 있습니다.
- 정적 프론트만으로는 서버 침입, 권한 우회, API 키 탈취를 완전히 막을 수 없습니다.

운영 단계 필수 보안:

- 백엔드 인증 세션
- 관리자/조회자 권한 분리
- API 키 서버 환경변수 보관
- DB Row-Level 권한 또는 서버 측 접근 제어
- 감사 로그
- HTTPS 배포
- 백업과 복구 정책

## 데이터 연동

현재 앱은 아래 소스를 연결합니다.

- `Kakao Map JavaScript API`
  - 로컬 테스트 도메인 `http://127.0.0.1:4177`을 카카오 개발자 콘솔의 JavaScript SDK 도메인에 등록해야 합니다.
  - 관심 자산 위도/경도 기준으로 마커를 표시합니다.
- `국토교통부_아파트 매매 실거래가 상세 자료`
  - 엔드포인트: `https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev`
  - 용도: 최근 매매 시세, 거래일, 층, 면적, 건축년도 반영
- `국토교통부_아파트 전월세 실거래가 자료`
  - 엔드포인트: `https://apis.data.go.kr/1613000/RTMSDataSvcAptRent`
  - 용도: 전세보증금, 월세, 임대차 흐름 반영
- `VWorld 시군구 경계 / 지도`
  - 경계 데이터: `https://api.vworld.kr/req/data`
  - 지도 타일: `https://api.vworld.kr/req/wmts/1.0.0/{key}/Base/{z}/{y}/{x}.png`
- `gb_r001`
  - 서울 일부 영역의 입지 점수 데이터셋
  - 상세 화면에서 근거 버튼으로 점수 출처와 수치를 볼 수 있습니다

권장 구조:

```text
Frontend
  -> Backend API
    -> 국토부 OpenAPI
    -> DB 저장
    -> 가격 변화 계산
    -> 알림 생성
```

## 운영 메모

- 복구 이메일은 Supabase Edge Function을 통해 보냅니다.
- `mybudongsan26.vercel.app`는 Vercel alias로 최신 배포를 가리킵니다.
- 뉴스와 거시는 오래된 항목을 자동 정리합니다.
- 임장 사진은 업로드 시 압축하고 저장합니다.

# 부동산 모니터 MVP

지도 기반 관심 부동산 모니터링, 임장 기록, admin 입력/편집, 가격/뉴스 알림 흐름을 확인하기 위한 프론트 MVP입니다.

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

## 현재 포함된 기능

- 대시보드: 관심 자산 수, 평균 변동률, 미확인 알림, 임장 완료 수
- 지도 화면: 관심 자산 위치 표시, 가격 변동 기준 초과 시 강조
- Kakao 지도: Kakao Map JavaScript API 위에 관심 자산 마커 표시
- VWorld 지도: Kakao 키가 없을 때 VWorld WMTS Base 타일 fallback
- 관심 목록: 검색, 편집, 삭제
- 임장 기록: 방문일, 점수, 체크 메모 저장
- 알림: 가격 변동/뉴스/임장 업데이트 알림
- Admin: 자산 정보, 임장 정보, 국토부 API 키, 뉴스 키워드, 알림 기준 입력
- 국토부 매매/전월세 API 설정: 법정동 코드, 계약년월, 엔드포인트 관리
- gb_r001 반영: 청년 1인 가구 입지 적합도 점수와 지하철역 거리 필드
- 데이터 저장: 브라우저 `localStorage`

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

## 국토부 데이터 연동 계획

국토교통부 실거래가 API는 공공데이터포털 서비스키가 필요합니다. 현재 화면에는 키 입력과 저장 기능만 있고, 실제 호출은 다음 단계에서 백엔드 프록시로 붙이는 것이 안전합니다.

브라우저에서 직접 서비스키를 노출하지 않는 구성이 필요합니다.

현재 반영한 API:

- `Kakao Map JavaScript API`
  - Kakao 키가 있으면 우선 사용합니다.
  - 로컬 테스트 도메인 `http://127.0.0.1:4177`을 카카오 개발자 콘솔의 JavaScript SDK 도메인에 등록해야 합니다.
  - 관심 자산 위도/경도 기준으로 마커와 가격 라벨을 표시합니다.
- `국토교통부_아파트 매매 실거래가 상세 자료`
  - 엔드포인트: `https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev`
  - 조회 기준: `LAWD_CD`, `DEAL_YMD`
  - 용도: 최근 매매가, 거래일, 층, 면적, 건축년도 반영
- `국토교통부_아파트 전월세 실거래가 자료`
  - 엔드포인트: `https://apis.data.go.kr/1613000/RTMSDataSvcAptRent`
  - 조회 기준: `LAWD_CD`, `DEAL_YMD`
  - 용도: 전세보증금, 월세, 임대차 거래 흐름 반영
- `VWorld 시군구 경계 / 지도`
  - 지도 타일: `https://api.vworld.kr/req/wmts/1.0.0/{key}/Base/{z}/{y}/{x}.png`
  - 경계 데이터: `https://api.vworld.kr/req/data`
  - 기준 코드: `sig_cd`
  - 국토부 `LAWD_CD` 앞 5자리와 연결해 시군구 단위로 지도/실거래를 맞춥니다.

권장 구조:

```text
Frontend
  -> Backend API
    -> 국토부 OpenAPI
    -> DB 저장
    -> 가격 변화 계산
    -> 알림 생성
```

## 다음 구현 후보

- Node/Express 또는 Next.js 백엔드 추가
- 국토부 실거래가 API 실제 호출
- Kakao Map 또는 VWorld 지도 SDK 연결
- Postgres/SQLite 스키마 추가
- 이메일, 텔레그램, 카카오 알림톡 중 하나로 알림 발송

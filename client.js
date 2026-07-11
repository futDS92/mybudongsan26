const STORAGE_KEY = "realEstateMonitor:v1";
const DEFAULT_ADMIN_PASSCODE = "jeongmin";
const DEFAULT_ADMIN_PASSCODE_SALT = "real-estate-monitor-default";
const DEFAULT_ADMIN_PASSCODE_HASH = "6b57bcdfa656ac8f8ea31de5cd889b3cb365d1d52a4e3e74aef5523546f9381e";
const DEFAULT_RECOVERY_NAME = "";
const DEFAULT_RECOVERY_EMAIL = "";
const DEFAULT_TEMP_PASSCODE_HASH = "";
const DEFAULT_TEMP_PASSCODE_SALT = "";
const DEFAULT_TEMP_PASSCODE_EXPIRES_AT = 0;
const NEWS_RETENTION_HOURS = 48;
const MACRO_RETENTION_HOURS = 24;
const NEWS_MAX_ITEMS = 8;
const MACRO_MAX_ITEMS = 5;
const LOCATION_SCORE_MODEL_VERSION = 4;
const BUILT_IN_PRIVATE_CONFIG = {
  molitKey: "960e7b9c681010f60dfea81ec847bf36a664e995219611319701b453bf07433a",
  kakaoKey: "a706a5e96fa435d168f1dfc6a32d6fe1",
  vworldKey: "05C7C6D0-0CAA-368A-B0ED-B52E6EEDA8F7",
  vworldDomain: window.location.origin,
};
let privateConfig = {
  ...BUILT_IN_PRIVATE_CONFIG,
  ...(window.REM_PRIVATE_CONFIG || {}),
};

const defaultState = {
  sourceDatasets: [
    {
      id: "gb_r001",
      name: "서울특별시 청년 1인 가구를 위한 주택 입지 선정",
      records: 4415,
      bbox: "126.9184,37.5610 - 126.9435,37.5841",
      totalScoreAverage: 4.18,
      totalScoreMax: 8.1,
      columns: ["USG_SCR", "PLD_DST", "UNV_DST", "SBW_DST", "PLC_SCR", "UNV_SCR", "TOT_SCR"],
    },
    {
      id: "molit_apt_trade_dev",
      name: "국토교통부_아파트 매매 실거래가 상세 자료",
      endpoint: "https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev",
      format: "REST/XML",
      query: ["serviceKey", "LAWD_CD", "DEAL_YMD", "pageNo", "numOfRows"],
      columns: ["아파트", "거래금액", "전용면적", "계약년월일", "층", "건축년도", "법정동"],
    },
    {
      id: "molit_apt_rent",
      name: "국토교통부_아파트 전월세 실거래가 자료",
      endpoint: "https://apis.data.go.kr/1613000/RTMSDataSvcAptRent",
      format: "REST/XML",
      query: ["serviceKey", "LAWD_CD", "DEAL_YMD", "pageNo", "numOfRows"],
      columns: ["아파트", "보증금액", "월세금액", "전용면적", "계약년월일", "층", "법정동"],
    },
    {
      id: "vworld_sigungu_boundary",
      name: "VWorld 시군구 경계",
      provider: "행정안전부",
      version: "2.0",
      updatedAt: "2026-06-15",
      endpoint: "https://api.vworld.kr/req/data",
      data: "LT_C_ADSIGG_INFO",
      operation: "GetFeature",
      format: "json",
      crs: "EPSG:4326",
      keyColumn: "sig_cd",
      columns: ["sig_cd", "full_nm", "sig_kor_nm", "sig_eng_nm", "ag_geom"],
    },
  ],
    settings: {
      molitKey: BUILT_IN_PRIVATE_CONFIG.molitKey,
      kakaoKey: BUILT_IN_PRIVATE_CONFIG.kakaoKey,
      vworldKey: BUILT_IN_PRIVATE_CONFIG.vworldKey,
      vworldDomain: BUILT_IN_PRIVATE_CONFIG.vworldDomain,
      interestRegion: "전체",
      interestPriceMin: 40000,
      interestPriceMax: 100000,
      interestRadiusKm: 15,
      dealMonth: new Date().toISOString().slice(0, 7).replace("-", ""),
      molitEndpoint: "https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev",
      rentEndpoint: "https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent",
      vworldEndpoint: "https://api.vworld.kr/req/data",
      newsEndpoint: "/api/news",
      alertThreshold: 3,
      recoveryName: DEFAULT_RECOVERY_NAME,
      recoveryEmail: DEFAULT_RECOVERY_EMAIL,
    },
  security: {
    passcodeHash: DEFAULT_ADMIN_PASSCODE_HASH,
    salt: DEFAULT_ADMIN_PASSCODE_SALT,
    failedAttempts: 0,
    lockedUntil: 0,
    tempPasscodeHash: DEFAULT_TEMP_PASSCODE_HASH,
    tempPasscodeSalt: DEFAULT_TEMP_PASSCODE_SALT,
    tempPasscodeExpiresAt: DEFAULT_TEMP_PASSCODE_EXPIRES_AT,
    resetRequired: false,
  },
  properties: [
    {
      id: "p-1",
      name: "래미안 원베일리",
      region: "서울 서초구 반포동",
      type: "아파트",
      area: 84.95,
      baseArea: 84.95,
      price: 585000,
      lastTradeDate: "2026-06-12",
      lastTradeFloor: 12,
      buildYear: 2016,
      rentDeposit: 210000,
      monthlyRent: 0,
      change: 4.2,
      fitScore: 5.1,
      subwayDistance: 620,
      tags: ["한강변", "학군", "역세권"],
      risk: "호가 과열 구간. 최근 거래가 적어 추세 확인 필요.",
      lat: 37.5038,
      lng: 127.0026,
      x: 42,
      y: 44,
    },
    {
      id: "p-2",
      name: "광명 센트럴 아이파크",
      region: "경기 광명시 광명동",
      type: "아파트",
      area: 59.99,
      baseArea: 59.99,
      price: 94500,
      lastTradeDate: "2026-06-05",
      lastTradeFloor: 18,
      buildYear: 2025,
      rentDeposit: 52000,
      monthlyRent: 120,
      change: -1.8,
      fitScore: 4.7,
      subwayDistance: 810,
      tags: ["뉴타운", "신축", "교통"],
      risk: "입주 물량과 전세가 흐름 확인 필요.",
      lat: 37.4782,
      lng: 126.8648,
      x: 33,
      y: 59,
    },
    {
      id: "p-3",
      name: "마포 래미안 푸르지오",
      region: "서울 마포구 아현동",
      type: "아파트",
      area: 84.39,
      baseArea: 84.39,
      price: 193000,
      lastTradeDate: "2026-05-28",
      lastTradeFloor: 9,
      buildYear: 2014,
      rentDeposit: 105000,
      monthlyRent: 0,
      change: 2.1,
      fitScore: 6.8,
      subwayDistance: 540,
      tags: ["도심", "대단지", "학군"],
      risk: "주변 구축 대비 프리미엄 점검 필요.",
      lat: 37.5549,
      lng: 126.9566,
      x: 49,
      y: 39,
    },
    {
      id: "p-4",
      name: "성남단대푸르지오",
      region: "경기 성남시 수정구 단대동",
      type: "아파트",
      area: 84,
      baseArea: 84,
      price: 0,
      lastTradeDate: "",
      lastTradeFloor: 0,
      buildYear: "",
      rentDeposit: 0,
      monthlyRent: 0,
      change: 0,
      fitScore: 0,
      subwayDistance: 0,
      tags: ["성남", "단대동", "관심단지"],
      aliases: ["단대푸르지오", "성남 단대 푸르지오", "단대동 푸르지오", "성남단대푸르지오", "단대푸르지오아파트"],
      expectedDistricts: ["성남", "단대동", "수정구"],
      risk: "실거래와 임장 정보 입력 필요.",
      lat: 37.45087954363311,
      lng: 127.15808636824087,
      coordsSource: "vworld",
      x: 52,
      y: 52,
    },
    {
      id: "p-5",
      name: "단대동진로아파트",
      region: "경기 성남시 수정구 단대동",
      type: "아파트",
      area: 84,
      baseArea: 84,
      price: 0,
      lastTradeDate: "",
      lastTradeFloor: 0,
      buildYear: "",
      rentDeposit: 0,
      monthlyRent: 0,
      change: 0,
      fitScore: 0,
      subwayDistance: 0,
      tags: ["성남", "단대동", "관심단지"],
      aliases: ["진로", "진로아파트 단대동", "성남 진로아파트", "단대동 진로", "성남단대동진로아파트", "단대동진로아파트"],
      expectedDistricts: ["성남", "단대동", "수정구"],
      risk: "실거래와 임장 정보 입력 필요.",
      lat: 37.45095971355684,
      lng: 127.15594337792555,
      coordsSource: "vworld",
      x: 54,
      y: 54,
    },
    {
      id: "p-6",
      name: "성남코오롱하늘채아파트",
      region: "경기 성남시 수정구 단대동",
      type: "아파트",
      area: 84,
      baseArea: 84,
      price: 0,
      lastTradeDate: "",
      lastTradeFloor: 0,
      buildYear: "",
      rentDeposit: 0,
      monthlyRent: 0,
      change: 0,
      fitScore: 0,
      subwayDistance: 0,
      tags: ["성남", "관심단지"],
      aliases: ["코오롱하늘채", "코오롱하늘채아파트 성남", "성남 코오롱하늘채", "성남코오롱하늘채", "성남코오롱하늘채아파트", "코오롱하늘채아파트"],
      expectedDistricts: ["성남", "수정구", "단대동"],
      risk: "실거래와 임장 정보 입력 필요.",
      lat: 37.452337442310295,
      lng: 127.15733838124366,
      coordsSource: "vworld",
      x: 56,
      y: 52,
    },
    {
      id: "p-7",
      name: "한보미도아파트",
      region: "경기 성남시 수정구 단대동",
      type: "아파트",
      area: 84,
      baseArea: 84,
      price: 0,
      lastTradeDate: "",
      lastTradeFloor: 0,
      buildYear: "",
      rentDeposit: 0,
      monthlyRent: 0,
      change: 0,
      fitScore: 0,
      subwayDistance: 0,
      tags: ["성남", "단대동", "관심단지"],
      aliases: ["미도", "한보미도", "성남 한보미도", "단대동 미도", "성남한보미도", "한보미도아파트"],
      expectedDistricts: ["성남", "단대동", "수정구"],
      risk: "실거래와 임장 정보 입력 필요.",
      lat: 37.447066621224074,
      lng: 127.15581904339015,
      coordsSource: "vworld",
      x: 58,
      y: 54,
    },
    {
      id: "p-8",
      name: "은행동현대아파트",
      region: "경기 성남시 중원구 은행동",
      type: "아파트",
      area: 84,
      baseArea: 84,
      price: 0,
      lastTradeDate: "",
      lastTradeFloor: 0,
      buildYear: "",
      rentDeposit: 0,
      monthlyRent: 0,
      change: 0,
      fitScore: 0,
      subwayDistance: 0,
      tags: ["성남", "은행동", "관심단지"],
      aliases: ["현대", "현대아파트 은행동", "성남 은행동 현대아파트", "은행동 현대", "은행동현대", "은행동현대아파트", "성남은행동현대", "성남은행동현대아파트"],
      expectedDistricts: ["성남", "은행동", "중원구"],
      risk: "실거래와 임장 정보 입력 필요.",
      lat: 37.45193141722581,
      lng: 127.1635766269807,
      coordsSource: "vworld",
      x: 60,
      y: 56,
    },
  ],
  visits: [
    {
      id: "v-1",
      propertyId: "p-2",
      date: "2026-06-18",
      score: 4,
      note: "역 접근성은 양호. 단지 주변 공사 차량과 소음은 주말 재확인 필요.",
    },
  ],
  alerts: [
    {
      id: "a-1",
      propertyId: "p-1",
      type: "price",
      title: "30일 변동률 4.2% 감지",
      body: "설정 기준 3%를 초과했습니다. 최근 실거래 샘플을 확인하세요.",
      at: "2026-06-21 09:30",
      read: false,
    },
    {
      id: "a-2",
      propertyId: "p-3",
      type: "news",
      title: "아현동 정비사업 뉴스 감지",
      body: "관심 자산과 매칭된 뉴스가 수집되었습니다.",
      at: "2026-06-20 17:10",
      read: true,
    },
  ],
  monitorSummary: {
    tradeCount: 0,
    rentCount: 0,
    matchedCount: 0,
    backfillCount: 0,
    lastRunAt: "",
  },
  monitoring: {
    active: false,
    phase: "대기 중",
    detail: "모니터링을 실행하면 진행 상태가 표시됩니다.",
    progress: 0,
    lastRunAt: "",
    status: "idle",
  },
  macro: {
    loading: false,
    lastRunAt: "",
    fx: null,
    signals: [],
  },
  propertyTradeHistory: {},
  propertyRentHistory: {},
  news: [],
  timeline: [
    {
      id: "t-1",
      propertyId: "p-1",
      kind: "실거래",
      text: "84.95㎡ 58.5억 거래 샘플 반영",
      at: "2026-06-21",
    },
    {
      id: "t-2",
      propertyId: "p-3",
      kind: "뉴스",
      text: "아현동 관심 자산 뉴스 수집",
      at: "2026-06-20",
    },
  ],
};

let state = null;
let adminUnlocked = false;
let adminAutoLockTimer = null;
let securityRecoveryOpen = false;
let securityRecoverySending = false;
let kakaoSdkPromise = null;
let kakaoMap = null;
let kakaoMarkers = [];
let detailPropertyId = null;
let detailSelectedArea = null;
let propertyPage = 1;
let visitPage = 1;
let newsRequestSeq = 0;
let deviceResizeTimer = null;
let batchRefreshTimer = null;
let hostMode = false;
let locationScoreDatasetsPromise = null;
let locationScoreDatasets = null;
const deviceState = {
  profile: "",
};
const mapState = {
  centerLat: 37.4979,
  centerLng: 127.0276,
  zoom: 10,
};

const views = {
  dashboard: {
    title: "대시보드",
    subtitle: "관심 부동산의 가격, 뉴스, 임장 상태를 한 화면에서 확인합니다.",
    el: document.querySelector("#dashboardView"),
  },
  watchlist: {
    title: "관심 목록",
    subtitle: "매수 후보를 비교하고 가격 변화와 리스크 메모를 관리합니다.",
    el: document.querySelector("#watchlistView"),
  },
  field: {
    title: "임장 기록",
    subtitle: "방문 기록과 현장 체크 내용을 자산별로 누적합니다.",
    el: document.querySelector("#fieldView"),
  },
  alerts: {
    title: "알림",
    subtitle: "가격, 뉴스, 임장 업데이트의 변경 신호를 모읍니다.",
    el: document.querySelector("#alertsView"),
  },
  admin: {
    title: "Admin",
    subtitle: "관심 자산, 임장 정보, 외부 API 설정을 직접 입력하고 편집합니다.",
    el: document.querySelector("#adminView"),
  },
  recovery: {
    title: "비밀번호 찾기",
    subtitle: "관리자 이름과 이메일로 임시 비밀번호를 받습니다.",
    el: document.querySelector("#recoveryView"),
  },
};

document.addEventListener("DOMContentLoaded", async () => {
  await hydratePrivateConfig();
  state = loadState();
  hostMode = isHostMode();
  document.documentElement.dataset.host = hostMode ? "toss" : "web";
  document.body.dataset.host = hostMode ? "toss" : "web";
  updateDeviceProfile();
  bindNavigation();
  bindForms();
  render();
  await rebuildLocationScores();
  render();
  setTimeout(() => {
    void runMonitor();
  }, 150);
  startBatchRefresh();
  window.addEventListener("resize", scheduleDeviceProfileUpdate);
  window.addEventListener("orientationchange", scheduleDeviceProfileUpdate);
  window.visualViewport?.addEventListener("resize", scheduleDeviceProfileUpdate);
  window.addEventListener("pageshow", () => {
    if (document.querySelector("#dashboardView")?.classList.contains("active")) {
      window.requestAnimationFrame(() => renderMap());
    }
  });
});

async function hydratePrivateConfig() {
  if (privateConfig?.molitKey || privateConfig?.kakaoKey || privateConfig?.vworldKey) return;
  try {
    const response = await fetch("/api/config", { headers: { Accept: "application/json" } });
    if (!response.ok) return;
    const payload = await response.json();
    privateConfig = {
      ...privateConfig,
      ...payload,
      vworldDomain: payload.vworldDomain || privateConfig.vworldDomain || window.location.origin,
    };
    window.REM_PRIVATE_CONFIG = privateConfig;
  } catch {
    // 배포 환경에서만 쓰는 보조 경로다. 실패해도 기존 동작을 유지한다.
  }
}

function updateDeviceProfile() {
  const profile = getDeviceProfile();
  if (deviceState.profile === profile) return false;
  deviceState.profile = profile;
  document.documentElement.dataset.device = profile;
  document.body.dataset.device = profile;
  return true;
}

function scheduleDeviceProfileUpdate() {
  window.clearTimeout(deviceResizeTimer);
  deviceResizeTimer = window.setTimeout(() => {
    const changed = updateDeviceProfile();
    if (changed) render();
    else renderMap();
  }, 120);
}

function isHostMode() {
  const path = window.location.pathname || "";
  const host = new URLSearchParams(window.location.search).get("host");
  return path === "/toss" || path === "/miniapp" || host === "toss";
}

function getDeviceProfile() {
  const width = window.innerWidth || document.documentElement.clientWidth || 1280;
  if (width <= 720) return "mobile";
  if (width <= 1120) return "laptop";
  return "desktop";
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return withPrivateConfig(structuredClone(defaultState));
  try {
    const parsed = JSON.parse(raw);
    const nextState = withPrivateConfig({
      ...structuredClone(defaultState),
      ...parsed,
      settings: {
        ...structuredClone(defaultState.settings),
        ...parsed.settings,
      },
      security: {
        ...structuredClone(defaultState.security),
        ...parsed.security,
        passcodeHash: parsed.security?.passcodeHash || defaultState.security.passcodeHash,
        salt: parsed.security?.salt || defaultState.security.salt,
        tempPasscodeHash: parsed.security?.tempPasscodeHash || defaultState.security.tempPasscodeHash,
        tempPasscodeSalt: parsed.security?.tempPasscodeSalt || defaultState.security.tempPasscodeSalt,
        tempPasscodeExpiresAt: parsed.security?.tempPasscodeExpiresAt || defaultState.security.tempPasscodeExpiresAt,
        resetRequired: Boolean(parsed.security?.resetRequired || defaultState.security.resetRequired),
      },
      propertyTradeHistory: parsed.propertyTradeHistory || {},
      propertyRentHistory: parsed.propertyRentHistory || {},
      news: parsed.news || structuredClone(defaultState.news),
      monitorSummary: {
        ...structuredClone(defaultState.monitorSummary),
        ...parsed.monitorSummary,
      },
      monitoring: {
        ...structuredClone(defaultState.monitoring),
        ...parsed.monitoring,
      },
      macro: {
        ...structuredClone(defaultState.macro),
        ...parsed.macro,
      },
      sourceDatasets: mergeById(defaultState.sourceDatasets, parsed.sourceDatasets || []),
    });
    return pruneEphemeralCollections(nextState);
  } catch {
    return withPrivateConfig(structuredClone(defaultState));
  }
}

function withPrivateConfig(nextState) {
  nextState.settings = {
    ...nextState.settings,
    molitKey: nextState.settings.molitKey || privateConfig.molitKey || "",
    kakaoKey: nextState.settings.kakaoKey || privateConfig.kakaoKey || "",
    vworldKey: nextState.settings.vworldKey || privateConfig.vworldKey || "",
    vworldDomain: nextState.settings.vworldDomain || privateConfig.vworldDomain || "",
  };
  nextState.properties = hydrateProperties(mergeTrackedProperties(nextState.properties || []));
  return nextState;
}

function mergeTrackedProperties(properties) {
  const byName = new Map(properties.map((property) => [property.name, property]));
  const byNormalizedName = new Map(properties.map((property) => [normalizeText(property.name), property]));
  const tracked = defaultState.properties.filter((property) => property.tags?.includes("관심단지"));
  const missing = tracked.filter((property) => !byName.has(property.name) && !byNormalizedName.has(normalizeText(property.name)));
  return [...properties, ...missing];
}

function hydrateProperties(properties) {
  return properties.map((property, index) => {
    const defaultMatch = defaultState.properties.find((item) => (
      item.id === property.id || item.name === property.name || normalizeText(item.name) === normalizeText(property.name)
    ));
    const fallback = fallbackCoordinate(index);
    const hasStoredCoordinate = Boolean(property.lat && property.lng);
    const isDefaultTracked = Boolean(defaultMatch?.tags?.includes("관심단지"));
    const shouldUseDefaultCoordinate = Boolean(
      isDefaultTracked
      && defaultMatch?.lat
      && defaultMatch?.lng
      && property.coordsSource !== "manual"
      && property.coordsSource !== "kakao"
    );
    return {
      ...defaultMatch,
      ...property,
      region: isDefaultTracked && property.coordsSource !== "manual" ? defaultMatch.region : property.region,
      lat: shouldUseDefaultCoordinate ? defaultMatch.lat : property.lat || defaultMatch?.lat || fallback.lat,
      lng: shouldUseDefaultCoordinate ? defaultMatch.lng : property.lng || defaultMatch?.lng || fallback.lng,
      coordsSource: shouldUseDefaultCoordinate ? defaultMatch.coordsSource : property.coordsSource || defaultMatch?.coordsSource || (hasStoredCoordinate ? "stored" : "fallback"),
      fitScoreSource: property.fitScoreSource || defaultMatch?.fitScoreSource || "",
      aliases: isDefaultTracked ? defaultMatch.aliases || [] : property.aliases || defaultMatch?.aliases || [],
      expectedDistricts: isDefaultTracked ? defaultMatch.expectedDistricts || [] : property.expectedDistricts || defaultMatch?.expectedDistricts || [],
      tags: sanitizeTags(isDefaultTracked ? defaultMatch.tags || [] : property.tags || defaultMatch?.tags || []),
      masterId: defaultMatch?.id || property.masterId || property.id,
      masterName: defaultMatch?.name || property.masterName || property.name,
      locationEvidence: shouldResetLocationEvidence(property) ? null : property.locationEvidence || null,
      locationScore: shouldResetLocationEvidence(property) ? null : property.locationScore || null,
      gbR001: shouldResetLocationEvidence(property) ? null : property.gbR001 || null,
      fitScoreSource: shouldResetLocationEvidence(property) ? "" : property.fitScoreSource || defaultMatch?.fitScoreSource || "",
      fitScore: shouldResetLocationEvidence(property) ? 0 : property.fitScore,
    };
  });
}

function shouldResetLocationEvidence(property) {
  const version = Number(property?.locationEvidence?.modelVersion || 0);
  if (version && version >= LOCATION_SCORE_MODEL_VERSION) return false;
  return Boolean(property?.locationEvidence || property?.locationScore || property?.gbR001 || property?.fitScoreSource);
}

function sanitizeTags(tags) {
  return [...new Set((tags || []).filter((tag) => tag && tag !== "검색추가"))];
}

function fallbackCoordinate(index) {
  return {
    lat: 37.515 + ((index % 3) - 1) * 0.012,
    lng: 126.955 + ((index % 4) - 1.5) * 0.018,
  };
}

function mergeById(defaultItems, storedItems) {
  const storedById = new Map(storedItems.map((item) => [item.id, item]));
  const merged = defaultItems.map((item) => ({ ...item, ...storedById.get(item.id) }));
  const extra = storedItems.filter((item) => !defaultItems.some((defaultItem) => defaultItem.id === item.id));
  return [...merged, ...extra];
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(pruneEphemeralCollections(state)));
}

function pruneEphemeralCollections(nextState) {
  const pruned = nextState;
  const now = Date.now();
  const newsCutoff = now - NEWS_RETENTION_HOURS * 60 * 60 * 1000;
  const macroCutoff = now - MACRO_RETENTION_HOURS * 60 * 60 * 1000;
  if (Array.isArray(pruned.news)) {
    pruned.news = pruned.news
      .filter((item) => {
        const timestamp = newsTimestamp(item?.at);
        return Number.isFinite(timestamp) ? timestamp >= newsCutoff : true;
      })
      .slice(0, NEWS_MAX_ITEMS)
      .map((item) => ({
        ...item,
        summary: String(item.summary || "").slice(0, 180),
        title: String(item.title || "").slice(0, 120),
      }));
  }
  if (pruned.macro) {
    const signals = Array.isArray(pruned.macro.signals) ? pruned.macro.signals : [];
    pruned.macro = {
      ...pruned.macro,
      signals: signals
        .filter((signal) => {
          const timestamp = newsTimestamp(signal?.at);
          return Number.isFinite(timestamp) ? timestamp >= macroCutoff : true;
        })
        .slice(0, MACRO_MAX_ITEMS)
        .map((signal) => ({
          ...signal,
          summary: String(signal.summary || "").slice(0, 160),
          title: String(signal.title || "").slice(0, 120),
        })),
    };
  }
  return pruned;
}

function newsTimestamp(value) {
  if (!value) return Number.NaN;
  const parsed = Date.parse(String(value).replace(/\./g, "-"));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function bindNavigation() {
  document.querySelectorAll("[data-view], [data-view-jump]").forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.view || button.dataset.viewJump;
      setView(view);
    });
  });

  document.querySelector("#watchSearch").addEventListener("input", () => {
    propertyPage = 1;
    renderProperties();
  });
  document.querySelector("#mapSearchButton").addEventListener("click", addMapSearchResult);
  document.querySelector("#mapSearch").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addMapSearchResult();
    }
  });
  document.querySelector("#detailRefreshButton")?.addEventListener("click", async () => {
    if (detailPropertyId) {
      await runMonitor();
      renderPropertyDetail();
    }
  });
  document.querySelector("#detailEvidenceTrigger")?.addEventListener("click", () => {
    if (detailPropertyId) openPropertyEvidence(detailPropertyId);
  });
  document.querySelectorAll("[data-close-detail]").forEach((button) => {
    button.addEventListener("click", closePropertyDetail);
  });
  document.querySelectorAll("[data-close-evidence]").forEach((button) => {
    button.addEventListener("click", closePropertyEvidence);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !document.querySelector("#evidenceModal").hidden) {
      closePropertyEvidence();
      return;
    }
    if (event.key === "Escape" && !document.querySelector("#detailModal").hidden) {
      closePropertyDetail();
    }
  });
  document.querySelector("#markReadButton").addEventListener("click", () => {
    state.alerts = state.alerts.map((alert) => ({ ...alert, read: true }));
    saveState();
    render();
  });
  document.querySelector("#runMonitorButton").addEventListener("click", () => {
    runMonitor();
  });
  document.addEventListener("change", handleFilterChange);
  document.addEventListener("click", handleFilterClick);
}

function setView(view) {
  Object.entries(views).forEach(([key, meta]) => {
    meta.el.classList.toggle("active", key === view);
  });
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === view);
  });
  document.body.classList.toggle("admin-light-shell", view === "admin");
  document.querySelector("#viewTitle").textContent = views[view].title;
  document.querySelector("#viewSubtitle").textContent = views[view].subtitle;
  renderTopActions(view);
  if (view === "dashboard") {
    window.requestAnimationFrame(() => renderMap());
  }
}

function bindForms() {
  document.querySelector("#propertyForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const id = document.querySelector("#propertyId").value || `p-${Date.now()}`;
    const existing = state.properties.find((property) => property.id === id);
    const tagsText = value("#propertyTags");
    const fitScoreText = value("#propertyFitScore");
    const subwayText = value("#propertySubwayDistance");
    const latText = value("#propertyLat");
    const lngText = value("#propertyLng");
    const riskText = value("#propertyRisk");
    const property = {
      ...(existing || {}),
      id,
      name: value("#propertyName"),
      region: value("#propertyRegion"),
      type: value("#propertyType"),
      area: Number(value("#propertyArea")),
      baseArea: Number(value("#propertyBaseArea") || value("#propertyArea") || existing?.baseArea || existing?.area || 84),
      price: Number(value("#propertyPrice")),
      lastTradeDate: existing?.lastTradeDate || "",
      lastTradeFloor: existing?.lastTradeFloor || 0,
      buildYear: existing?.buildYear || "",
      rentDeposit: existing?.rentDeposit || 0,
      monthlyRent: existing?.monthlyRent || 0,
      change: Number(value("#propertyChange")),
      fitScore: fitScoreText ? Number(fitScoreText) : Number(existing?.fitScore || 0),
      subwayDistance: subwayText ? Number(subwayText) : Number(existing?.subwayDistance || 0),
      lat: latText ? Number(latText) : Number(existing?.lat || fallbackCoordinate(state.properties.length).lat),
      lng: lngText ? Number(lngText) : Number(existing?.lng || fallbackCoordinate(state.properties.length).lng),
      tags: tagsText ? tagsText.split(",").map((tag) => tag.trim()).filter(Boolean) : existing?.tags || [],
      risk: riskText || existing?.risk || "",
      x: existing?.x || 28 + Math.random() * 48,
      y: existing?.y || 28 + Math.random() * 42,
    };
    await applyLocationScore(property, {
      preserveFitScore: Boolean(fitScoreText),
      preserveSubwayDistance: Boolean(subwayText),
    });

    state.properties = existing
      ? state.properties.map((item) => (item.id === id ? property : item))
      : [...state.properties, property];
    addTimeline(property.id, "편집", `${property.name} 정보가 저장되었습니다.`);
    saveState();
    clearPropertyForm();
    render();
  });

  document.querySelector("#clearPropertyButton").addEventListener("click", clearPropertyForm);

  document.querySelector("#visitForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const visit = {
      id: `v-${Date.now()}`,
      propertyId: value("#visitProperty"),
      date: value("#visitDate"),
      score: Number(value("#visitScore")),
      note: value("#visitNote"),
      photos: [],
    };
    const files = [...(document.querySelector("#visitPhotos").files || [])];
    readVisitPhotos(files).then((photos) => {
      visit.photos = photos;
      state.visits = [visit, ...state.visits];
      addTimeline(visit.propertyId, "임장", photos.length ? `새 임장 기록과 사진 ${photos.length}장이 저장되었습니다.` : "새 임장 기록이 저장되었습니다.");
      createAlert(visit.propertyId, "field", "임장 정보 업데이트", visit.note);
      saveState();
      event.target.reset();
      setToday();
      render();
    });
  });

  document.querySelector("#sourceForm").addEventListener("submit", (event) => {
    event.preventDefault();
    state.settings = {
      molitKey: value("#molitKey") || getEffectiveSetting("molitKey"),
      kakaoKey: value("#kakaoKey") || getEffectiveSetting("kakaoKey"),
      vworldKey: value("#vworldKey") || getEffectiveSetting("vworldKey"),
      vworldDomain: value("#vworldDomain") || getEffectiveSetting("vworldDomain") || window.location.origin,
      molitEndpoint: state.settings.molitEndpoint || defaultState.settings.molitEndpoint,
      rentEndpoint: state.settings.rentEndpoint || defaultState.settings.rentEndpoint,
      vworldEndpoint: state.settings.vworldEndpoint || defaultState.settings.vworldEndpoint,
      newsEndpoint: value("#newsEndpoint"),
      alertThreshold: Number(value("#alertThreshold") || 3),
      recoveryName: state.settings.recoveryName || defaultState.settings.recoveryName,
      recoveryEmail: state.settings.recoveryEmail || defaultState.settings.recoveryEmail,
    };
    saveState();
    render();
  });

  document.querySelector("#lockAdminButton")?.addEventListener("click", () => {
    lockAdmin();
  });
  document.querySelector("#showRecoveryButton")?.addEventListener("click", () => openRecoveryScreen());
  document.querySelector("#securityForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (state.security.resetRequired) {
      await saveNewAdminPasscode();
      return;
    }
    await unlockOrSetAdminPasscode();
  });
  document.querySelector("#backToAdminButton")?.addEventListener("click", () => {
    setView("admin");
  });
  document.querySelector("#recoveryForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    await sendRecoveryEmail();
  });
  document.querySelector("#saveNewPasscodeButton")?.addEventListener("click", () => {
    saveNewAdminPasscode();
  });
}

function value(selector) {
  return document.querySelector(selector).value.trim();
}

function render(options = {}) {
  const skipMap = Boolean(options.skipMap);
  renderTopActions(getActiveView());
  renderHostTabs();
  renderSettings();
  renderSecurity();
  renderFilterBars();
  renderMetrics();
  renderMonitorStatus();
  if (!skipMap) renderMap();
  renderToday();
  renderMacro();
  renderTimeline();
  renderNews();
  renderProperties();
  renderVisits();
  renderAlerts();
  renderAdminOptions();
}

function startBatchRefresh() {
  window.clearInterval(batchRefreshTimer);
  batchRefreshTimer = window.setInterval(() => {
    if (document.hidden) return;
    void runSignalBatch();
  }, 15 * 60 * 1000);
}

function renderSecurity() {
  const status = document.querySelector("#adminAccessStatus");
  const locked = !adminUnlocked;
  const activeView = getActiveView();
  const adminView = document.querySelector("#adminView");
  if (adminView) adminView.classList.toggle("locked", locked);
  const accessPanel = document.querySelector("#adminAccessPanel");
  const accessForm = document.querySelector("#securityForm");
  const accessActions = document.querySelector("#adminAccessActions");
  const recoveryProgress = document.querySelector("#recoveryProgress");
  const recoveryProgressTitle = document.querySelector("#recoveryProgressTitle");
  const recoveryProgressText = document.querySelector("#recoveryProgressText");
  const resetFields = document.querySelector("#securityResetFields");
  if (!locked && activeView !== "recovery") {
    securityRecoveryOpen = false;
    state.security.resetRequired = false;
  }
  if (resetFields) resetFields.hidden = !state.security.resetRequired;
  if (accessPanel) accessPanel.hidden = false;
  if (accessForm) accessForm.hidden = !locked;
  if (accessActions) accessActions.hidden = locked;
  if (recoveryProgress) {
    recoveryProgress.hidden = !securityRecoverySending && !state.security.tempPasscodeHash && !state.security.resetRequired;
    if (securityRecoverySending) {
      recoveryProgressTitle.textContent = "보내는 중";
      recoveryProgressText.textContent = "잠시만 기다려 주세요.";
    } else if (state.security.resetRequired) {
      recoveryProgressTitle.textContent = "임시 비밀번호 확인됨";
      recoveryProgressText.textContent = "이제 새 비밀번호를 설정하세요.";
    } else if (state.security.tempPasscodeHash) {
      recoveryProgressTitle.textContent = "대기 중";
      recoveryProgressText.textContent = "발송 결과를 확인하세요.";
    }
  }
  ["#propertyForm", "#visitForm", "#sourceForm", "#adminLogPanel"].forEach((selector) => {
    const panel = document.querySelector(selector);
    if (!panel) return;
    panel.hidden = locked;
  });
  if (status) {
    if (!locked) {
      status.textContent = "잠금 해제됨.";
    } else if (state.security.resetRequired) {
      status.textContent = "임시 비밀번호가 확인되었습니다.";
    } else if (securityRecoverySending) {
      status.textContent = "임시 비밀번호를 보내는 중입니다...";
    } else {
      status.textContent = "잠금 상태입니다.";
    }
  }
}

function setSecurityMessage(message) {
  const status = document.querySelector("#adminAccessStatus");
  if (status) status.textContent = message;
  const summary = document.querySelector("#recoverySummary");
  if (summary) summary.textContent = message;
}

function renderSettings() {
  syncEffectiveSettings();
  const locked = !adminUnlocked;
  const effectiveMolitKey = locked ? "" : getEffectiveSetting("molitKey");
  const effectiveKakaoKey = locked ? "" : getEffectiveSetting("kakaoKey");
  const effectiveVworldKey = locked ? "" : getEffectiveSetting("vworldKey");
  const effectiveVworldDomain = locked ? "" : (getEffectiveSetting("vworldDomain") || window.location.origin);
  document.querySelector("#molitStatus").textContent = locked ? "잠금" : "설정됨";
  const monitorSummary = state.monitorSummary || defaultState.monitorSummary;
  const monitorText = `${monitorSummary.tradeCount || 0}건 매매 · ${monitorSummary.rentCount || 0}건 전월세 · ${monitorSummary.matchedCount || 0}개 반영${monitorSummary.backfillCount ? ` · 보강 ${monitorSummary.backfillCount}개` : ""}`;
  const monitorNode = document.querySelector("#monitorStatus");
  if (monitorNode) {
    monitorNode.innerHTML = locked ? "잠금" : `
      <span class="monitor-chip">${monitorSummary.tradeCount || 0}건 매매</span>
      <span class="monitor-chip">${monitorSummary.rentCount || 0}건 전월세</span>
      <span class="monitor-chip">${monitorSummary.matchedCount || 0}개 반영</span>
      ${monitorSummary.backfillCount ? `<span class="monitor-chip subtle">보강 ${monitorSummary.backfillCount}개</span>` : ""}
    `;
  }
  const tradeSyncNode = document.querySelector("#tradeSyncStatus");
  const rentSyncNode = document.querySelector("#rentSyncStatus");
  const sourceSyncNode = document.querySelector("#sourceSyncStatus");
  if (tradeSyncNode) tradeSyncNode.textContent = locked ? "잠금" : "확인됨";
  if (rentSyncNode) rentSyncNode.textContent = locked ? "잠금" : "확인됨";
  if (sourceSyncNode) sourceSyncNode.textContent = locked
    ? "잠금"
    : "확인됨";
  document.querySelector("#molitEndpoint").value = locked ? "" : (state.settings.molitEndpoint || defaultState.settings.molitEndpoint);
  document.querySelector("#rentEndpoint").value = locked ? "" : (state.settings.rentEndpoint || defaultState.settings.rentEndpoint);
  document.querySelector("#vworldEndpoint").value = locked ? "" : buildVworldBoundaryUrl({ includeKey: false });
  document.querySelector("#molitKey").value = effectiveMolitKey;
  document.querySelector("#kakaoKey").value = effectiveKakaoKey;
  document.querySelector("#vworldKey").value = effectiveVworldKey;
  document.querySelector("#vworldDomain").value = effectiveVworldDomain;
  document.querySelector("#newsEndpoint").value = locked ? "" : (state.settings.newsEndpoint || "/api/news");
  document.querySelector("#alertThreshold").value = locked ? "" : state.settings.alertThreshold;
  const recoveryNameInput = document.querySelector("#recoveryName");
  const recoveryEmailInput = document.querySelector("#recoveryEmail");
  if (recoveryNameInput) recoveryNameInput.value = "";
  if (recoveryEmailInput) recoveryEmailInput.value = "";
}

function renderMonitorStatus() {
  const status = document.querySelector("#monitorBanner");
  const button = document.querySelector("#runMonitorButton");
  const monitoring = state.monitoring || defaultState.monitoring;
  if (button) {
    button.disabled = Boolean(monitoring.active);
    button.textContent = monitoring.active ? "모니터링 중" : "모니터링 실행";
  }
  if (!status) return;

  if (monitoring.active) {
    status.innerHTML = `
      <div class="monitor-pill active">
        <span>${escapeHtml(monitoring.phase || "진행 중")}</span>
        <strong>${escapeHtml(monitoring.detail || "처리 중입니다.")}</strong>
      </div>
      <div class="monitor-progress"><span style="width:${Math.max(8, Math.min(100, monitoring.progress || 0))}%"></span></div>
    `;
    return;
  }

  if (monitoring.status === "done") {
    status.innerHTML = `
      <div class="monitor-pill done">
        <span>마지막 실행</span>
        <strong>${escapeHtml(monitoring.phase || "완료")} · ${escapeHtml(monitoring.detail || "처리 완료")}</strong>
      </div>
      <div class="monitor-meta">${escapeHtml(monitoring.lastRunAt || state.monitorSummary?.lastRunAt || "")}</div>
    `;
    return;
  }

  if (monitoring.status === "error") {
    status.innerHTML = `
      <div class="monitor-pill error">
        <span>실패</span>
        <strong>${escapeHtml(monitoring.detail || "처리 중 오류가 발생했습니다.")}</strong>
      </div>
      <div class="monitor-meta">${escapeHtml(monitoring.lastRunAt || "")}</div>
    `;
    return;
  }

  status.innerHTML = `
    <div class="monitor-pill idle">
      <span>대기 중</span>
      <strong>${escapeHtml(monitoring.detail || "모니터링을 실행하면 진행 상태가 표시됩니다.")}</strong>
    </div>
  `;
}

function getEffectiveSetting(key) {
  return state.settings?.[key] || privateConfig?.[key] || BUILT_IN_PRIVATE_CONFIG[key] || "";
}

function syncEffectiveSettings() {
  state.settings.molitKey = getEffectiveSetting("molitKey");
  state.settings.kakaoKey = getEffectiveSetting("kakaoKey");
  state.settings.vworldKey = getEffectiveSetting("vworldKey");
  state.settings.vworldDomain = getEffectiveSetting("vworldDomain") || window.location.origin;
}

function renderMetrics() {
  const unread = state.alerts.filter((alert) => !alert.read).length;
  const visited = new Set(state.visits.map((visit) => visit.propertyId)).size;
  const avgChange = state.properties.length
    ? state.properties.reduce((sum, property) => sum + property.change, 0) / state.properties.length
    : 0;

  document.querySelector("#metricProperties").textContent = state.properties.length;
  document.querySelector("#metricChange").textContent = `${avgChange.toFixed(1)}%`;
  document.querySelector("#metricAlerts").textContent = unread;
  document.querySelector("#metricVisits").textContent = visited;
}

function renderFilterBars() {
  const regions = buildInterestRegions();
  const months = buildDealMonthOptions();
  const radiusOptions = [5, 10, 15, 20, 30];
  const currentRegion = String(state.settings.interestRegion || "전체");
  const currentMonth = String(state.settings.dealMonth || getCurrentDealMonth());
  const currentMin = Number(state.settings.interestPriceMin || 40000);
  const currentMax = Number(state.settings.interestPriceMax || 100000);
  const currentRadius = Number(state.settings.interestRadiusKm || 15);
  const summary = `${currentRegion} · ${formatDealMonthLabel(currentMonth)} · ${formatPrice(currentMin)} ~ ${formatPrice(currentMax)} · 반경 ${currentRadius}km`;

  [
    { selector: "#dashboardFilterBar", scope: "dashboard" },
    { selector: "#watchlistFilterBar", scope: "watchlist" },
  ].forEach(({ selector, scope }) => {
    const container = document.querySelector(selector);
    if (!container) return;
    container.innerHTML = `
      <div class="filter-head">
        <div>
          <strong>조회 필터</strong>
          <p>${scope === "dashboard" ? "대시보드" : "관심목록"}에서만 보이는 필터입니다.</p>
        </div>
        <button type="button" class="ghost" data-filter-reset>기본값</button>
      </div>
      <div class="filter-grid">
        <label>
          지역
          <select data-filter-key="interestRegion" data-filter-type="select">
            ${regions.map((region) => `<option ${region === currentRegion ? "selected" : ""}>${escapeHtml(region)}</option>`).join("")}
          </select>
        </label>
        <label>
          계약연월
          <select data-filter-key="dealMonth" data-filter-type="select">
            ${months.map((month) => `<option value="${month.value}" ${month.value === currentMonth ? "selected" : ""}>${escapeHtml(month.label)}</option>`).join("")}
          </select>
        </label>
        <label>
          가격 하한
          <input data-filter-key="interestPriceMin" data-filter-type="number" type="number" min="0" step="100" value="${currentMin}" />
        </label>
        <label>
          가격 상한
          <input data-filter-key="interestPriceMax" data-filter-type="number" type="number" min="0" step="100" value="${currentMax}" />
        </label>
        <label>
          반경
          <select data-filter-key="interestRadiusKm" data-filter-type="select">
            ${radiusOptions.map((radius) => `<option value="${radius}" ${radius === currentRadius ? "selected" : ""}>${radius}km</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="filter-summary">${escapeHtml(summary)}</div>
    `;
  });
}

function handleFilterChange(event) {
  const target = event.target;
  if (!target) return;
  const field = target.closest?.("[data-filter-key]");
  if (!field) return;
  const key = field.dataset.filterKey;
  if (!key) return;
  const nextValue = field.dataset.filterType === "number" && field.value === ""
    ? defaultState.settings[key]
    : (field.dataset.filterType === "number" ? Number(field.value) : field.value);
  if (key === "interestPriceMin" || key === "interestPriceMax" || key === "interestRadiusKm") {
    state.settings[key] = Number.isFinite(nextValue) ? nextValue : defaultState.settings[key];
  } else {
    state.settings[key] = String(nextValue || "");
  }
  if (key === "interestPriceMin" || key === "interestPriceMax") {
    const min = Number(state.settings.interestPriceMin || 0);
    const max = Number(state.settings.interestPriceMax || 0);
    if (min && max && min > max) {
      if (key === "interestPriceMin") {
        state.settings.interestPriceMax = min;
      } else {
        state.settings.interestPriceMin = max;
      }
    }
  }
  saveState();
  render();
  if (key === "dealMonth") void runMonitor();
}

function handleFilterClick(event) {
  const reset = event.target?.closest?.("[data-filter-reset]");
  if (!reset) return;
  event.preventDefault();
  resetInterestFilters();
}

function resetInterestFilters() {
  state.settings.interestRegion = defaultState.settings.interestRegion;
  state.settings.dealMonth = getCurrentDealMonth();
  state.settings.interestPriceMin = defaultState.settings.interestPriceMin;
  state.settings.interestPriceMax = defaultState.settings.interestPriceMax;
  state.settings.interestRadiusKm = defaultState.settings.interestRadiusKm;
  saveState();
  render();
  void runMonitor();
}

function buildInterestRegions() {
  return ["전체", ...new Set(state.properties.map((property) => property.region.split(" ").slice(0, 2).join(" ")).filter(Boolean))];
}

function buildDealMonthOptions() {
  const current = getCurrentDealMonth();
  const labels = getRecentDealMonths(current, 12).map((month) => ({
    value: month,
    label: formatDealMonthLabel(month),
  }));
  return labels;
}

function formatDealMonthLabel(value) {
  const text = String(value || "");
  if (text.length !== 6) return text;
  return `${text.slice(0, 4)}-${text.slice(4, 6)}`;
}

function getCurrentDealMonth() {
  return new Date().toISOString().slice(0, 7).replace("-", "");
}

function renderMap() {
  syncEffectiveSettings();
  const map = document.querySelector("#mapCanvas");
  const properties = getInterestZoneProperties();
  recenterMapToProperties(properties);
  const kakaoKey = getEffectiveSetting("kakaoKey");
  const vworldKey = getEffectiveSetting("vworldKey");
  const molitKey = getEffectiveSetting("molitKey");
  const keyStatus = `국토부 설정됨 · 지도 ${kakaoKey ? "Kakao" : vworldKey ? "VWorld" : "OSM"}`;

  if (kakaoKey) {
    renderKakaoMap(map, properties, kakaoKey, keyStatus);
    return;
  }

  renderRasterMap(map, properties, vworldKey ? "VWorld" : "OSM", vworldKey);
}

function renderRasterMap(map, properties, provider = "OSM", vworldKey = "") {
  const size = getMapSize(map);
  const center = latLngToPixel(mapState.centerLat, mapState.centerLng, mapState.zoom);
  const left = center.x - size.width / 2;
  const top = center.y - size.height / 2;
  const tiles = getVisibleTiles(left, top, size, mapState.zoom);
  const tileUrl = provider === "VWorld"
    ? (tile) => getVworldTileUrl(tile.x, tile.y, tile.z, vworldKey)
    : (tile) => getOsmTileUrl(tile.x, tile.y, tile.z);

  map.innerHTML = `
    <div class="tile-layer">
      ${tiles.map((tile) => `
        <img
          class="map-tile"
          alt=""
          draggable="false"
          src="${escapeHtml(tileUrl(tile))}"
          style="left:${tile.left}px;top:${tile.top}px"
        />
      `).join("")}
    </div>
    ${properties.map((property) => {
      const point = projectProperty(property, left, top, size);
      return `
    <button class="map-pin ${Math.abs(property.change) >= state.settings.alertThreshold ? "hot" : ""}"
      style="left:${point.x}px;top:${point.y}px"
      title="${escapeHtml(property.name)}"
      data-edit="${property.id}"></button>
    <div class="map-label" style="left:${point.x}px;top:${point.y}px">
      <b>${escapeHtml(property.name)}</b>
      <span>${formatPrice(property.price)} · ${property.change > 0 ? "+" : ""}${property.change}%</span>
    </div>
      `;
    }).join("")}
    <div class="map-controls">
      <button type="button" data-map-zoom="in" aria-label="확대">+</button>
      <button type="button" data-map-zoom="out" aria-label="축소">-</button>
    </div>
    <div class="map-note">${provider} · ${formatDealMonthLabel(state.settings.dealMonth || getCurrentDealMonth())} · ${formatPrice(state.settings.interestPriceMin)} ~ ${formatPrice(state.settings.interestPriceMax)} · 반경 ${Number(state.settings.interestRadiusKm || 15)}km</div>
  `;

  map.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => editProperty(button.dataset.edit));
  });
  map.querySelectorAll("[data-map-zoom]").forEach((button) => {
    button.addEventListener("click", () => {
      mapState.zoom = button.dataset.mapZoom === "in"
        ? Math.min(18, mapState.zoom + 1)
        : Math.max(7, mapState.zoom - 1);
      renderMap();
    });
  });
}

function renderKakaoMap(container, properties, kakaoKey, keyStatus = "") {
  container.innerHTML = `
    <div class="kakao-map" id="kakaoMap"></div>
    <div class="map-note">Kakao Map · 관심 자산 ${properties.length}개${keyStatus ? ` · ${keyStatus}` : ""}</div>
  `;

  loadKakaoSdk(kakaoKey)
    .then(() => {
      const mapElement = document.querySelector("#kakaoMap");
      if (!mapElement || !window.kakao?.maps) return;

      kakaoMap = new kakao.maps.Map(mapElement, {
        center: new kakao.maps.LatLng(mapState.centerLat, mapState.centerLng),
        level: 9,
      });
      kakaoMap.addControl(new kakao.maps.ZoomControl(), kakao.maps.ControlPosition.RIGHT);
      const relayout = () => {
        if (!kakaoMap || !mapElement.isConnected) return;
        kakaoMap.relayout();
        kakaoMap.setCenter(new kakao.maps.LatLng(mapState.centerLat, mapState.centerLng));
      };
      relayout();
      window.requestAnimationFrame(relayout);
      window.setTimeout(relayout, 80);
      window.setTimeout(relayout, 240);
      if (window.ResizeObserver) {
        const observer = new ResizeObserver(() => relayout());
        observer.observe(mapElement);
        mapElement.__resizeObserver = observer;
      }
      renderKakaoMarkers(properties);
    })
    .catch((error) => {
      const fallbackProperties = getInterestZoneProperties();
      renderRasterMap(container, fallbackProperties, "OSM", "");
      addTimeline(state.properties[0]?.id || "", "지도", `Kakao 로딩 실패로 OSM 지도를 표시했습니다: ${error.message || "SDK load failed"}`);
    });
}

function loadKakaoSdk(kakaoKey) {
  if (window.kakao?.maps) {
    return new Promise((resolve) => kakao.maps.load(resolve));
  }
  if (kakaoSdkPromise) return kakaoSdkPromise;

  kakaoSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(kakaoKey)}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = () => {
      if (!window.kakao?.maps) {
        kakaoSdkPromise = null;
        reject(new Error("SDK loaded without kakao.maps"));
        return;
      }
      kakao.maps.load(resolve);
    };
    script.onerror = () => {
      kakaoSdkPromise = null;
      reject(new Error("Kakao SDK load failed"));
    };
    document.head.appendChild(script);
  });
  return kakaoSdkPromise;
}

async function renderKakaoMarkers(properties) {
  kakaoMarkers.forEach((marker) => marker.setMap(null));
  kakaoMarkers = [];

  const resolved = await Promise.all(properties.map((property) => resolvePropertyCoordinate(property)));
  const resolvedProperties = resolved
    .map((item) => item?.property)
    .filter((property) => property?.lat && property?.lng);
  let changed = false;

  resolvedProperties.forEach((property) => {
    const position = new kakao.maps.LatLng(property.lat, property.lng);
    const marker = new kakao.maps.Marker({ map: kakaoMap, position, title: property.name });
    const overlay = new kakao.maps.CustomOverlay({
      map: kakaoMap,
      position,
      yAnchor: 1.75,
      content: `
        <button class="kakao-label" data-edit="${escapeHtml(property.id)}">
          <b>${escapeHtml(property.name)}</b>
          <span>${formatPrice(property.price)} · ${property.change > 0 ? "+" : ""}${property.change}%</span>
        </button>
      `,
    });
    kakao.maps.event.addListener(marker, "click", () => editProperty(property.id));
    kakaoMarkers.push(marker, overlay);
  });

  fitKakaoMapToProperties(resolvedProperties);

  setTimeout(() => {
    document.querySelectorAll(".kakao-label[data-edit]").forEach((label) => {
      label.addEventListener("click", () => editProperty(label.dataset.edit));
    });
  }, 0);

  changed = resolved.some((item) => item?.changed);
  const derivedChanged = await enrichLocationSignals();
  if (changed || derivedChanged) {
    render({ skipMap: true });
  }
}

function recenterMapToProperties(properties) {
  const center = getPropertiesCenter(properties);
  if (!center?.lat || !center?.lng) return;
  mapState.centerLat = center.lat;
  mapState.centerLng = center.lng;
}

function fitKakaoMapToProperties(properties) {
  if (!kakaoMap || !window.kakao?.maps || !properties.length) return;
  if (properties.length === 1) {
    kakaoMap.setCenter(new kakao.maps.LatLng(properties[0].lat, properties[0].lng));
    return;
  }
  const bounds = new kakao.maps.LatLngBounds();
  properties.forEach((property) => {
    bounds.extend(new kakao.maps.LatLng(property.lat, property.lng));
  });
  kakaoMap.setBounds(bounds, 36, 36, 36, 36);
}

function resolvePropertyCoordinate(property) {
  if (property.lat && property.lng && !shouldRefreshCoordinate(property)) return Promise.resolve({ property, changed: false });
  if (!window.kakao?.maps?.services) return Promise.resolve({ property, changed: false });

  const places = new kakao.maps.services.Places();
  const queries = buildPlaceQueries(property);
  return searchBestPlace(places, queries, property).then((place) => {
    if (!place) return { property, changed: false };
    const before = `${property.lat || ""}:${property.lng || ""}:${property.region || ""}`;
    property.lat = Number(place.y);
    property.lng = Number(place.x);
    property.coordsSource = "kakao";
    property.kakaoPlaceName = place.place_name || "";
    property.kakaoAddress = place.address_name || place.road_address_name || "";
    property.region = property.region || property.kakaoAddress || "";
    saveState();
    const after = `${property.lat || ""}:${property.lng || ""}:${property.region || ""}`;
    return { property, changed: before !== after };
  });
}

function shouldRefreshCoordinate(property) {
  return property.tags?.includes("관심단지") && property.coordsSource !== "kakao" && property.coordsSource !== "manual";
}

function buildPlaceQueries(property) {
  const aliases = property.aliases || [];
  return [
    `${property.region} ${property.name}`,
    property.name,
    ...aliases.map((alias) => `${property.region} ${alias}`),
    ...aliases,
  ].map((query) => query.trim()).filter(Boolean);
}

async function searchBestPlace(places, queries, context) {
  for (const query of queries) {
    const results = await kakaoKeywordSearch(places, query);
    const selected = selectBestPlace(results, context);
    if (selected) return selected;
  }
  return null;
}

function kakaoKeywordSearch(places, query) {
  return new Promise((resolve) => {
    places.keywordSearch(query, (results, status) => {
      resolve(status === kakao.maps.services.Status.OK ? results || [] : []);
    });
  });
}

function selectBestPlace(results, context = {}) {
  if (!results.length) return null;
  const scored = results
    .map((place) => ({ place, score: scorePlace(place, context) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.place || null;
}

function scorePlace(place, context = {}) {
  const text = [
    place.place_name,
    place.address_name,
    place.road_address_name,
    place.category_name,
  ].join(" ");
  const expected = context.expectedDistricts || [];
  let score = 1;

  if (/아파트|주거|부동산/.test(text)) score += 4;
  if (place.place_name && normalizeText(place.place_name).includes(normalizeText(context.name || ""))) score += 5;
  expected.forEach((keyword) => {
    if (keyword && text.includes(keyword)) score += 6;
  });
  if (text.includes("성남")) score += 3;
  if (context.region && context.region.split(" ").some((part) => part && text.includes(part))) score += 3;
  if (text.includes("버스") || text.includes("정류장") || text.includes("상가")) score -= 8;

  return score;
}

function normalizeText(text) {
  return String(text || "").replace(/\s+/g, "").replace(/아파트/g, "");
}

function getInterestZoneProperties() {
  const minPrice = Number(state.settings.interestPriceMin || 40000);
  const maxPrice = Number(state.settings.interestPriceMax || 100000);
  const radiusKm = Number(state.settings.interestRadiusKm || 15);
  const selectedRegion = String(state.settings.interestRegion || "전체");

  return state.properties.filter((property) => {
    const price = Number(property.price || 0);
    const withinPrice = !price || (price >= minPrice && price <= maxPrice);
    const withinArea = isNearGangnam(property, radiusKm);
    const withinRegion = selectedRegion === "전체" ? true : String(property.region || "").startsWith(selectedRegion);
    return withinPrice && withinArea && withinRegion;
  });
}

function isNearGangnam(property, radiusKm) {
  if (!property) return false;
  if (property.lat && property.lng) {
    return distanceKm(property.lat, property.lng, 37.4979, 127.0276) <= radiusKm;
  }

  const region = String(property.region || "");
  const hints = [
    "강남", "서초", "송파", "강동", "용산", "성동", "광진", "동작", "관악",
    "분당", "수정구", "중원구", "성남", "광명", "과천", "하남", "의왕", "안양",
  ];
  return hints.some((hint) => region.includes(hint));
}

function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (value) => (value * Math.PI) / 180;
  const earth = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.asin(Math.sqrt(a));
}

function addMapSearchResult() {
  const query = value("#mapSearch");
  if (!query) return;
  if (!window.kakao?.maps?.services) {
    document.querySelector("#mapSearch").placeholder = "Kakao 지도가 로드된 뒤 검색할 수 있습니다.";
    return;
  }

  const places = new kakao.maps.services.Places();
  kakaoKeywordSearch(places, query).then(async (results) => {
    const first = selectBestPlace(results, { name: query, region: query }) || results[0];
    if (!first) {
      document.querySelector("#mapSearch").value = "";
      document.querySelector("#mapSearch").placeholder = "검색 결과가 없습니다.";
      return;
    }
    const name = first.place_name || query;
    const existing = state.properties.find((property) => property.name === name);
    const property = {
      ...(existing || {}),
      id: existing?.id || `p-${Date.now()}`,
      name,
      region: first.address_name || first.road_address_name || "지역 미확인",
      type: existing?.type || "아파트",
      area: existing?.area || 84,
      baseArea: existing?.baseArea || existing?.area || 84,
      price: existing?.price || 0,
      lastTradeDate: existing?.lastTradeDate || "",
      lastTradeFloor: existing?.lastTradeFloor || 0,
      buildYear: existing?.buildYear || "",
      rentDeposit: existing?.rentDeposit || 0,
      monthlyRent: existing?.monthlyRent || 0,
      change: existing?.change || 0,
      fitScore: existing?.fitScore || 0,
      subwayDistance: existing?.subwayDistance || 0,
      tags: sanitizeTags(existing?.tags || []),
      risk: existing?.risk || "검색으로 추가됨. 실거래와 임장 정보 입력 필요.",
      lat: Number(first.y),
      lng: Number(first.x),
      coordsSource: "kakao",
      kakaoPlaceName: first.place_name || "",
      kakaoAddress: first.address_name || first.road_address_name || "",
      x: existing?.x || 50,
      y: existing?.y || 50,
    };
    await applyLocationScore(property);

    state.properties = existing
      ? state.properties.map((item) => (item.id === existing.id ? property : item))
      : [property, ...state.properties];
    addTimeline(property.id, "검색", `${property.name} 마커를 지도에 추가했습니다.`);
    saveState();
    document.querySelector("#mapSearch").value = "";
    render();
    await runMonitor();
    editProperty(property.id);
  });
}

function getPropertiesCenter(properties) {
  const withCoords = properties.filter((property) => property.lat && property.lng);
  if (!withCoords.length) return { lat: mapState.centerLat, lng: mapState.centerLng };
  return {
    lat: withCoords.reduce((sum, property) => sum + property.lat, 0) / withCoords.length,
    lng: withCoords.reduce((sum, property) => sum + property.lng, 0) / withCoords.length,
  };
}

function projectProperty(property, left, top, size) {
  if (!property.lat || !property.lng) {
    return {
      x: ((property.x || 50) / 100) * size.width,
      y: ((property.y || 50) / 100) * size.height,
    };
  }

  const pixel = latLngToPixel(property.lat, property.lng, mapState.zoom);
  return {
    x: Math.round(pixel.x - left),
    y: Math.round(pixel.y - top),
  };
}

function getMapSize(map) {
  return {
    width: Math.max(320, map.clientWidth || 960),
    height: Math.max(420, map.clientHeight || 458),
  };
}

function latLngToPixel(lat, lng, zoom) {
  const scale = 256 * 2 ** zoom;
  const sinLat = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) * scale,
  };
}

function getVisibleTiles(left, top, size, zoom) {
  const tileSize = 256;
  const minX = Math.floor(left / tileSize);
  const maxX = Math.floor((left + size.width) / tileSize);
  const minY = Math.floor(top / tileSize);
  const maxY = Math.floor((top + size.height) / tileSize);
  const maxTile = 2 ** zoom;
  const tiles = [];

  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      if (y < 0 || y >= maxTile) continue;
      tiles.push({
        x: ((x % maxTile) + maxTile) % maxTile,
        y,
        z: zoom,
        left: Math.round(x * tileSize - left),
        top: Math.round(y * tileSize - top),
      });
    }
  }
  return tiles;
}

function getVworldTileUrl(x, y, z, key) {
  return `https://api.vworld.kr/req/wmts/1.0.0/${encodeURIComponent(key)}/Base/${z}/${y}/${x}.png`;
}

function getOsmTileUrl(x, y, z) {
  const server = ["a", "b", "c"][Math.abs(x + y) % 3];
  return `https://${server}.tile.openstreetmap.org/${z}/${x}/${y}.png`;
}

function renderToday() {
  const list = document.querySelector("#todayList");
  const visiblePropertyIds = new Set(getInterestZoneProperties().map((property) => property.id));
  const hot = state.properties
    .filter((property) => visiblePropertyIds.has(property.id))
    .filter((property) => Math.abs(property.change) >= state.settings.alertThreshold)
    .slice(0, 5);
  const dataset = state.sourceDatasets?.find((item) => item.id === "gb_r001");

  const hotItems = hot.length ? hot.map((property) => `
    <div class="today-item">
      <div>
        <strong>${escapeHtml(property.name)}</strong>
        <div class="muted">${escapeHtml(property.region)} · ${escapeHtml(property.risk || "리스크 메모 없음")}</div>
      </div>
      <span class="badge ${property.change < 0 ? "amber" : "red"}">${property.change > 0 ? "+" : ""}${property.change}%</span>
    </div>
  `).join("") : `<p>설정 기준을 넘은 항목이 없습니다.</p>`;

  const sourceItem = dataset ? `
    <div class="today-item">
      <div>
        <strong>입지 점수 데이터 반영</strong>
        <div class="muted">${escapeHtml(dataset.name)} · ${dataset.records.toLocaleString()}개 데이터</div>
      </div>
      <span class="badge">입지</span>
    </div>
  ` : "";

  list.innerHTML = hotItems + sourceItem;
}

function renderMacro() {
  const feed = document.querySelector("#macroFeed");
  if (!feed) return;
  const macro = state.macro || defaultState.macro;
  if (macro.loading) {
    feed.innerHTML = `<p>거시 변수를 수집하는 중입니다.</p>`;
    return;
  }
  if (!macro.fx && !(macro.signals || []).length) {
    feed.innerHTML = `<p>거시 모니터 결과가 없습니다. 정책, 주택, 대출, 금리, 전세 변수를 확인할 수 있습니다.</p>`;
    return;
  }
  const fxCard = macro.fx ? `
    <article class="macro-card">
      <span class="badge">환율</span>
      <strong>${escapeHtml(macro.fx.label || "USD/KRW")}</strong>
      <p>${escapeHtml(macro.fx.value || "미입력")}</p>
      <div class="muted">${escapeHtml(macro.fx.source || "실시간 스냅샷")} · ${escapeHtml(macro.fx.at || "")}</div>
    </article>
  ` : `
    <article class="macro-card">
      <span class="badge">환율</span>
      <strong>미입력</strong>
      <p>환율 스냅샷을 아직 불러오지 못했습니다.</p>
    </article>
  `;

  const signalCards = (macro.signals || []).map((signal) => `
    <article class="macro-card">
      <span class="badge">${escapeHtml(signal.label || "거시")}</span>
      <strong>${escapeHtml(signal.title || "미입력")}</strong>
      <p>${escapeHtml(signal.summary || "거시 신호를 확인 중입니다.")}</p>
      <div class="muted">${escapeHtml(signal.source || "외부 수집")} · ${escapeHtml(signal.at || "")}</div>
    </article>
  `).join("");

  feed.innerHTML = fxCard + signalCards;
}

function renderTimeline() {
  const timeline = document.querySelector("#timeline");
  timeline.innerHTML = state.timeline.slice(0, 10).map((item) => {
    const property = findProperty(item.propertyId);
    return `
      <div class="timeline-item">
        <div>
          <strong>${escapeHtml(item.kind)} · ${escapeHtml(property?.name || "삭제된 자산")}</strong>
          <div class="muted">${escapeHtml(item.text)}</div>
        </div>
        <span class="badge">${escapeHtml(item.at)}</span>
      </div>
    `;
  }).join("");
}

function renderNews() {
  const feed = document.querySelector("#newsFeed");
  if (state.newsLoading) {
    feed.innerHTML = `<p>뉴스를 비동기로 수집하는 중입니다.</p>`;
    return;
  }
  const visiblePropertyIds = new Set(getInterestZoneProperties().map((property) => property.id));
  const news = state.news
    .filter((item) => {
      const property = findProperty(item.propertyId);
      return Boolean(property && visiblePropertyIds.has(property.id));
    })
    .slice(0, 6);

  feed.innerHTML = news.length ? news.map((item) => {
    const property = findProperty(item.propertyId);
    const title = cleanNewsText(item.title);
    const summary = cleanNewsText(item.summary).slice(0, 180);
    return `
      <article class="news-card">
        <span class="badge">${escapeHtml(property?.name || cleanNewsText(item.keyword) || "관심 자산")}</span>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(summary)}</p>
        <div class="muted">${escapeHtml(property?.name || "관심 지역")} · ${escapeHtml(cleanNewsText(item.source))} · ${escapeHtml(item.at)}</div>
      </article>
    `;
  }).join("") : `<p>관심 자산과 매칭된 뉴스가 없습니다.</p>`;
}

function renderProperties() {
  const query = value("#watchSearch").toLowerCase();
  const grid = document.querySelector("#propertyGrid");
  const pager = document.querySelector("#propertyPager");
  const properties = getInterestZoneProperties().filter((property) => {
    const haystack = [property.name, property.region, property.type, ...(property.tags || [])].join(" ").toLowerCase();
    return haystack.includes(query);
  });
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(properties.length / pageSize));
  propertyPage = Math.min(propertyPage, pageCount);
  propertyPage = Math.max(propertyPage, 1);
  const start = (propertyPage - 1) * pageSize;
  const visibleProperties = properties.slice(start, start + pageSize);

  grid.innerHTML = visibleProperties.length ? visibleProperties.map((property) => `
    <article class="property-card">
      <div class="property-card-head">
        <div>
          <h3>${escapeHtml(property.name)}</h3>
          <div class="card-meta">${escapeHtml(property.region)} · ${escapeHtml(property.type)}</div>
        </div>
        <span class="badge">${escapeHtml(`${Math.round(Number(property.baseArea || property.area || 0)) || "-"}㎡`)}</span>
      </div>
      <div class="price">매매 시세 ${formatPrice(property.price)}</div>
      <div class="card-status-row">
        <span class="badge ${property.change < 0 ? "amber" : property.change >= state.settings.alertThreshold ? "red" : ""}">
          ${property.change > 0 ? "+" : ""}${property.change}% / 30일
        </span>
        <button type="button" class="link-chip" data-evidence="${property.id}">${hasFitScore(property) ? `입지 ${formatFitScore(property)}` : "입지 근거"}</button>
      </div>
      <p class="card-meta">최근 거래 ${escapeHtml(property.lastTradeDate || "미입력")} · ${property.lastTradeFloor || "-"}층 · ${property.buildYear || "-"}년식</p>
      <p class="card-meta">전세/월세 ${formatRent(property.rentDeposit, property.monthlyRent)} · 지하철 ${formatDistance(property.subwayDistance)}</p>
      <p class="card-meta">${escapeHtml(sanitizeTags(property.tags).join(", ") || "태그 없음")}</p>
      <p class="card-meta">${escapeHtml(property.risk || "리스크 메모 없음")}</p>
      <div class="card-actions">
        <button data-detail="${property.id}">상세</button>
        <button data-edit="${property.id}">편집</button>
        <button data-delete="${property.id}">삭제</button>
      </div>
    </article>
  `).join("") : `<p class="empty-state">조건에 맞는 관심 자산이 없습니다.</p>`;

  if (pager) {
    pager.innerHTML = `
      <span>${properties.length ? `${start + 1}-${Math.min(start + pageSize, properties.length)} / ${properties.length}` : "0 / 0"}</span>
      <div class="pager-controls">
        <button type="button" ${propertyPage <= 1 ? "disabled" : ""} data-page-step="-1">이전</button>
        <button type="button" ${propertyPage >= pageCount ? "disabled" : ""} data-page-step="1">다음</button>
      </div>
    `;
    pager.querySelectorAll("[data-page-step]").forEach((button) => {
      button.addEventListener("click", () => {
        propertyPage = Math.min(pageCount, Math.max(1, propertyPage + Number(button.dataset.pageStep)));
        renderProperties();
      });
    });
  }

  grid.querySelectorAll("[data-detail]").forEach((button) => {
    button.addEventListener("click", () => openPropertyDetail(button.dataset.detail));
  });
  grid.querySelectorAll("[data-evidence]").forEach((button) => {
    button.addEventListener("click", () => openPropertyEvidence(button.dataset.evidence));
  });
  grid.querySelectorAll("[data-edit]").forEach((button) => {
    button.addEventListener("click", () => editProperty(button.dataset.edit));
  });
  grid.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteProperty(button.dataset.delete));
  });
}

function renderVisits() {
  const list = document.querySelector("#visitList");
  const pager = document.querySelector("#visitPager");
  const pageSize = 4;
  const pageCount = Math.max(1, Math.ceil(state.visits.length / pageSize));
  visitPage = Math.min(visitPage, pageCount);
  visitPage = Math.max(visitPage, 1);
  const start = (visitPage - 1) * pageSize;
  const visibleVisits = state.visits.slice(start, start + pageSize);
  list.innerHTML = visibleVisits.length ? visibleVisits.map((visit) => {
    const property = findProperty(visit.propertyId);
    const photos = Array.isArray(visit.photos) ? visit.photos.filter(Boolean) : [];
    return `
      <div class="visit">
        <div>
          <strong>${escapeHtml(property?.name || "삭제된 자산")}</strong>
          <div class="muted">${escapeHtml(visit.date)} · 평점 ${visit.score}/5</div>
          <p>${escapeHtml(visit.note)}</p>
          ${photos.length ? `
            <div class="visit-photos">
              ${photos.slice(0, 4).map((photo) => `
                <img src="${escapeHtml(photo)}" alt="임장 사진" loading="lazy" />
              `).join("")}
            </div>
          ` : ""}
        </div>
        <span class="badge">임장</span>
      </div>
    `;
  }).join("") : `<p class="empty-state">아직 저장된 임장 기록이 없습니다.</p>`;

  if (pager) {
    pager.innerHTML = `
      <span>${state.visits.length ? `${start + 1}-${Math.min(start + pageSize, state.visits.length)} / ${state.visits.length}` : "0 / 0"}</span>
      <div class="pager-controls">
        <button type="button" ${visitPage <= 1 ? "disabled" : ""} data-page-step="-1">이전</button>
        <button type="button" ${visitPage >= pageCount ? "disabled" : ""} data-page-step="1">다음</button>
      </div>
    `;
    pager.querySelectorAll("[data-page-step]").forEach((button) => {
      button.addEventListener("click", () => {
        visitPage = Math.min(pageCount, Math.max(1, visitPage + Number(button.dataset.pageStep)));
        renderVisits();
      });
    });
  }
}

function readVisitPhotos(files) {
  return Promise.all(files.slice(0, 4).map((file) => resizeImageFile(file, 1200, 0.72))).then((items) => items.filter(Boolean));
}

function resizeImageFile(file, maxSize, quality) {
  if (!file || !file.type?.startsWith("image/")) return Promise.resolve("");
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const webp = canvas.toDataURL("image/webp", quality);
        if (webp.startsWith("data:image/webp")) {
          resolve(webp);
          return;
        }
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.onerror = () => resolve("");
      image.src = String(reader.result || "");
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

function renderAlerts() {
  const list = document.querySelector("#alertList");
  const unreadAlerts = state.alerts.filter((alert) => !alert.read);
  list.innerHTML = unreadAlerts.length ? unreadAlerts.map((alert) => {
    const property = findProperty(alert.propertyId);
    return `
      <div class="alert ${alert.read ? "" : "unread"}">
        <div>
          <strong>${escapeHtml(alert.title)}</strong>
          <div class="muted">${escapeHtml(property?.name || "삭제된 자산")} · ${escapeHtml(alert.at)}</div>
          <p>${escapeHtml(alert.body)}</p>
        </div>
        <span class="badge ${alert.read ? "" : "amber"}">${alert.read ? "읽음" : "미확인"}</span>
      </div>
    `;
  }).join("") : `<p>새 알림이 없습니다.</p>`;
}

function openPropertyDetail(id) {
  detailPropertyId = id;
  const property = findProperty(id);
  if (!property) return;
  const modal = document.querySelector("#detailModal");
  modal.hidden = false;
  detailSelectedArea = Number(property.baseArea || property.area || 84);
  renderPropertyDetail();
}

function openPropertyEvidence(id) {
  detailPropertyId = id;
  const property = findProperty(id);
  if (!property) return;
  document.querySelector("#evidenceModal").hidden = false;
  renderPropertyEvidence(property);
}

function closePropertyDetail() {
  document.querySelector("#detailModal").hidden = true;
}

function closePropertyEvidence() {
  document.querySelector("#evidenceModal").hidden = true;
}

function renderPropertyDetail() {
  const property = findProperty(detailPropertyId);
  if (!property) return;
  const tradeHistory = state.propertyTradeHistory?.[property.id] || [];
  const rentHistory = state.propertyRentHistory?.[property.id] || [];
  const areas = collectAreas(property, tradeHistory);
  if (!detailSelectedArea && areas.length) detailSelectedArea = areas[0];

  const select = document.querySelector("#detailAreaSelect");
  select.innerHTML = areas.map((area) => `<option value="${area}">${area}㎡</option>`).join("");
  select.value = String(detailSelectedArea || areas[0] || property.baseArea || property.area || 84);
  select.onchange = () => {
    detailSelectedArea = Number(select.value);
    renderPropertyDetail();
  };

  document.querySelector("#detailTitle").textContent = property.name;
  const detailMeta = document.querySelector("#detailMeta");
  const hasEvidence = hasFitScore(property) || property.locationEvidence || property.locationScore || property.gbR001;
  detailMeta.innerHTML = `${escapeHtml(property.region)} · ${escapeHtml(property.type)}${hasFitScore(property) ? ` · 입지 ${formatScore(property.fitScore)}` : ""}`;
  const trigger = document.querySelector("#detailEvidenceTrigger");
  if (trigger) trigger.hidden = !hasEvidence;

  const filteredTradeSeries = filterSeriesByArea(tradeHistory, detailSelectedArea);
  const filteredRentSeries = filterSeriesByArea(rentHistory, detailSelectedArea);
  const latestTrade = filteredTradeSeries.at(-1);
  const latestRent = filteredRentSeries.at(-1);
  document.querySelector("#detailStats").innerHTML = [
    statCard("최근 거래", latestTrade ? formatPrice(latestTrade.price) : "미입력"),
    statCard("최근 거래일", latestTrade?.month || "미입력"),
    statCard("전세보증금", latestRent ? formatPrice(latestRent.deposit) : "미입력"),
    statCard("월세", latestRent?.monthlyRent ? `${latestRent.monthlyRent.toLocaleString()}만` : "미입력"),
  ].join("");

  document.querySelector("#detailRows").innerHTML = renderDetailRows(filteredTradeSeries, filteredRentSeries);
  renderDetailChart(filteredTradeSeries, filteredRentSeries);
}

function renderPropertyEvidence(property) {
  const evidence = document.querySelector("#evidenceBody");
  if (!evidence) return;
  const evidenceModel = property.locationEvidence || property.gbR001 || property.locationScore || null;
  if (!evidenceModel) {
    evidence.innerHTML = `<p class="empty-state">입지 근거가 없습니다.</p>`;
    document.querySelector("#evidenceTitle").textContent = property.name;
    document.querySelector("#evidenceMeta").textContent = `${property.region} · ${property.type}`;
    return;
  }
  const score = evidenceModel?.metrics || property.locationScore || property.gbR001 || {};
  const sourceLabel = describeLocationScoreSource(evidenceModel || score);
  const featurePoint = Array.isArray(evidenceModel?.feature?.centroid) && evidenceModel.feature.centroid.length >= 2
    ? `${Number(evidenceModel.feature.centroid[1]).toFixed(5)}, ${Number(evidenceModel.feature.centroid[0]).toFixed(5)}`
    : "미입력";
  const propertyPoint = evidenceModel?.property?.lat && evidenceModel?.property?.lng
    ? `${Number(evidenceModel.property.lat).toFixed(5)}, ${Number(evidenceModel.property.lng).toFixed(5)}`
    : (property.lat && property.lng
    ? `${Number(property.lat).toFixed(5)}, ${Number(property.lng).toFixed(5)}`
    : "미입력");
  document.querySelector("#evidenceTitle").textContent = property.name;
  document.querySelector("#evidenceMeta").textContent = `${property.region} · ${property.type}`;
  evidence.innerHTML = `
    <div class="detail-evidence-head">
      <strong>입지 근거</strong>
      <span>${escapeHtml(sourceLabel)}</span>
    </div>
      <div class="detail-evidence-grid">
        <div><small>모델 버전</small><strong>${escapeHtml(String(evidenceModel?.modelVersion || 1))}</strong></div>
        <div><small>종합 점수</small><strong>${escapeHtml(Number.isFinite(Number(score.score)) ? formatScore(score.score) : "미입력")}</strong></div>
        <div><small>기준 점수</small><strong>${escapeHtml(Number.isFinite(Number(score.baseScore)) ? formatScore(score.baseScore) : "미입력")}</strong></div>
        <div><small>근접 보정</small><strong>${escapeHtml(Number.isFinite(Number(score.proximityScore)) ? formatScore(score.proximityScore) : "미입력")}</strong></div>
        <div><small>출처</small><strong>${escapeHtml(sourceLabel)}</strong></div>
        <div><small>매칭 방식</small><strong>${escapeHtml(evidenceModel?.matchMode || score.matchMode || "미입력")}</strong></div>
        <div><small>근거 키</small><strong>${escapeHtml(evidenceModel?.featureKey || score.featureKey || "미입력")}</strong></div>
        <div><small>자산 좌표</small><strong>${escapeHtml(propertyPoint)}</strong></div>
        <div><small>근거 좌표</small><strong>${escapeHtml(featurePoint)}</strong></div>
        <div><small>근거 거리</small><strong>${escapeHtml(Number.isFinite(Number(score.distanceToFeatureMeters)) ? `${Math.round(Number(score.distanceToFeatureMeters)).toLocaleString()}m` : "미입력")}</strong></div>
        <div><small>지하철 거리</small><strong>${escapeHtml(formatDistance(score.subwayDistance || property.subwayDistance))}</strong></div>
        <div><small>경찰 거리</small><strong>${escapeHtml(score.policeDistance ? `${Math.round(score.policeDistance)}m` : "미입력")}</strong></div>
        <div><small>대학 거리</small><strong>${escapeHtml(score.universityDistance ? `${Math.round(score.universityDistance)}m` : "미입력")}</strong></div>
      </div>
  `;
}

function statCard(label, value) {
  return `<div class="detail-stat"><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></div>`;
}

function collectAreas(property, tradeHistory) {
  const set = new Set([
    Math.round(Number(property.baseArea || property.area || 84)),
    ...tradeHistory.map((point) => Math.round(Number(point.area || 0))).filter(Boolean),
  ]);
  return [...set].sort((a, b) => a - b);
}

function filterSeriesByArea(series, area) {
  const target = Number(area || 0);
  return (series || []).filter((point) => Math.abs(Number(point.area || 0) - target) <= 3).slice(-12);
}

function renderDetailRows(tradeSeries, rentSeries) {
  const months = new Set([...tradeSeries.map((point) => point.month), ...rentSeries.map((point) => point.month)]);
  return [...months].sort().slice(-12).map((month) => {
    const trade = tradeSeries.find((point) => point.month === month);
    const rent = rentSeries.find((point) => point.month === month);
    return `
      <tr>
        <td>${escapeHtml(month)}</td>
        <td>${trade ? formatPrice(trade.price) : "미입력"}</td>
        <td>${rent ? formatRent(rent.deposit, rent.monthlyRent) : "미입력"}</td>
        <td>${trade?.floor || rent?.floor || "-"}</td>
      </tr>
    `;
  }).join("");
}

function renderDetailChart(tradeSeries, rentSeries) {
  const svg = document.querySelector("#detailChart");
  const points = tradeSeries.length ? tradeSeries : rentSeries;
  if (!points.length) {
    svg.innerHTML = `<text x="50%" y="50%" text-anchor="middle" fill="#66757f">최근 12개월 시세 데이터가 없습니다.</text>`;
    return;
  }

  const width = 720;
  const height = 280;
  const padding = 28;
  const values = points.map((point) => Number(point.price || point.deposit || 0)).filter(Boolean);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const xStep = (width - padding * 2) / Math.max(points.length - 1, 1);
  const toX = (index) => padding + index * xStep;
  const toY = (value) => height - padding - ((value - min) / range) * (height - padding * 2);
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"} ${toX(index)} ${toY(Number(point.price || point.deposit || 0))}`).join(" ");
  const yLines = [0.25, 0.5, 0.75].map((ratio) => {
    const y = padding + (height - padding * 2) * ratio;
    return `<line class="graph-grid" x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" />`;
  }).join("");

  svg.innerHTML = `
    ${yLines}
    <line class="graph-axis" x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" />
    <line class="graph-axis" x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" />
    <path class="graph-line" d="${line}" />
    ${points.map((point, index) => {
      const x = toX(index);
      const y = toY(Number(point.price || point.deposit || 0));
      return `<circle class="graph-point" cx="${x}" cy="${y}" r="4.5" />`;
    }).join("")}
    ${points.map((point, index) => {
      const x = toX(index);
      return `<text x="${x}" y="${height - 10}" text-anchor="middle" fill="#66757f" font-size="11">${escapeHtml(point.month)}</text>`;
    }).join("")}
  `;
}

function renderAdminOptions() {
  const select = document.querySelector("#visitProperty");
  if (!select) return;
  select.innerHTML = state.properties.map((property) => (
    `<option value="${property.id}">${escapeHtml(property.name)}</option>`
  )).join("");
}

function renderTopActions(view = getActiveView()) {
  const adminButton = document.querySelector("#adminOpenButton");
  const topActions = document.querySelector(".top-actions");
  if (!topActions) return;
  if (adminButton) adminButton.hidden = view !== "dashboard";
  topActions.hidden = view !== "dashboard" || !adminButton || adminButton.hidden;
  if (!topActions.querySelector("#adminOpenButton")) {
    topActions.innerHTML = `<button class="primary" id="adminOpenButton" data-view-jump="admin">정보 입력</button>`;
    document.querySelector("#adminOpenButton")?.addEventListener("click", () => setView("admin"));
  }
}

function renderHostTabs() {
  const tabs = document.querySelector("#hostTabs");
  if (!tabs) return;
  if (!hostMode) {
    tabs.innerHTML = "";
    tabs.hidden = true;
    return;
  }
  tabs.hidden = false;
  tabs.innerHTML = Object.entries(views).map(([key, view]) => `
    <button class="host-tab ${getActiveView() === key ? "active" : ""}" data-view="${key}">
      ${escapeHtml(view.title)}
    </button>
  `).join("");
  tabs.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });
}

function getActiveView() {
  return document.querySelector(".nav-item.active")?.dataset.view || "dashboard";
}

function editProperty(id) {
  const property = findProperty(id);
  if (!property) return;
  document.querySelector("#propertyId").value = property.id;
  document.querySelector("#propertyName").value = property.name;
  document.querySelector("#propertyRegion").value = property.region;
  document.querySelector("#propertyType").value = property.type;
  document.querySelector("#propertyArea").value = property.area;
  document.querySelector("#propertyBaseArea").value = property.baseArea || property.area || 84;
  document.querySelector("#propertyPrice").value = property.price;
  document.querySelector("#propertyChange").value = property.change;
  document.querySelector("#propertyFitScore").value = property.fitScore || "";
  document.querySelector("#propertySubwayDistance").value = property.subwayDistance || "";
  document.querySelector("#propertyLat").value = property.lat || "";
  document.querySelector("#propertyLng").value = property.lng || "";
  document.querySelector("#propertyTags").value = (property.tags || []).join(", ");
  document.querySelector("#propertyRisk").value = property.risk;
  setView("admin");
}

function clearPropertyForm() {
  document.querySelector("#propertyForm").reset();
  document.querySelector("#propertyId").value = "";
}

function deleteProperty(id) {
  state.properties = state.properties.filter((property) => property.id !== id);
  state.visits = state.visits.filter((visit) => visit.propertyId !== id);
  state.alerts = state.alerts.filter((alert) => alert.propertyId !== id);
  state.news = state.news.filter((item) => item.propertyId !== id);
  state.timeline = state.timeline.filter((item) => item.propertyId !== id);
  delete state.propertyTradeHistory?.[id];
  delete state.propertyRentHistory?.[id];
  saveState();
  render();
}

function requireAdmin(message) {
  adminUnlocked = true;
  return true;
}

async function runMonitor() {
  const requestId = ++newsRequestSeq;
  state.newsLoading = true;
  try {
    setMonitorState({
      active: true,
      status: "running",
      phase: "조회 준비",
      detail: "관심 자산, 법정동 코드, 조회 범위를 확인하는 중입니다.",
      progress: 5,
    });
    render();
    await pause(0);
    const lawdCodes = getMonitorLawdCodes();
    const dealMonth = state.settings.dealMonth || new Date().toISOString().slice(0, 7).replace("-", "");
    const dealMonths = getRecentDealMonths(dealMonth, 12);
    setMonitorState({
      phase: "국토부 매매 조회",
      detail: `${lawdCodes.join(", ")} · 최근 ${dealMonths.length}개월`,
      progress: 18,
    });
    await pause(0);
    const trades = await fetchMolitSeries("trade", lawdCodes, dealMonths);
    setMonitorState({
      phase: "국토부 전월세 조회",
      detail: `${lawdCodes.join(", ")} · 최근 ${dealMonths.length}개월`,
      progress: 42,
    });
    await pause(0);
    const rents = await fetchMolitSeries("rent", lawdCodes, dealMonths);
    setMonitorState({
      phase: "입지/좌표 보강",
      detail: "지하철 거리와 입지 점수를 확인하는 중입니다.",
      progress: 63,
    });
    await pause(0);
    const baseChanged = await enrichLocationSignals();
    applyMolitRecords(trades, rents);
    updatePropertyHistories(trades, rents);

    const missingProperties = state.properties.filter((property) => property.tags?.includes("관심단지") && needsMarketBackfill(property));
    let allTrades = trades;
    let allRents = rents;
    let deepChanged = false;
    if (missingProperties.length) {
      const extraMonths = getRecentDealMonths(dealMonth, 84).slice(12);
      setMonitorState({
        phase: "보강 조회",
        detail: `미입력 단지 ${missingProperties.length}개를 추가로 확인하는 중입니다.`,
        progress: 76,
      });
      await pause(0);
      const extraTrades = await fetchMolitSeries("trade", lawdCodes, extraMonths);
      const extraRents = await fetchMolitSeries("rent", lawdCodes, extraMonths);
      allTrades = [...trades, ...extraTrades];
      allRents = [...rents, ...extraRents];
      applyMolitRecords(allTrades, allRents);
      updatePropertyHistories(allTrades, allRents);
      deepChanged = true;
    }
    const first = state.properties[0];
    setMonitorState({
      phase: "뉴스 수집",
      detail: "관심 자산만 모아서 정리하는 중입니다.",
      progress: 88,
    });
    await pause(0);
    const fetchedNews = await collectNewsItems();
    setMacroState({ loading: true });
    renderMacro();
    const macroSignals = await collectMacroSignals();
    if (requestId !== newsRequestSeq) return;
    if (fetchedNews.length) {
      state.news = filterActiveNews(mergeNewsItems(fetchedNews, state.news.filter((item) => !isSampleNews(item)))).slice(0, 30);
    } else if (first) {
      state.news = filterActiveNews(state.news.filter((item) => !isSampleNews(item))).slice(0, 30);
    }
    state.macro = {
      ...(state.macro || defaultState.macro),
      loading: false,
      lastRunAt: new Date().toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      fx: macroSignals.fx,
      signals: macroSignals.signals,
    };
    pruneEphemeralCollections(state);
    if (first) {
      const latest = fetchedNews[0] || state.news[0];
      if (latest) {
        createAlert(first.id, "news", "관심 자산 뉴스 감지", `${latest.keyword} 관련 뉴스가 추가되었습니다.`);
        addTimeline(first.id, "뉴스", `${latest.keyword} 자산 뉴스가 수집되었습니다.`);
      }
      addTimeline(first.id, "국토부", `${lawdCodes.join(", ")} 최근 ${dealMonths.length}개월 매매 ${trades.length}건, 전월세 ${rents.length}건을 조회했습니다.`);
      addTimeline(first.id, "VWorld", `${state.settings.lawdCode || "시군구"} 시군구 경계 레이어 기준으로 지도 영역을 갱신했습니다.`);
      if (macroSignals.fx?.value) {
        addTimeline(first.id, "거시", `${macroSignals.fx.label} ${macroSignals.fx.value} · ${macroSignals.fx.source}`);
      }
    }
    state.monitorSummary = {
      tradeCount: allTrades.length,
      rentCount: allRents.length,
      matchedCount: state.properties.filter((property) => property.price || property.lastTradeDate || property.rentDeposit || property.monthlyRent).length,
      backfillCount: missingProperties.length,
      lastRunAt: new Date().toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    state.newsLoading = false;
    setMonitorState({
      active: false,
      status: "done",
      phase: "완료",
      detail: `${allTrades.length}건 매매 · ${allRents.length}건 전월세 · ${fetchedNews.length}건 뉴스 · ${macroSignals.signals.length}건 거시 신호`,
      progress: 100,
      lastRunAt: state.monitorSummary.lastRunAt,
    });
    saveState();
    render();
    if (baseChanged || deepChanged) render({ skipMap: true });
  } catch (error) {
    state.newsLoading = false;
    state.macro = {
      ...(state.macro || defaultState.macro),
      loading: false,
    };
    setMonitorState({
      active: false,
      status: "error",
      phase: "실패",
      detail: error?.message || "모니터링 중 오류가 발생했습니다.",
      progress: 100,
      lastRunAt: new Date().toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    saveState();
    render();
  }
}

async function runSignalBatch() {
  if (state.monitoring?.active) return;
  const requestId = ++newsRequestSeq;
  state.newsLoading = true;
  setMacroState({ loading: true });
  setMonitorState({
    active: true,
    status: "running",
    phase: "배치 수집",
    detail: "관심 자산 뉴스와 거시 변수를 갱신하는 중입니다.",
    progress: 90,
  });
  render();

  try {
    const fetchedNews = await collectNewsItems();
    const macroSignals = await collectMacroSignals();
    if (requestId !== newsRequestSeq) return;

    if (fetchedNews.length) {
      const existing = state.news.filter((item) => !isSampleNews(item));
      state.news = filterActiveNews(mergeNewsItems(fetchedNews, existing)).slice(0, 30);
    }

    state.macro = {
      ...(state.macro || defaultState.macro),
      loading: false,
      lastRunAt: new Date().toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
      fx: macroSignals.fx,
      signals: macroSignals.signals,
    };
    pruneEphemeralCollections(state);
    state.newsLoading = false;
    setMonitorState({
      active: false,
      status: "done",
      phase: "완료",
      detail: `${fetchedNews.length}건 뉴스 · ${macroSignals.signals.length}건 거시 신호`,
      progress: 100,
      lastRunAt: state.macro.lastRunAt,
    });
    saveState();
    render();
  } catch (error) {
    state.newsLoading = false;
    state.macro = {
      ...(state.macro || defaultState.macro),
      loading: false,
    };
    setMonitorState({
      active: false,
      status: "error",
      phase: "실패",
      detail: error?.message || "배치 수집 중 오류가 발생했습니다.",
      progress: 100,
      lastRunAt: new Date().toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    });
    saveState();
    render();
  }
}

function setMonitorState(partial) {
  state.monitoring = {
    ...(state.monitoring || defaultState.monitoring),
    ...partial,
  };
}

function setMacroState(partial) {
  state.macro = {
    ...(state.macro || defaultState.macro),
    ...partial,
  };
}

function pause(ms = 0) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function needsMarketBackfill(property) {
  return !property.price || !property.lastTradeDate || !property.rentDeposit || !property.monthlyRent;
}

async function fetchMolitSeries(type, lawdCodes, dealMonths) {
  const collected = [];
  for (const lawdCode of lawdCodes) {
    for (const month of dealMonths) {
      const records = await fetchMolitRecords(type, lawdCode, month);
      if (records.length) collected.push(...records);
    }
  }
  return collected;
}

function getRecentDealMonths(baseMonth, count) {
  const year = Number(baseMonth.slice(0, 4));
  const month = Number(baseMonth.slice(4, 6));
  const date = new Date(year, month - 1, 1);
  return Array.from({ length: count }, (_, index) => {
    const next = new Date(date);
    next.setMonth(date.getMonth() - index);
    return `${next.getFullYear()}${String(next.getMonth() + 1).padStart(2, "0")}`;
  });
}

async function enrichLocationSignals() {
  let changed = false;
  await Promise.all(state.properties.map(async (property) => {
    if (!property.lat || !property.lng) return;
    if (!property.subwayDistance && window.kakao?.maps?.services) {
      const subway = await findNearestSubway(property);
      if (subway) {
        property.subwayDistance = Number(subway.distance || 0);
        property.nearestSubway = subway.place_name || "";
        changed = true;
      }
    }
    const needsEvidence = !property.locationEvidence
      || Number(property.locationEvidence.modelVersion || 0) < 2
      || !property.fitScoreSource
      || !property.locationScore;
    if (!needsEvidence) return;
    const score = await getLocationScore(property);
    if (score?.datasetId) {
    const evidence = buildLocationEvidence(property, score);
      if (!Number.isFinite(Number(property.fitScore)) || Number(property.fitScore) <= 0) {
        property.fitScore = evidence.metrics.score;
      }
      property.fitScoreSource = evidence.source;
      if (evidence.metrics.subwayDistance && !property.subwayDistance) property.subwayDistance = evidence.metrics.subwayDistance;
      property.locationScore = evidence.metrics;
      property.locationEvidence = evidence;
      if (evidence.datasetId === "gb_r001") property.gbR001 = evidence;
      changed = true;
    } else if (!property.fitScoreSource) {
      property.fitScoreSource = score?.source || "unsupported";
      changed = true;
    }
  }));
  if (changed) saveState();
  return changed;
}

async function rebuildLocationScores() {
  let changed = false;
  for (const property of state.properties) {
    if (!property.lat || !property.lng) continue;
    const applied = await applyLocationScore(property, {
      preserveFitScore: false,
      preserveSubwayDistance: false,
    });
    changed = changed || applied;
  }
  if (changed) saveState();
  return changed;
}

function findNearestSubway(property) {
  const places = new kakao.maps.services.Places();
  const location = new kakao.maps.LatLng(property.lat, property.lng);
  return new Promise((resolve) => {
    places.categorySearch("SW8", (results, status) => {
      resolve(status === kakao.maps.services.Status.OK ? results?.[0] : null);
    }, {
      location,
      radius: 3000,
      sort: kakao.maps.services.SortBy.DISTANCE,
    });
  });
}

async function applyLocationScore(property, options = {}) {
  const score = await getLocationScore(property);
  if (!score?.datasetId) {
    property.fitScoreSource = score?.source || "unsupported";
    return false;
  }
  const evidence = buildLocationEvidence(property, score);
  if (!options.preserveFitScore || !Number.isFinite(Number(property.fitScore)) || Number(property.fitScore) <= 0) property.fitScore = evidence.metrics.score;
  if (!options.preserveSubwayDistance && evidence.metrics.subwayDistance) property.subwayDistance = evidence.metrics.subwayDistance;
  property.fitScoreSource = evidence.source;
  property.locationScore = evidence.metrics;
  property.locationEvidence = evidence;
  if (evidence.datasetId === "gb_r001") property.gbR001 = evidence;
  return true;
}

async function getLocationScore(property) {
  if (!property?.lat || !property?.lng) return { score: 0, source: "missing-coordinate" };
  const datasets = await loadLocationScoreDatasets();
  if (!datasets.length) return { score: 0, source: "location-score-unavailable" };

  let fallbackScore = null;
  for (const dataset of datasets) {
    const [minLng, minLat, maxLng, maxLat] = dataset.bbox || [];
    const score = scoreFromLocationDataset(property, dataset);
    if (!score) continue;
    if (pointInBbox(property.lng, property.lat, [minLng, minLat, maxLng, maxLat]) && score.score) return score;
    if (!fallbackScore && score.score !== undefined) fallbackScore = { ...score, source: `${dataset.id}:proxy` };
  }
  return fallbackScore || { score: 0, source: "unsupported" };
}

function scoreFromLocationDataset(property, dataset) {
  const candidates = dataset.features.filter((feature) => pointInBbox(property.lng, property.lat, feature.bbox));
  const matched = candidates.find((feature) => feature.rings?.some((ring) => pointInRing(property.lng, property.lat, ring)));
  const feature = matched || nearestFeature(property.lng, property.lat, candidates.length ? candidates : dataset.features);
  if (!feature) return null;
  const metrics = feature.metrics || {};
  const featureKey = featureKeyFor(feature);
  const centroid = Array.isArray(feature.centroid) && feature.centroid.length >= 2 ? feature.centroid : null;
  const distanceKmToFeature = centroid ? distanceKm(property.lat, property.lng, Number(centroid[1]), Number(centroid[0])) : 0;
  const proximityScore = Math.max(0, 10 - Math.min(10, distanceKmToFeature * 2));
  const baseScore = Number(metrics.totalScore || 0);
  const finalScore = Number(Math.max(0, Math.min(10, (baseScore * 0.8) + (proximityScore * 0.2))).toFixed(1));
  return {
    source: matched ? `${dataset.id}:polygon` : `${dataset.id}:nearest`,
    datasetId: dataset.id,
    datasetName: dataset.name,
    region: dataset.region || "",
    matchMode: matched ? "polygon" : "nearest",
    featureKey,
    propertyLat: Number(property.lat || 0),
    propertyLng: Number(property.lng || 0),
    featureCentroid: feature.centroid || [],
    featureBBox: feature.bbox || [],
    score: finalScore,
    baseScore,
    proximityScore: Number(proximityScore.toFixed(1)),
    distanceToFeatureMeters: Number((distanceKmToFeature * 1000).toFixed(0)),
    subwayDistance: Number(metrics.subwayDistance || 0),
    usageScore: Number(metrics.usageScore || 0),
    policeDistance: Number(metrics.policeDistance || 0),
    universityDistance: Number(metrics.universityDistance || 0),
    policeScore: Number(metrics.policeScore || 0),
    universityScore: Number(metrics.universityScore || 0),
  };
}

function hasFitScore(property) {
  return Number.isFinite(Number(property?.fitScore));
}

function buildLocationEvidence(property, score) {
  const source = String(score?.source || score?.datasetId || score?.datasetName || "unsupported");
  return {
    modelVersion: 4,
    source,
    datasetId: score?.datasetId || "unknown",
    datasetName: score?.datasetName || "미입력",
    region: score?.region || property?.region || "",
    matchMode: score?.matchMode || "unknown",
    featureKey: score?.featureKey || "",
    property: {
      id: property?.id || "",
      name: property?.name || "",
      region: property?.region || "",
      lat: Number(property?.lat || 0),
      lng: Number(property?.lng || 0),
    },
    feature: {
      bbox: score?.featureBBox || [],
      centroid: score?.featureCentroid || [],
    },
    metrics: {
      score: Number(score?.score || 0),
      baseScore: Number(score?.baseScore || 0),
      proximityScore: Number(score?.proximityScore || 0),
      distanceToFeatureMeters: Number(score?.distanceToFeatureMeters || 0),
      subwayDistance: Number(score?.subwayDistance || 0),
      usageScore: Number(score?.usageScore || 0),
      policeDistance: Number(score?.policeDistance || 0),
      universityDistance: Number(score?.universityDistance || 0),
      policeScore: Number(score?.policeScore || 0),
      universityScore: Number(score?.universityScore || 0),
    },
  };
}

function featureKeyFor(feature) {
  const centroid = Array.isArray(feature?.centroid) ? feature.centroid.map((value) => Number(value || 0).toFixed(6)).join(",") : "";
  const bbox = Array.isArray(feature?.bbox) ? feature.bbox.map((value) => Number(value || 0).toFixed(6)).join(",") : "";
  return [bbox, centroid].filter(Boolean).join("|");
}

async function loadLocationScoreDatasets() {
  if (locationScoreDatasets) return locationScoreDatasets;
  if (!locationScoreDatasetsPromise) {
    locationScoreDatasetsPromise = fetch("/data/location-score/index.json", { headers: { Accept: "application/json" } })
      .then((response) => (response.ok ? response.json() : null))
      .then(async (registry) => {
        const entries = registry?.datasets || [];
        const loaded = await Promise.all(entries.map(async (entry) => {
          try {
            const response = await fetch(entry.path, { headers: { Accept: "application/json" } });
            if (!response.ok) return null;
            const dataset = await response.json();
            return { ...entry, ...dataset };
          } catch {
            return null;
          }
        }));
        locationScoreDatasets = loaded.filter(Boolean);
        return locationScoreDatasets;
      })
      .catch(() => []);
  }
  return locationScoreDatasetsPromise;
}

function pointInBbox(lng, lat, bbox) {
  if (!bbox || bbox.length < 4) return false;
  return lng >= bbox[0] && lat >= bbox[1] && lng <= bbox[2] && lat <= bbox[3];
}

function pointInRing(lng, lat, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i, i += 1) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersects = ((yi > lat) !== (yj > lat))
      && (lng < ((xj - xi) * (lat - yi)) / ((yj - yi) || Number.EPSILON) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function nearestFeature(lng, lat, features) {
  return [...features]
    .sort((a, b) => squaredDistance(lng, lat, a.centroid) - squaredDistance(lng, lat, b.centroid))[0];
}

function squaredDistance(lng, lat, centroid = []) {
  const dx = lng - Number(centroid[0] || 0);
  const dy = lat - Number(centroid[1] || 0);
  return dx * dx + dy * dy;
}

function getMonitorLawdCodes() {
  const configured = String(state.settings.lawdCode || "")
    .split(",")
    .map((code) => onlyDigits(code).slice(0, 5))
    .filter((code) => code.length === 5);
  const inferred = [];
  if (state.properties.some((property) => property.region?.includes("수정구"))) inferred.push("41131");
  if (state.properties.some((property) => property.region?.includes("중원구"))) inferred.push("41133");
  return [...new Set([...configured, ...inferred])].length
    ? [...new Set([...configured, ...inferred])]
    : ["41131", "41133"];
}

async function fetchMolitRecords(type, lawdCode, dealMonth) {
  try {
    const serviceKey = state.settings.molitKey || privateConfig.molitKey || "";
    const query = new URLSearchParams({
      lawdCode,
      dealMonth,
    });
    if (serviceKey) query.set("serviceKey", serviceKey);
    const response = await fetch(`/api/molit/${type}?${query.toString()}`);
    if (!response.ok) throw new Error(`${type} API ${response.status}`);
    const xmlText = await response.text();
    return parseMolitXml(xmlText, type);
  } catch (error) {
    const first = state.properties[0];
    if (first) addTimeline(first.id, "국토부", `${type === "trade" ? "매매" : "전월세"} API 조회 실패: ${error.message}`);
    return [];
  }
}

function parseMolitXml(xmlText, type) {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  return [...doc.querySelectorAll("item")].map((item) => {
    const record = {};
    item.childNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) record[node.nodeName] = node.textContent.trim();
    });
    return type === "rent" ? normalizeRentRecord(record) : normalizeTradeRecord(record);
  });
}

function normalizeTradeRecord(record) {
  const [year, month, day] = extractMolitDate(record);
  const dateKey = buildMolitDateKey(year, month, day);
  return {
    aptName: record.aptNm || record.아파트 || record.아파트명 || record.단지명 || record.aptName || record.단지 || "",
    umdName: record.umdNm || record.법정동 || record.법정동읍면동 || record.읍면동 || "",
    sggCode: record.sggCd || record.roadNmSggCd || "",
    amount: parseAmount(record.dealAmount || record.거래금액 || record.dealAmt || record.매매금액),
    area: Number(record.excluUseAr || record.전용면적 || record["전용면적_㎡"] || 0),
    floor: Number(record.floor || record.층 || record.동 || 0),
    buildYear: Number(record.buildYear || record.건축년도 || record.준공년도 || 0),
    date: formatDealDate(year, month, day) || formatMolitMonthLabel(year, month),
    dateKey,
    raw: record,
  };
}

function normalizeRentRecord(record) {
  const [year, month, day] = extractMolitDate(record);
  const dateKey = buildMolitDateKey(year, month, day);
  return {
    aptName: record.aptNm || record.아파트 || record.아파트명 || record.단지명 || record.aptName || record.단지 || "",
    umdName: record.umdNm || record.법정동 || record.법정동읍면동 || record.읍면동 || "",
    sggCode: record.sggCd || "",
    deposit: parseAmount(record.deposit || record.보증금액 || record.보증금 || record.depositAmount || record.전세금액),
    monthlyRent: parseAmount(record.monthlyRent || record.월세금액 || record.월세 || record.monthlyRentAmount),
    area: Number(record.excluUseAr || record.전용면적 || record["전용면적_㎡"] || 0),
    floor: Number(record.floor || record.층 || record.동 || 0),
    date: formatDealDate(year, month, day) || formatMolitMonthLabel(year, month),
    dateKey,
    raw: record,
  };
}

function applyMolitRecords(trades, rents) {
  state.properties = state.properties.map((property) => {
    const targetArea = Number(property.baseArea || property.area || 0);
    const trade = findBestMolitMatch(property, trades, { targetArea, areaTolerance: 3 });
    const rent = findBestMolitMatch(property, rents, { targetArea, areaTolerance: 3 });
    const updated = { ...property };
    if (trade?.amount) {
      const previous = Number(property.price || 0);
      updated.price = trade.amount;
      updated.area = trade.area || property.area;
      updated.baseArea = property.baseArea || property.area;
      updated.lastTradeDate = trade.date || property.lastTradeDate;
      updated.lastTradeFloor = trade.floor || property.lastTradeFloor;
      updated.buildYear = trade.buildYear || property.buildYear;
      updated.matchedTradeArea = trade.area || property.baseArea || property.area;
      updated.change = previous ? Number((((trade.amount - previous) / previous) * 100).toFixed(1)) : 0;
      createAlert(property.id, "price", `${property.name} 매매 실거래 반영`, `${formatPrice(trade.amount)} 거래가 반영되었습니다.`);
    }
    if (rent) {
      updated.rentDeposit = rent.deposit || property.rentDeposit;
      updated.monthlyRent = rent.monthlyRent || property.monthlyRent;
      updated.matchedRentArea = rent.area || property.baseArea || property.area;
    }
    return updated;
  });
}

function updatePropertyHistories(trades, rents) {
  state.propertyTradeHistory = {};
  state.propertyRentHistory = {};

  state.properties.forEach((property) => {
    const tradeSeries = buildMonthlySeries(property, trades, "trade");
    const rentSeries = buildMonthlySeries(property, rents, "rent");
    state.propertyTradeHistory[property.id] = tradeSeries;
    state.propertyRentHistory[property.id] = rentSeries;
  });
}

function buildMonthlySeries(property, records, kind) {
  const grouped = new Map();
  const targetArea = Number(property.baseArea || property.area || 0);
  const hasIdentity = [property.name, ...(property.aliases || [])].map(normalizeText).filter(Boolean).length > 0;
  records.forEach((record) => {
    if (targetArea && !isAreaCompatible(record.area, targetArea, 3)) return;
    if (hasIdentity && !isStrongMolitNameMatch(property, record)) return;
    const score = scoreMolitMatch(property, record);
    if (score <= 0) return;
    const month = String(record.date || "").slice(0, 7);
    if (!month) return;
    const current = grouped.get(month);
    const candidate = { record, score };
    if (!current || candidate.score > current.score || (candidate.score === current.score && Math.abs(Number(candidate.record.area || 0) - Number(property.baseArea || property.area || 0)) < Math.abs(Number(current.record.area || 0) - Number(property.baseArea || property.area || 0)))) {
      grouped.set(month, candidate);
    }
  });

  return [...grouped.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .slice(-12)
    .map(([month, item]) => kind === "trade" ? {
      month,
      area: item.record.area,
      price: item.record.amount,
      floor: item.record.floor,
    } : {
      month,
      area: item.record.area,
      deposit: item.record.deposit,
      monthlyRent: item.record.monthlyRent,
      floor: item.record.floor,
    });
}

function findBestMolitMatch(property, records, options = {}) {
  const targetArea = Number(options.targetArea || property.baseArea || property.area || 0);
  const areaTolerance = Number.isFinite(Number(options.areaTolerance)) ? Number(options.areaTolerance) : 3;
  const hasIdentity = [property.name, ...(property.aliases || [])].map(normalizeText).filter(Boolean).length > 0;
  const filtered = targetArea
    ? records.filter((record) => isAreaCompatible(record.area, targetArea, areaTolerance))
    : records;
  const namedMatches = filtered.filter((record) => isStrongMolitNameMatch(property, record));
  const pool = namedMatches.length ? namedMatches : (hasIdentity ? [] : filtered);
  return pool
    .map((record) => ({ record, score: scoreMolitMatch(property, record) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || (b.record.dateKey || 0) - (a.record.dateKey || 0))
    .map((item) => item.record)[0];
}

function isStrongMolitNameMatch(property, record) {
  const targetNames = [property.name, ...(property.aliases || [])].map(normalizeText).filter(Boolean);
  const apt = normalizeText(record.aptName);
  if (!apt || apt.length < 3) return false;
  return targetNames.some((target) => target === apt || target.includes(apt) || apt.includes(target));
}

function scoreMolitMatch(property, record) {
  const targetNames = [property.name, ...(property.aliases || [])].map(normalizeText).filter(Boolean);
  const strongTargets = targetNames.filter((target) => target.length >= 3);
  const apt = normalizeText(record.aptName);
  const regionText = [property.region, ...(property.expectedDistricts || [])].join(" ");
  let score = 0;

  if (!apt) return 0;
  if (targetNames.some((target) => target === apt)) score += 100;
  if (strongTargets.some((target) => target.includes(apt) || apt.includes(target))) score += 60;
  if (record.umdName && regionText.includes(record.umdName)) score += 30;
  if (record.sggCode === "41131" && regionText.includes("수정구")) score += 20;
  if (record.sggCode === "41133" && regionText.includes("중원구")) score += 20;
  score += scoreAreaMatch(property, record);

  if (apt.length <= 2 && !record.umdName) score -= 35;
  if (apt.length <= 2 && !record.sggCode) score -= 20;
  if (targetNames.length && !targetNames.some((target) => target === apt) && !isAreaCompatible(record.area, Number(property.baseArea || property.area || 0), 3)) score -= 20;
  if (score > 0) return score;
  return scoreMolitFallback(property, record);
}

function isAreaCompatible(recordArea, targetArea, tolerance = 3) {
  const target = Number(targetArea || 0);
  const area = Number(recordArea || 0);
  if (!target || !area) return true;
  return Math.abs(area - target) <= tolerance;
}

function scoreMolitFallback(property, record) {
  const region = String(property.region || "");
  const umd = String(record.umdName || "");
  const cityHints = ["성남", "수정구", "중원구", "단대동", "은행동"];
  const matchesDistrict = cityHints.some((hint) => region.includes(hint) && umd.includes(hint));
  const target = Number(property.baseArea || property.area || 0);
  const recordArea = Number(record.area || 0);
  const areaDiff = target && recordArea ? Math.abs(target - recordArea) : 999;

  let score = 0;
  if (matchesDistrict) score += 20;
  if (record.sggCode === "41131" && region.includes("수정구")) score += 15;
  if (record.sggCode === "41133" && region.includes("중원구")) score += 15;
  if (areaDiff <= 1) score += 20;
  else if (areaDiff <= 2) score += 16;
  else if (areaDiff <= 3) score += 12;
  else if (areaDiff <= 5) score += 8;
  else if (areaDiff <= 8) score += 4;
  if (normalizeText(record.aptName)) score += 2;
  return score;
}

function scoreAreaMatch(property, record) {
  const target = Number(property.baseArea || property.area || 0);
  const recordArea = Number(record.area || 0);
  if (!target || !recordArea) return 0;
  const diff = Math.abs(target - recordArea);
  if (diff <= 1) return 40;
  if (diff <= 2) return 30;
  if (diff <= 3) return 22;
  if (diff <= 5) return 12;
  if (diff <= 8) return 6;
  return 0;
}

function parseAmount(value) {
  return Number(String(value || "").replace(/[^\d]/g, ""));
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function extractMolitDate(record) {
  const compact = onlyDigits(record.dealYmd || record.계약년월일 || record.contractYmd || "");
  const year = Number(
    record.dealYear
    || record.년
    || record.contractYear
    || (compact.length >= 4 ? compact.slice(0, 4) : 0)
  );
  const month = Number(
    record.dealMonth
    || record.계약월
    || record.월
    || record.contractMonth
    || (compact.length >= 6 ? compact.slice(4, 6) : (record.계약년월 ? String(record.계약년월).slice(4, 6) : 0))
  );
  const day = Number(
    record.dealDay
    || record.계약일
    || record.일
    || record.contractDay
    || (compact.length >= 8 ? compact.slice(6, 8) : 0)
  );
  return [year, month, day];
}

function formatDealDate(year, month, day) {
  if (!year || !month) return "";
  if (!day) return `${year}-${String(month).padStart(2, "0")}`;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatMolitMonthLabel(year, month) {
  if (!year || !month) return "";
  return `${year}-${String(month).padStart(2, "0")}`;
}

function buildMolitDateKey(year, month, day) {
  if (!year || !month) return 0;
  const normalizedDay = day || 0;
  return Number(`${year}${String(month).padStart(2, "0")}${String(normalizedDay).padStart(2, "0")}`);
}

function createPropertyNews(property) {
  const keyword = property.name || property.region;
  return {
    id: `n-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    propertyId: property.id,
    keyword,
    title: `${property.name} 관련 부동산 흐름 업데이트`,
    summary: `${property.name} 관심 자산과 연결된 뉴스입니다. 실거래, 전월세, 개발 이슈를 함께 확인하세요.`,
    source: "자산 모니터",
    at: new Date().toISOString().slice(0, 10),
  };
}

function getNewsTargets() {
  return getInterestZoneProperties()
    .map((property) => ({
      property,
      keyword: property.name || property.region || property.tags?.[0] || "",
    }))
    .filter(({ property, keyword }) => Boolean(property?.id && keyword))
    .slice(0, 6);
}

async function collectMacroSignals() {
  const specs = [
    {
      label: "정책",
      keyword: "부동산 정책",
      keywords: ["주택공급", "대출규제", "재건축", "청약"],
      titlePrefix: "부동산 정책",
    },
    {
      label: "주택",
      keyword: "주택 공급",
      keywords: ["공급", "분양", "입주", "청약"],
      titlePrefix: "주택 공급",
    },
    {
      label: "대출",
      keyword: "주택 대출",
      keywords: ["대출", "DSR", "LTV", "금융규제"],
      titlePrefix: "대출 환경",
    },
    {
      label: "금리",
      keyword: "한국은행 기준금리",
      keywords: ["금리", "한국은행", "대출금리", "기준금리"],
      titlePrefix: "금리",
    },
    {
      label: "전세",
      keyword: "전세 시장",
      keywords: ["전세", "역전세", "임대차", "보증금"],
      titlePrefix: "전세 시장",
    },
  ];
  const signals = await Promise.all(specs.map(async (spec) => {
    const signal = await collectMacroNewsSignal(spec);
    return signal || {
      label: spec.label,
      title: `${spec.titlePrefix} 수집 대기`,
      summary: `${spec.keyword} 관련 흐름을 배치로 수집합니다.`,
      source: "시스템",
      at: new Date().toISOString().slice(0, 10),
      empty: true,
    };
  }));
  const fx = await fetchExchangeRateSignal();
  return { signals, fx };
}

async function collectMacroNewsSignal({ label, keyword, keywords, titlePrefix }) {
  const endpoint = String(state.settings.newsEndpoint || "/api/news").trim();
  if (!endpoint) return null;
  try {
    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set("keyword", keyword);
    url.searchParams.set("keywords", keywords.join(","));
    const response = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    if (!response.ok) return null;
    const payload = await response.json();
    const items = normalizeNewsPayload(payload, { id: "", name: keyword, region: keyword, tags: [] }, keyword);
    const latest = items[0];
    if (!latest) return null;
    return {
      label,
      title: cleanNewsText(latest.title || `${titlePrefix} 동향`),
      summary: cleanNewsText(latest.summary || `${keyword} 관련 흐름을 확인하세요.`),
      source: cleanNewsText(latest.source || "외부 수집"),
      at: latest.at || new Date().toISOString().slice(0, 10),
    };
  } catch {
    return null;
  }
}

async function fetchExchangeRateSignal() {
  const sources = [
    {
      label: "USD/KRW",
      url: "https://open.er-api.com/v6/latest/USD",
      parse: (payload) => {
        const rate = Number(payload?.rates?.KRW);
        if (!rate) return null;
        return {
          label: "환율",
          value: `${rate.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}원`,
          source: "open.er-api.com",
          at: payload?.time_last_update_utc ? String(payload.time_last_update_utc).slice(0, 16) : new Date().toISOString().slice(0, 10),
        };
      },
    },
  ];

  for (const source of sources) {
    try {
      const response = await fetch(source.url, { headers: { Accept: "application/json" } });
      if (!response.ok) continue;
      const payload = await response.json();
      const parsed = source.parse(payload);
      if (parsed) return parsed;
    } catch {
      // ignore and continue
    }
  }

  return null;
}

async function collectNewsItems() {
  const endpoint = String(state.settings.newsEndpoint || "/api/news").trim();
  if (!endpoint) return [];

  const targets = getNewsTargets();
  const settled = await Promise.allSettled(targets.map(async ({ property, keyword }) => {
    const url = new URL(endpoint, window.location.origin);
    url.searchParams.set("keyword", keyword);
    url.searchParams.set("keywords", (property.tags || []).join(","));

    const response = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return [];

    const payload = await response.json();
    return normalizeNewsPayload(payload, property, keyword);
  }));

  return settled.flatMap((result) => (result.status === "fulfilled" ? result.value : []));
}

function normalizeNewsPayload(payload, property, keyword) {
  const items = Array.isArray(payload) ? payload : (payload?.items || payload?.news || []);
  return items.map((item) => ({
    id: item.id || `n-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    propertyId: item.propertyId || property.id || inferPropertyId(item, keyword, property),
    keyword: cleanNewsText(item.keyword || property.name || keyword),
    title: cleanNewsText(item.title || item.headline || `${property.name} 관련 뉴스`),
    summary: cleanNewsText(item.summary || item.description || item.content || ""),
    source: cleanNewsText(item.source || item.publisher || "관심 자산 수집"),
    at: item.at || item.publishedAt || item.date || new Date().toISOString().slice(0, 10),
  }));
}

function inferPropertyId(item, keyword, fallbackProperty = null) {
  const haystack = [item.title, item.summary, item.content, keyword, fallbackProperty?.name, fallbackProperty?.region].join(" ");
  const matched = state.properties.find((property) => {
    const tokens = [property.name, property.region, ...(property.tags || [])].filter(Boolean);
    return tokens.some((token) => haystack.includes(token));
  });
  return matched?.id || fallbackProperty?.id || "";
}

function mergeNewsItems(freshItems, existingItems) {
  const byKey = new Map();
  [...freshItems, ...existingItems].forEach((item) => {
    if (isSampleNews(item)) return;
    const normalized = {
      ...item,
      keyword: cleanNewsText(item.keyword),
      title: cleanNewsText(item.title),
      summary: cleanNewsText(item.summary),
      source: cleanNewsText(item.source),
    };
    const key = [normalizeText(normalized.title), normalized.at, normalized.propertyId].join("|");
    if (!byKey.has(key)) byKey.set(key, normalized);
  });
  return [...byKey.values()].sort((a, b) => String(b.at).localeCompare(String(a.at)));
}

function filterActiveNews(items) {
  return items.filter((item) => {
    const property = findProperty(item.propertyId);
    return Boolean(property);
  });
}

function isSampleNews(item) {
  return item?.source === "자산 모니터";
}

function cleanNewsText(value) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = String(value || "");
  return textarea.value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createAlert(propertyId, type, title, body) {
  state.alerts = [{
    id: `a-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    propertyId,
    type,
    title,
    body,
    at: new Date().toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    read: false,
  }, ...state.alerts];
}

function addTimeline(propertyId, kind, text) {
  state.timeline = [{
    id: `t-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    propertyId,
    kind,
    text,
    at: new Date().toISOString().slice(0, 10),
  }, ...state.timeline];
}

function findProperty(id) {
  return state.properties.find((property) => property.id === id);
}

function setToday() {
  document.querySelector("#visitDate").value = new Date().toISOString().slice(0, 10);
}

function formatPrice(value) {
  if (!value) return "시세 미입력";
  if (value >= 10000) {
    const eok = Math.floor(value / 10000);
    const rest = value % 10000;
    return rest ? `${eok}억 ${rest.toLocaleString()}만` : `${eok}억`;
  }
  return `${value.toLocaleString()}만`;
}

function formatScore(value) {
  return Number(value || 0).toFixed(1);
}

function formatFitScore(property) {
  if (!property.fitScore) return "";
  return formatScore(property.fitScore);
}

function describeLocationScoreSource(score) {
  const source = String(score?.source || score?.datasetId || score?.datasetName || "").toLowerCase();
  if (score?.datasetName) return score.datasetName;
  if (source.includes("gb_r001")) return "GB R001";
  if (source.includes("vworld")) return "VWorld";
  if (source.includes("molit") || source.includes("trade") || source.includes("rent")) return "국토부";
  if (source.includes("kakao")) return "Kakao";
  return "미입력";
}

function formatDistance(value) {
  if (!value) return "미입력";
  return `${Math.round(value).toLocaleString()}m`;
}

function formatRent(deposit, monthlyRent) {
  if (!deposit && !monthlyRent) return "미입력";
  if (monthlyRent) return `보증금 ${formatPrice(deposit)} / 월 ${monthlyRent.toLocaleString()}만`;
  return `전세 ${formatPrice(deposit)}`;
}

function buildVworldBoundaryUrl({ includeKey } = { includeKey: false }) {
  const params = new URLSearchParams({
    service: "data",
    version: "2.0",
    request: "GetFeature",
    data: "LT_C_ADSIGG_INFO",
    format: "json",
    size: "1",
    page: "1",
    crs: "EPSG:4326",
    geometry: "true",
    attribute: "true",
    attrFilter: `sig_cd:=:${state.settings.lawdCode || defaultState.settings.lawdCode}`,
  });

  if (includeKey && state.settings.vworldKey) params.set("key", state.settings.vworldKey);
  if (state.settings.vworldDomain) params.set("domain", state.settings.vworldDomain);
  return `${state.settings.vworldEndpoint || defaultState.settings.vworldEndpoint}?${params.toString()}`;
}

async function unlockOrSetAdminPasscode() {
  const input = document.querySelector("#adminPasscode");
  const passcode = input.value;
  const lockedUntil = Number(state.security.lockedUntil || 0);
  const tempPasscodeExpiresAt = Number(state.security.tempPasscodeExpiresAt || 0);

  if (lockedUntil > Date.now()) {
    renderSecurity();
    return;
  }

  if (passcode.length < 6) {
    setSecurityMessage("패스코드는 6자 이상이어야 합니다.");
    return;
  }

  if (!state.security.passcodeHash) {
    if (passcode !== DEFAULT_ADMIN_PASSCODE) {
      setSecurityMessage("기본 패스코드는 jeongmin 입니다.");
      return;
    }
    state.security.salt = DEFAULT_ADMIN_PASSCODE_SALT;
    state.security.passcodeHash = DEFAULT_ADMIN_PASSCODE_HASH;
    state.security.failedAttempts = 0;
    state.security.lockedUntil = 0;
    adminUnlocked = true;
    saveState();
    input.value = "";
    scheduleAdminAutoLock();
    render();
    return;
  }

  if (state.security.tempPasscodeHash && tempPasscodeExpiresAt > Date.now()) {
    const tempCandidate = await hashPasscode(passcode, state.security.tempPasscodeSalt);
    if (tempCandidate === state.security.tempPasscodeHash) {
      state.security.failedAttempts = 0;
      state.security.lockedUntil = 0;
      state.security.resetRequired = true;
      adminUnlocked = true;
      saveState();
      input.value = "";
      setView("recovery");
      renderSecurity();
      return;
    }
  }

  const candidateHash = await hashPasscode(passcode, state.security.salt);
  if (candidateHash === state.security.passcodeHash) {
    state.security.failedAttempts = 0;
    state.security.lockedUntil = 0;
    adminUnlocked = true;
    saveState();
    input.value = "";
    scheduleAdminAutoLock();
    render();
    return;
  }

  state.security.failedAttempts = Number(state.security.failedAttempts || 0) + 1;
  if (state.security.failedAttempts >= 5) {
    state.security.lockedUntil = Date.now() + 5 * 60 * 1000;
    state.security.failedAttempts = 0;
  }
  adminUnlocked = false;
  saveState();
  input.value = "";
  renderSecurity();
}

function lockAdmin() {
  adminUnlocked = false;
  securityRecoveryOpen = false;
  state.security.resetRequired = false;
  securityRecoverySending = false;
  if (adminAutoLockTimer) clearTimeout(adminAutoLockTimer);
  renderSecurity();
  renderTopActions();
  renderSettings();
}

function openRecoveryScreen() {
  securityRecoveryOpen = true;
  state.security.resetRequired = false;
  const recoveryName = document.querySelector("#recoveryName");
  const recoveryEmail = document.querySelector("#recoveryEmail");
  if (recoveryName) recoveryName.value = "";
  if (recoveryEmail) recoveryEmail.value = "";
  setView("recovery");
  renderSecurity();
}

async function sendRecoveryEmail() {
  if (adminUnlocked) return;
  const recoveryName = value("#recoveryName");
  const recoveryEmail = value("#recoveryEmail");
  if (!recoveryName) {
    setSecurityMessage("이름을 입력하세요.");
    return;
  }
  if (!recoveryEmail) {
    setSecurityMessage("이메일을 입력하세요.");
    return;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(recoveryEmail)) {
    setSecurityMessage("이메일 형식이 아닙니다.");
    return;
  }

  const tempPasscode = generateTempPasscode();
  const tempPasscodeSalt = generateTempSalt();
  const tempPasscodeHash = await hashPasscode(tempPasscode, tempPasscodeSalt);
  const expiresAt = Date.now() + 10 * 60 * 1000;

  state.security.tempPasscodeHash = tempPasscodeHash;
  state.security.tempPasscodeSalt = tempPasscodeSalt;
  state.security.tempPasscodeExpiresAt = expiresAt;
  state.security.resetRequired = false;
  securityRecoverySending = true;
  setSecurityMessage("임시 비밀번호를 보내는 중입니다...");
  renderSecurity();
  saveState();

  const sent = await sendRecoveryDispatch({ recoveryName, recoveryEmail, tempPasscode, expiresAt });
  securityRecoverySending = false;
  setSecurityMessage(sent ? "임시 비밀번호를 보냈습니다." : "보내지 못했습니다. 설정과 로그를 확인하세요.");
  renderSecurity();
}

async function sendRecoveryDispatch({ recoveryName, recoveryEmail, tempPasscode, expiresAt }) {
  try {
    const response = await fetch("/api/admin/recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        recoveryName,
        recoveryEmail,
        tempPasscode,
        expiresAt,
        origin: window.location.origin,
      }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload?.error || `recovery email ${response.status}`);
    if (payload?.sent) return true;
    throw new Error(payload?.error || "recovery email not sent");
  } catch (error) {
    setSecurityMessage(`임시 비밀번호 발송 실패: ${error?.message || "알 수 없는 오류"}`);
    return false;
  }
}

async function saveNewAdminPasscode() {
  const newPasscode = value("#newAdminPasscode");
  const confirmPasscode = value("#newAdminPasscodeConfirm");
  if (newPasscode.length < 6) {
    setSecurityMessage("새 비밀번호는 6자 이상이어야 합니다.");
    return;
  }
  if (newPasscode !== confirmPasscode) {
    setSecurityMessage("새 비밀번호가 서로 다릅니다.");
    return;
  }

  const salt = generateTempSalt();
  const passcodeHash = await hashPasscode(newPasscode, salt);
  state.security.passcodeHash = passcodeHash;
  state.security.salt = salt;
  state.security.failedAttempts = 0;
  state.security.lockedUntil = 0;
  state.security.resetRequired = false;
  state.security.tempPasscodeHash = DEFAULT_TEMP_PASSCODE_HASH;
  state.security.tempPasscodeSalt = DEFAULT_TEMP_PASSCODE_SALT;
  state.security.tempPasscodeExpiresAt = DEFAULT_TEMP_PASSCODE_EXPIRES_AT;
  adminUnlocked = true;
  saveState();
  document.querySelector("#newAdminPasscode").value = "";
  document.querySelector("#newAdminPasscodeConfirm").value = "";
  document.querySelector("#adminPasscode").value = "";
  scheduleAdminAutoLock();
  setView("admin");
  render();
}

function scheduleAdminAutoLock() {
  if (adminAutoLockTimer) clearTimeout(adminAutoLockTimer);
  adminAutoLockTimer = setTimeout(() => {
    lockAdmin();
  }, 10 * 60 * 1000);
}

async function hashPasscode(passcode, salt) {
  const bytes = new TextEncoder().encode(`${salt}:${passcode}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function generateTempPasscode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function generateTempSalt() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

setToday();

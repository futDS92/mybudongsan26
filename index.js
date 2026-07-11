import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const DEFAULT_SUPABASE_RECOVERY_URL = "https://pyvnpynvvkyrkrtpeyzt.supabase.co/functions/v1/admin-recovery";
const DEFAULT_RECOVERY_SHARED_SECRET = "c4d8f1a7e92b4c3d8f0e6a1b5c7d9e2f1a3c5d7b9e0f2a4c6d8e1f3a5b7c9d0";
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};
const molitCache = new Map();
const newsCache = new Map();

export default async function handler(req, res) {
  const url = new URL(req.url, "https://mybudongsan26.vercel.app");
  if (url.pathname === "/api/admin/recovery") {
    await handleRecovery(req, res);
    return;
  }
  if (url.pathname.startsWith("/api/molit/")) {
    await handleMolit(url, res);
    return;
  }
  if (url.pathname === "/api/news") {
    await handleNews(url, res);
    return;
  }

  const isTossMode = url.pathname === "/toss" || url.pathname === "/miniapp";
  const pathname = url.pathname === "/" && isTossMode
    ? "/app.html"
    : url.pathname === "/" ? "/index.html"
    : url.pathname === "/app" || isTossMode ? "/app.html"
    : url.pathname;
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath);
  const ext = extname(filePath);

  try {
    const body = await readFile(filePath);
    res.statusCode = 200;
    res.setHeader("Content-Type", contentTypes[ext] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-store");
    res.end(body);
  } catch {
    if (ext && ext !== ".html") {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.setHeader("Cache-Control", "no-store");
      res.end("Not found");
      return;
    }
    const fallback = await readFile(join(root, "index.html"));
    res.statusCode = 200;
    res.setHeader("Content-Type", contentTypes[".html"]);
    res.setHeader("Cache-Control", "no-store");
    res.end(fallback);
  }
}

async function handleRecovery(req, res) {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const payload = await readJsonBody(req);
  const recoveryName = String(payload.recoveryName || "").trim();
  const recoveryEmail = String(payload.recoveryEmail || "").trim();
  const tempPasscode = String(payload.tempPasscode || "").trim();
  const expiresAt = Number(payload.expiresAt || 0);
  const origin = String(payload.origin || "https://mybudongsan26.vercel.app").trim();

  if (!recoveryName || !recoveryEmail || !tempPasscode || !expiresAt) {
    sendJson(res, 400, { sent: false, error: "Missing recovery payload" });
    return;
  }

  const supabaseRecoveryUrl = String(process.env.SUPABASE_RECOVERY_URL || process.env.SUPABASE_ADMIN_RECOVERY_URL || DEFAULT_SUPABASE_RECOVERY_URL).trim();
  const recoverySecret = String(process.env.RECOVERY_SHARED_SECRET || DEFAULT_RECOVERY_SHARED_SECRET).trim();
  if (supabaseRecoveryUrl) {
    const forwarded = await forwardRecoveryRequest({
      url: supabaseRecoveryUrl,
      secret: recoverySecret,
      payload: { recoveryName, recoveryEmail, tempPasscode, expiresAt, origin },
    });
    if (forwarded.ok) {
      sendJson(res, 200, { sent: true, provider: "supabase" });
      return;
    }
    sendJson(res, forwarded.status || 502, {
      sent: false,
      provider: "supabase",
      error: forwarded.data?.error || forwarded.error || "Recovery email forward failed",
    });
    return;
  }

  const apiKey = String(process.env.RESEND_API_KEY || "").trim();
  const from = String(process.env.RECOVERY_FROM_EMAIL || "").trim();
  if (!apiKey || !from) {
    sendJson(res, 501, { sent: false, error: "Recovery email service is not configured" });
    return;
  }

  const subject = "부동산 모니터 임시 비밀번호";
  const text = [
    `${recoveryName}님, 관리자 임시 비밀번호를 발급했습니다.`,
    "",
    `임시 비밀번호: ${tempPasscode}`,
    `만료 시각: ${new Date(expiresAt).toLocaleString("ko-KR")}`,
    "",
    "로그인 화면의 'Admin 패스코드 또는 임시 비밀번호' 칸에 위 값을 입력한 뒤 새 비밀번호를 설정하세요.",
    `도메인: ${origin}`,
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [recoveryEmail],
      subject,
      text,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    sendJson(res, 502, { sent: false, error: errorText || `Resend ${response.status}` });
    return;
  }

  sendJson(res, 200, { sent: true });
}

async function forwardRecoveryRequest({ url, secret, payload }) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(secret ? { "x-recovery-secret": secret } : {}),
      },
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    return {
      ok: response.ok && Boolean(data?.sent),
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      ok: false,
      error: error?.message || String(error),
    };
  }
}

async function handleMolit(url, res) {
  const serviceKey = normalizeServiceKey(url.searchParams.get("serviceKey") || process.env.MOLIT_SERVICE_KEY || "");
  if (!serviceKey) {
    sendJson(res, 500, { error: "MOLIT_SERVICE_KEY is not configured" });
    return;
  }

  const type = url.pathname.endsWith("/rent") ? "rent" : "trade";
  const lawdCode = onlyDigits(url.searchParams.get("lawdCode")).slice(0, 5);
  const dealMonth = onlyDigits(url.searchParams.get("dealMonth")).slice(0, 6);
  if (lawdCode.length !== 5 || dealMonth.length !== 6) {
    sendJson(res, 400, { error: "lawdCode(5 digits) and dealMonth(YYYYMM) are required" });
    return;
  }

  const endpoint = type === "rent"
    ? "https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent"
    : "https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev";
  const apiUrl = new URL(endpoint);
  apiUrl.searchParams.set("serviceKey", serviceKey);
  apiUrl.searchParams.set("LAWD_CD", lawdCode);
  apiUrl.searchParams.set("DEAL_YMD", dealMonth);
  apiUrl.searchParams.set("pageNo", url.searchParams.get("pageNo") || "1");
  apiUrl.searchParams.set("numOfRows", url.searchParams.get("numOfRows") || "1000");

  const cacheKey = `${type}:${lawdCode}:${dealMonth}:${apiUrl.searchParams.get("pageNo")}:${apiUrl.searchParams.get("numOfRows")}`;
  if (molitCache.has(cacheKey)) {
    sendXml(res, 200, molitCache.get(cacheKey), { "X-Cache": "HIT" });
    return;
  }

  const response = await fetch(apiUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 real-estate-monitor/1.0",
      "Accept": "application/xml,text/xml,*/*",
      "Accept-Language": "ko-KR,ko;q=0.9,en;q=0.8",
      "Origin": "https://www.data.go.kr",
      "Referer": "https://www.data.go.kr/",
    },
  });
  const xml = await response.text();
  if (response.ok) molitCache.set(cacheKey, xml);
  sendXml(res, response.ok ? 200 : response.status, xml);
}

async function handleNews(url, res) {
  const keyword = String(url.searchParams.get("keyword") || "").trim();
  const keywords = splitKeywords(url.searchParams.get("keywords"));
  const limit = clampNumber(url.searchParams.get("limit"), 1, 20, 10);
  if (!keyword) {
    sendJson(res, 400, { error: "keyword is required" });
    return;
  }

  const cacheKey = `${keyword}:${keywords.join("|")}:${limit}`;
  const cached = newsCache.get(cacheKey);
  if (cached && Date.now() - cached.at < 15 * 60 * 1000) {
    sendJson(res, 200, cached.payload, { "X-Cache": "HIT" });
    return;
  }

  const query = buildNewsQuery(keyword, keywords);
  const feeds = [
    {
      source: "Google News",
      url: `https://news.google.com/rss/search?q=${encodeURIComponent(`${query} when:30d`)}&hl=ko&gl=KR&ceid=KR:ko`,
    },
    {
      source: "Bing News",
      url: `https://www.bing.com/news/search?q=${encodeURIComponent(query)}&format=rss&setlang=ko-KR`,
    },
  ];

  let items = [];
  for (const feed of feeds) {
    const xml = await fetchRssText(feed.url);
    if (!xml) continue;
    items = parseRssFeed(xml, feed.source, limit);
    if (items.length) break;
  }

  const payload = { keyword, query, items: items.slice(0, limit) };
  newsCache.set(cacheKey, { at: Date.now(), payload });
  sendJson(res, 200, payload);
}

function sendXml(res, statusCode, body, headers = {}) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  res.end(body);
}

function sendJson(res, statusCode, payload, headers = {}) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8").trim();
  if (!raw) return {};
  return JSON.parse(raw);
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeServiceKey(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (!raw.includes("%")) return raw;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function splitKeywords(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildNewsQuery(keyword, keywords) {
  const extra = keywords.filter((item) => item !== keyword).slice(0, 3);
  return [keyword, ...extra].join(" ").trim();
}

async function fetchRssText(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 real-estate-monitor/1.0",
        "Accept": "application/rss+xml,application/xml,text/xml,*/*",
      },
    });
    if (!response.ok) return "";
    return await response.text();
  } catch {
    return "";
  }
}

function parseRssFeed(xmlText, source, limit) {
  const items = [];
  const blocks = [...xmlText.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  for (const block of blocks) {
    const xml = block[1];
    const title = cleanText(extractTag(xml, "title"));
    const link = cleanText(extractTag(xml, "link"));
    const description = cleanText(extractTag(xml, "description"));
    const pubDate = cleanText(extractTag(xml, "pubDate"));
    if (!title) continue;
    items.push({
      id: `${source}:${link || title}`.slice(0, 220),
      title,
      summary: cleanText(description).slice(0, 220),
      source,
      at: formatRssDate(pubDate),
      url: link,
    });
    if (items.length >= limit) break;
  }
  return items;
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeEntities(match[1].trim()) : "";
}

function cleanText(value) {
  return stripTags(decodeEntities(value)).replace(/\s+/g, " ").trim();
}

function stripTags(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function formatRssDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

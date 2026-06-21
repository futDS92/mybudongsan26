import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4177);
const host = process.env.HOST || "127.0.0.1";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
};
const molitCache = new Map();
const newsCache = new Map();

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/molit/")) {
      await handleMolit(url, res);
      return;
    }
    if (url.pathname === "/api/news") {
      await handleNews(url, res);
      return;
    }
    await serveStatic(url.pathname, res);
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: error.message || "server error" }));
  }
}).listen(port, host, () => {
  console.log(`real-estate-monitor running at http://${host}:${port}/`);
});

async function serveStatic(pathname, res) {
  const safePath = normalize(pathname === "/" ? "/index.html" : pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath);
  const body = await readFile(filePath);
  res.writeHead(200, {
    "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
    "Cache-Control": "no-store",
  });
  res.end(body);
}

async function handleMolit(url, res) {
  const serviceKey = process.env.MOLIT_SERVICE_KEY || "";
  if (!serviceKey) {
    res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "MOLIT_SERVICE_KEY is not configured" }));
    return;
  }

  const type = url.pathname.endsWith("/rent") ? "rent" : "trade";
  const lawdCode = onlyDigits(url.searchParams.get("lawdCode")).slice(0, 5);
  const dealMonth = onlyDigits(url.searchParams.get("dealMonth")).slice(0, 6);
  if (lawdCode.length !== 5 || dealMonth.length !== 6) {
    res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "lawdCode(5 digits) and dealMonth(YYYYMM) are required" }));
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
    res.writeHead(200, {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Cache": "HIT",
    });
    res.end(molitCache.get(cacheKey));
    return;
  }

  const response = await fetch(apiUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 real-estate-monitor/1.0",
      "Accept": "application/xml,text/xml,*/*",
    },
  });
  const xml = await response.text();
  if (response.ok) molitCache.set(cacheKey, xml);
  res.writeHead(response.ok ? 200 : response.status, {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(xml);
}

async function handleNews(url, res) {
  const keyword = String(url.searchParams.get("keyword") || "").trim();
  const keywords = splitKeywords(url.searchParams.get("keywords"));
  const limit = clampNumber(url.searchParams.get("limit"), 1, 20, 10);

  if (!keyword) {
    res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "keyword is required" }));
    return;
  }

  const cacheKey = `${keyword}:${keywords.join("|")}:${limit}`;
  const cached = newsCache.get(cacheKey);
  if (cached && Date.now() - cached.at < 15 * 60 * 1000) {
    res.writeHead(200, {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Cache": "HIT",
    });
    res.end(JSON.stringify(cached.payload));
    return;
  }

  const query = buildNewsQuery(keyword, keywords);
  const feeds = [
    {
      source: "Google News",
      url: `https://news.google.com/rss/search?q=${encodeURIComponent(query + " when:30d")}&hl=ko&gl=KR&ceid=KR:ko`,
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

  const payload = {
    keyword,
    query,
    items: items.slice(0, limit),
  };
  newsCache.set(cacheKey, { at: Date.now(), payload });
  res.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
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
      summary: stripTags(description).slice(0, 220),
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

function stripTags(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function cleanText(value) {
  return stripTags(decodeEntities(value)).replace(/\s+/g, " ").trim();
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

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

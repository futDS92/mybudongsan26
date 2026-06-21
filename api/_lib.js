const molitCache = new Map();
const newsCache = new Map();

function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
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

function decodeEntities(value) {
  return String(value || "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(value) {
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function cleanText(value) {
  return stripTags(decodeEntities(value)).replace(/\s+/g, " ").trim();
}

function formatRssDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function extractTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? decodeEntities(match[1].trim()) : "";
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

function parseMolitXml(xmlText, type) {
  const itemMatches = [...xmlText.matchAll(/<item>([\s\S]*?)<\/item>/g)];
  return itemMatches.map((match) => {
    const itemXml = match[1];
    const record = {};
    [...itemXml.matchAll(/<([^>]+)>([\s\S]*?)<\/\1>/g)].forEach((nodeMatch) => {
      record[nodeMatch[1]] = decodeEntities(nodeMatch[2].trim());
    });
    return type === "rent" ? normalizeRentRecord(record) : normalizeTradeRecord(record);
  });
}

function normalizeTradeRecord(record) {
  return {
    aptName: record.aptNm || record.아파트 || record.aptName || "",
    umdName: record.umdNm || record.법정동 || "",
    sggCode: record.sggCd || record.roadNmSggCd || "",
    amount: parseAmount(record.dealAmount || record.거래금액 || record.dealAmt),
    area: Number(record.excluUseAr || record.전용면적 || 0),
    floor: Number(record.floor || record.층 || 0),
    buildYear: Number(record.buildYear || record.건축년도 || 0),
    date: formatDealDate(record.dealYear, record.dealMonth, record.dealDay),
    dateKey: Number(`${record.dealYear || 0}${String(record.dealMonth || 0).padStart(2, "0")}${String(record.dealDay || 0).padStart(2, "0")}`),
    raw: record,
  };
}

function normalizeRentRecord(record) {
  return {
    aptName: record.aptNm || record.아파트 || record.aptName || "",
    umdName: record.umdNm || record.법정동 || "",
    sggCode: record.sggCd || "",
    deposit: parseAmount(record.deposit || record.보증금액 || record.depositAmount),
    monthlyRent: parseAmount(record.monthlyRent || record.월세금액 || record.monthlyRentAmount),
    area: Number(record.excluUseAr || record.전용면적 || 0),
    floor: Number(record.floor || record.층 || 0),
    date: formatDealDate(record.dealYear, record.dealMonth, record.dealDay),
    dateKey: Number(`${record.dealYear || 0}${String(record.dealMonth || 0).padStart(2, "0")}${String(record.dealDay || 0).padStart(2, "0")}`),
    raw: record,
  };
}

function parseAmount(value) {
  return Number(String(value || "").replace(/[^\d]/g, ""));
}

function formatDealDate(year, month, day) {
  if (!year || !month || !day) return "";
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

module.exports = {
  buildNewsQuery,
  clampNumber,
  cleanText,
  extractTag,
  fetchRssText,
  formatRssDate,
  molitCache,
  newsCache,
  onlyDigits,
  parseMolitXml,
  parseRssFeed,
  splitKeywords,
};

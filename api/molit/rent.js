const { molitCache, normalizeServiceKey, onlyDigits, parseMolitXml } = require("../_lib");

module.exports = async function handler(req, res) {
  await handleMolitRequest(req, res, "rent", molitCache, onlyDigits, parseMolitXml);
};

async function handleMolitRequest(req, res, type, cache, digits, parseXml) {
  const serviceKey = normalizeServiceKey(req.query?.serviceKey || process.env.MOLIT_SERVICE_KEY || "");
  if (!serviceKey) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "MOLIT_SERVICE_KEY is not configured" }));
    return;
  }

  const lawdCode = digits(req.query?.lawdCode).slice(0, 5);
  const dealMonth = digits(req.query?.dealMonth).slice(0, 6);
  if (lawdCode.length !== 5 || dealMonth.length !== 6) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "lawdCode(5 digits) and dealMonth(YYYYMM) are required" }));
    return;
  }

  const endpoint = "https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent";
  const apiUrl = new URL(endpoint);
  apiUrl.searchParams.set("serviceKey", serviceKey);
  apiUrl.searchParams.set("LAWD_CD", lawdCode);
  apiUrl.searchParams.set("DEAL_YMD", dealMonth);
  apiUrl.searchParams.set("pageNo", req.query?.pageNo || "1");
  apiUrl.searchParams.set("numOfRows", req.query?.numOfRows || "1000");

  const cacheKey = `${type}:${lawdCode}:${dealMonth}:${apiUrl.searchParams.get("pageNo")}:${apiUrl.searchParams.get("numOfRows")}`;
  if (cache.has(cacheKey)) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Cache", "HIT");
    res.end(cache.get(cacheKey));
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
  if (response.ok) cache.set(cacheKey, xml);
  res.statusCode = response.ok ? 200 : response.status;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(xml);
}

const { buildNewsQuery, clampNumber, fetchRssText, newsCache, parseRssFeed, splitKeywords } = require("./_lib");

module.exports = async function handler(req, res) {
  const keyword = String(req.query?.keyword || "").trim();
  const keywords = splitKeywords(req.query?.keywords);
  const limit = clampNumber(req.query?.limit, 1, 20, 10);

  if (!keyword) {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "keyword is required" }));
    return;
  }

  const cacheKey = `${keyword}:${keywords.join("|")}:${limit}`;
  const cached = newsCache.get(cacheKey);
  if (cached && Date.now() - cached.at < 15 * 60 * 1000) {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Cache", "HIT");
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
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
};

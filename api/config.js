const config = {
  molitKey: "960e7b9c681010f60dfea81ec847bf36a664e995219611319701b453bf07433a",
  kakaoKey: "a706a5e96fa435d168f1dfc6a32d6fe1",
  vworldKey: "05C7C6D0-0CAA-368A-B0ED-B52E6EEDA8F7",
  vworldDomain: "https://mybudongsan26.vercel.app",
};

module.exports = async function handler(req, res) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(config));
};

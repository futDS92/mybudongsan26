import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

export default async function handler(req, res) {
  const url = new URL(req.url, "https://mybudongsan26.vercel.app");
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
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

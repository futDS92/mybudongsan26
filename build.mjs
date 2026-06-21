import { copyFile, mkdir, rm } from "node:fs/promises";

const outputDir = new URL("./public/", import.meta.url);
const files = ["index.html", "styles.css", "client.js", "config.js"];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

await Promise.all(files.map((file) => (
  copyFile(new URL(`./${file}`, import.meta.url), new URL(`./public/${file}`, import.meta.url))
)));

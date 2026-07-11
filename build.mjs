import { copyFile, mkdir, rm } from "node:fs/promises";

const outputDir = new URL("./public/", import.meta.url);
const files = ["index.html", "app.html", "styles.css", "client.js", "config.js"];
const dataFiles = ["location-score/index.json", "location-score/gb_r001.json"];

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await mkdir(new URL("./data/", outputDir), { recursive: true });
await mkdir(new URL("./data/location-score/", outputDir), { recursive: true });

await Promise.all(files.map((file) => (
  copyFile(new URL(`./${file}`, import.meta.url), new URL(`./public/${file}`, import.meta.url))
)));
await Promise.all(dataFiles.map((file) => (
  copyFile(new URL(`./data/${file}`, import.meta.url), new URL(`./public/data/${file}`, import.meta.url))
)));

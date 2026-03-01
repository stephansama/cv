import * as cheerio from "cheerio";
import * as fs from "node:fs";
import * as path from "node:path";
import * as url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const filename = path.resolve(path.join(__dirname, "../index.html"));
const file = await fs.promises.readFile(filename, "utf8");
const $ = cheerio.load(file);

const ogUrl = `https://og.stephansama.info/api/cv/og.png`;

const head = $("head");

head.append(`<meta property="og:image" content="${ogUrl}">`);
head.append(`<meta property="og:image:url" content="${ogUrl}">`);

await fs.promises.writeFile(filename, $.html(), "utf8");

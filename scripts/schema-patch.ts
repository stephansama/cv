#!/usr/bin/env tsx

import * as fsp from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";

const cwd = path.dirname(url.fileURLToPath(import.meta.url));
const rendercvSchemaPath = path.join(cwd, "../schema/rendercv.ts");
const rendercvSchemaFile = await fsp.readFile(rendercvSchemaPath, "utf8");

await fsp.writeFile(
	rendercvSchemaPath,
	rendercvSchemaFile.replace(
		'"sections": z.union([z.record(',
		'"sections": z.union([z.record(z.string(),',
	),
);

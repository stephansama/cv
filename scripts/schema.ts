import jsonpatch from "fast-json-patch";
import * as jsonrefs from "json-refs";
import { jsonSchemaToZod } from "json-schema-to-zod";
import ky from "ky";
import * as fs from "node:fs";
import path from "node:path";
import * as url from "node:url";

const dirname = path.dirname(url.fileURLToPath(import.meta.url));
const output = path.join(dirname, "../schema/");

await fs.promises.mkdir(output);

const renderCvJsonSchema = await ky
	.get(
		`https://raw.githubusercontent.com/rendercv/rendercv/refs/tags/v2.8/schema.json`,
	)
	.json();

const patched = jsonpatch.applyOperation(renderCvJsonSchema, {
	op: "add",
	path: "/$defs/SocialNetworkName/enum/-",
	value: "NPM",
});

const resolvedRenderCvJsonSchema = await jsonrefs.resolveRefs(
	patched.newDocument,
);

const rendercvOutput = resolvedRenderCvJsonSchema.resolved;

await fs.promises.writeFile(
	path.join(output, "rendercv.ts"),
	jsonSchemaToZod(rendercvOutput, { module: "esm" }),
	"utf8",
);

const resumeJsonSchema = await ky
	.get(
		"https://raw.githubusercontent.com/jsonresume/resume-schema/v1.0.0/schema.json",
	)
	.json();

const resolvedResumeJsonSchema = await jsonrefs.resolveRefs(resumeJsonSchema);

const resumeOutput = resolvedResumeJsonSchema.resolved;

await fs.promises.writeFile(
	path.join(output, "resume.ts"),
	jsonSchemaToZod(resumeOutput, {
		module: "esm",
	}),
	"utf8",
);

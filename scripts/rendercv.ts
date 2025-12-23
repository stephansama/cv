#!/usr/bin/env tsx

import * as cp from "node:child_process";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";

cp.execSync(` uv run rendercv render rendercv.yaml `, { stdio: "inherit" });

const cwd = path.dirname(url.fileURLToPath(import.meta.url));

const artifactsPath = path.join(cwd, "../rendercv_output");
const readmePath = path.join(cwd, "../README.md");
const outputPath = path.join(cwd, "../bin");

const artifacts = await fs.readdir(artifactsPath);

const imagePaths = Array<string>();

for (const artifact of artifacts) {
	if (!["pdf", "png"].some((ext) => artifact.endsWith(ext))) continue;

	const newFilename = artifact.replace("Stephan_Randle_CV", "resume");

	if (artifact.endsWith("png")) imagePaths.push(newFilename);

	await fs.cp(
		path.join(artifactsPath, artifact),
		path.join(outputPath, newFilename),
	);
}

const readmeFile = await fs.readFile(readmePath, "utf8");

const readmeLines = readmeFile.split("\n");

const separator = readmeLines.findIndex((line) =>
	line.startsWith(`<!-- images -->`),
);

const md = String.raw;

const imageTemplate = md`
![{alt}]({src})
`;

const containerTemplate = md`
<div align="center">

{images}

</div>
`;

const prefix = readmeLines.slice(0, separator + 1).join("\n");

const imageBody = imagePaths
	.map((image) =>
		imageTemplate
			.replace("{alt}", "alt")
			.replace(
				"{src}",
				`./${path.relative(
					path.dirname(readmePath),
					path.join(outputPath, image),
				)}`,
			),
	)
	.join("");

const outputReadme = [
	prefix,
	containerTemplate.replace("{images}", imageBody),
].join("\n\n");

await fs.writeFile(readmePath, outputReadme);

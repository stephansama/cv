#!/usr/bin/env tsx

/// <reference types="@stephansama/github-env" />

import * as fsp from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";
import { $ as sh } from "zx";

import pkg from "../package.json";

const CWD = path.dirname(url.fileURLToPath(import.meta.url));
const SEPARATOR = "<!-- images -->";
const REPO = process.env.GITHUB_REPOSITORY || "stephansama/cv";
const TOKEN = process.env.GITHUB_TOKEN;

const cvImages = (await fsp.readdir(path.join(CWD, "../rendercv_output")))
	.filter((file) => file.endsWith("png"))
	.map((file) => path.basename(file));

const readmePath = path.join(CWD, "../README.md");
const readmeFile = await fsp.readFile(readmePath, "utf8");
const readmeLines = readmeFile.split("\n");
const separatorIndex = readmeLines.findIndex((l) => l.includes(SEPARATOR));

if (process.env.CI) await setupGit();

const currentTag = await getLatestGitTag();

const prefix = readmeLines.slice(0, separatorIndex + 1).join("\n");
const suffix = cvImages
	.map(
		(image) =>
			`![${image}](https://github.com/${REPO}/releases/download/${currentTag}/${image})`,
	)
	.join("\n");

const body = [prefix, suffix].join("\n\n");

await fsp.writeFile(readmePath, body);

if (process.env.CI) await pushCommit();

async function getLatestGitTag() {
	return (await sh`git describe --tags --abbrev=0`).stdout.trim();
}

async function pushCommit() {
	await sh` git add README.md `;
	await sh` git commit -m "Updated CV Readme" `;
	await sh` git push `;
}

async function setupGit() {
	await sh` git config --global user.email ${pkg.author.email} `;
	await sh` git config --global user.name ${pkg.author.name} `;

	const origin = `https://${TOKEN}@github.com/${REPO}.git`;
	await sh` git remote set-url origin ${origin} `;

	await sh` git config pull.rebase true `;
	await sh` git pull `;
}

import rendercv from "@schema/rendercv";
import resume from "@schema/resume";
import * as fsp from "node:fs/promises";
import path from "node:path";
import * as url from "node:url";
import * as yaml from "yaml";
import * as z from "zod";

import pkg from "../package.json";

type RenderCV = z.infer<typeof rendercv>;
type RenderCvNetwork = RenderCV["cv"]["social_networks"][number]["network"];
type RenderCvSections = RenderCV["cv"]["sections"][string];
type Resume = z.infer<typeof resume>;
type ResumeKey = keyof Resume;

const cwd = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.dirname(path.join(cwd, "../package.json"));
const inputPath = path.join(cwd, "../resume.json");
const inputRaw = await fsp.readFile(inputPath, "utf8");
const parsed = resume.parse(JSON.parse(inputRaw));

const allowedKeys: ResumeKey[] = [
	"projects",
	"education",
	"skills",
	"work",
	"volunteer",
] as const;

const sections = Object.fromEntries(
	Object.entries(parsed)
		.filter(([key]) => allowedKeys.includes(key as ResumeKey))
		.map(([key, value]) => [key, formatSection(key as ResumeKey, value)]),
);
const social_networks = parsed.basics.profiles.map((profile) => ({
	network: profile.network as RenderCvNetwork,
	username: profile.username,
}));

const rendercvInput = rendercv.parse({
	cv: {
		custom_connections: [],
		email: parsed.basics.email,
		headline: "",
		location: parsed.basics.location.countryCode,
		name: parsed.basics.name,
		phone: parsed.basics.phone,
		photo: undefined,
		sections: sections,
		social_networks: social_networks,
		website: parsed.basics.url,
	},
} satisfies RenderCV);

const outputFile = yaml.stringify(rendercvInput);

await fsp.writeFile(path.join(root, pkg.config.output_cv), outputFile);

function formatSection<Section extends keyof Resume>(
	key: Section,
	value: Resume[Section],
): RenderCvSections {
	switch (key) {
		case "education": {
			return value.map((e) => ({
				area: e.area,
				degree: formatStudyType(e.studyType),
				end_date: e.endDate,
				institution: e.institution,
				start_date: e.startDate,
			}));
		}
		case "projects": {
			return value.map((v) => ({
				end_date: v.endDate,
				highlights: v.highlights,
				name: `[${v.name}](${v.url})`,
				start_date: v.startDate,
				summary: v.description,
			}));
		}
		case "skills": {
			return value.map((v) => ({
				details: v.keywords.join(", "),
				label: v.name,
			}));
		}
		case "work": {
			return value.map((v) => ({
				company: v.name,
				end_date: v.endDate,
				highlights: v.highlights,
				location: v.location,
				position: v.position,
				start_date: v.startDate,
				summary: v.summary,
			}));
		}
		default: {
			throw new Error(`no implementation found for key ${key}`);
		}
	}
}

function formatStudyType(studyType: string) {
	const formatter = {
		"Certification": "Cert",
		"High School Diploma": "HS",
	};
	return formatter[studyType as keyof typeof formatter] || studyType;
}

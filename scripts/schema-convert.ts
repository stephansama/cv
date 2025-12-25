import rendercv from "@schema/rendercv";
import resume from "@schema/resume";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";
import * as yaml from "yaml";
import * as z from "zod";

import pkg from "../package.json";

type Resume = z.infer<typeof resume>;
type ResumeKey = keyof Resume;
type RenderCV = z.infer<typeof rendercv>;
type RenderCvSections = RenderCV["cv"]["sections"][string];
type RenderCvNetwork = RenderCV["cv"]["social_networks"][number]["network"];

const cwd = path.dirname(url.fileURLToPath(import.meta.url));
const root = path.dirname(path.join(cwd, "../package.json"));
const inputPath = path.join(cwd, "../resume.json");
const inputRaw = await fsp.readFile(inputPath, "utf8");
const input = JSON.parse(inputRaw);
const parsed = resume.parse(input);

const allowedKeys: ResumeKey[] = [
	"projects",
	"education",
	"skills",
	"work",
	"volunteer",
] as const;

const sections = Object.entries(parsed)
	.filter(([key]) => allowedKeys.includes(key as ResumeKey))
	.reduce(
		(acc, [key, value]) => ({
			...acc,
			[key]: formatSection(key as ResumeKey, value),
		}),
		{},
	);

const rendercvInput = rendercv.parse({
	cv: {
		headline: "",
		custom_connections: [],
		sections: sections,
		website: parsed.basics.url,
		location: parsed.basics.location.countryCode,
		photo: undefined,
		phone: parsed.basics.phone,
		name: parsed.basics.name,
		email: parsed.basics.email,
		social_networks: parsed.basics.profiles.map((profile) => ({
			username: profile.username,
			network: profile.network as RenderCvNetwork,
		})),
	},
} satisfies RenderCV);

const outputFile = yaml.stringify(rendercvInput);

await fsp.writeFile(path.join(root, pkg.config.output_cv), outputFile);

function formatSection<Section extends keyof Resume>(
	key: Section,
	value: Resume[Section],
): RenderCvSections {
	switch (key) {
		case "education":
			return (value as Resume["education"]).map((e) => ({
				institution: e.institution,
				area: e.area,
				degree: formatStudyType(e.studyType),
				start_date: e.startDate,
				end_date: e.endDate,
			}));
		case "projects":
			return (value as Resume["projects"]).map((v) => ({
				name: `[${v.name}](${v.url})`,
				start_date: v.startDate,
				end_date: v.endDate,
				summary: v.description,
				highlights: v.highlights,
			}));
		case "skills":
			return (value as Resume["skills"]).map((v) => ({
				label: v.name,
				details: v.keywords.join(", "),
			}));
		case "work":
			return (value as Resume["work"]).map((v) => ({
				company: v.name,
				location: v.location,
				position: v.position,
				start_date: v.startDate,
				end_date: v.endDate,
				summary: v.summary,
				highlights: v.highlights,
			}));
		default:
			throw new Error(`no implementation found for key ${key}`);
	}
}

function formatStudyType(studyType: string) {
	const formatter = {
		"Certification": "Cert",
		"High School Diploma": "HS",
	};
	return formatter[studyType as keyof typeof formatter] || studyType;
}

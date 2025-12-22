import rendercv from "@schema/rendercv";
import resume from "@schema/resume";
import * as fsp from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";
import * as yaml from "yaml";
import * as z from "zod";

type RenderCV = z.infer<typeof rendercv>;
type RenderCvNetwork = RenderCV["cv"]["social_networks"][number]["network"];

const cwd = path.dirname(url.fileURLToPath(import.meta.url));
const inputPath = path.join(cwd, "../resume.json");
const inputRaw = await fsp.readFile(inputPath, "utf8");
const input = JSON.parse(inputRaw);
const parsed = resume.parse(input);

const rendercvInput = rendercv.parse({
	cv: {
		headline: "",
		custom_connections: [],
		sections: [].reduce((acc, curr) => {
			return;
		}, {}),
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
	design: {
		theme: {},
	},
} satisfies RenderCV);

const outputFile = yaml.stringify(rendercvInput);

await fsp.writeFile(path.join(cwd, "../rendercv.yaml"), outputFile);

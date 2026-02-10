import * as fsp from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";
import * as z from "zod";
import * as schema from "./spy-schema";

const envSchema = z.object({
	NOCODB_JOB_URL: z.string().min(1),
	NOCODB_TOKEN: z.string().min(1),
});

const env = envSchema.parse(process.env);
const basepath = path.dirname(url.fileURLToPath(import.meta.url));
const file = await fsp.readFile(path.join(basepath, "../jobs.json"), "utf8");
const found = schema.jobSpyListSchema.parse(JSON.parse(file));

const ACTIONS = ["LIST", "CREATE", "UPDATE", "DELETE"] as const;
type ACTION = (typeof ACTIONS)[number];

const API = {
	LIST: {
		method: "get",
		responseSchema: z.object({
			records: z.array(
				z.object({
					id: z.string(),
					fields: z.object({
						"position title": z.string(),
						"url": z.string(),
						"stage": z.string(),
						"source": z.string(),
						"min salary": z.number(),
						"max salary": z.number(),
						"follow up": z.string(),
					}),
				}),
			),
			next: z.string(),
			prev: z.string(),
			nestedNext: z.string(),
			nestedPrev: z.string(),
		}),
		url: env.NOCODB_JOB_URL,
	},
	CREATE: {
		method: "post",
		inputSchema: z.object(),
		responseSchema: z.object(),
		url: env.NOCODB_JOB_URL,
	},
	UPDATE: {
		method: "patch",
		inputSchema: z.object(),
		responseSchema: z.object(),
		url: env.NOCODB_JOB_URL,
	},
	DELETE: {
		method: "patch",
		inputSchema: z.object(),
		responseSchema: z.object(),
		url: env.NOCODB_JOB_URL,
	},
} satisfies Partial<
	Record<
		ACTION,
		{
			method: "delete" | "get" | "patch" | "post" | "put";
			inputSchema?: z.ZodType;
			responseSchema: z.ZodType;
			url: string;
		}
	>
>;

async function loadApi<A extends ACTION, T extends (typeof API)[A]>(
	action: A,
	input?: "inputSchema" extends keyof T ? z.infer<T["inputSchema"]> : never,
) {
	const current = API[action];
	const body =
		"inputSchema" in current
			? JSON.stringify(current.inputSchema.parse(input))
			: undefined;
	const headers = new Headers({
		"accept": "application/json",
		"xc-token": env.NOCODB_TOKEN,
	});

	const response = await fetch(current.url, {
		method: current.method,
		body,
		headers,
	});

	const json = await response.json();
	return current.responseSchema.parse(json);
}

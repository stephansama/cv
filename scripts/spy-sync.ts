import * as fsp from "node:fs/promises";
import * as path from "node:path";
import * as url from "node:url";
import * as z from "zod";
import * as schema from "./spy-schema";

import { createApi } from "@stephansama/typed-nocodb-api";

const envSchema = z.object({
	NOCODB_COMPANY_TABLE: z.string().min(1),
	NOCODB_CAREERS_BASE: z.string().min(1),
	NOCODB_JOB_TABLE: z.string().min(1),
	NOCODB_TOKEN: z.string().min(1),
	NOCODB_URL: z.string().min(1),
});

const env = envSchema.parse(process.env);

const careersApi = createApi({
	token: env.NOCODB_TOKEN,
	baseId: env.NOCODB_CAREERS_BASE,
	origin: env.NOCODB_URL,
	tableId: env.NOCODB_COMPANY_TABLE,
	schema: z.object({
		"name": z.string(),
		"description": z.string(),
		"url": z.string(),
		"careers page": z.string(),
		"jobs": z.object({
			id: z.number(),
		}),
	}),
});

const jobApi = createApi({
	token: env.NOCODB_TOKEN,
	baseId: env.NOCODB_CAREERS_BASE,
	origin: env.NOCODB_URL,
	tableId: env.NOCODB_JOB_TABLE,
	schema: z.object({
		"position title": z.string(),
		"url": z.string(),
		"min salary": z.number(),
		"max salary": z.number(),
		"company": z.object({ id: z.number() }),
		"follow up": z.string().optional().nullable(),
		"type": z.enum(["fulltime", "parttime", "internship", "contract"]),
		"pay_interval": z.enum(["yearly", "monthly", "daily", "hourly"]),
		"stage": z.enum([
			"interested",
			"applied",
			"interview",
			"need to follow up",
		]),
		"source": z.enum([
			"website",
			"indeed",
			"linkedin",
			"zip_recruiter",
			"google",
			"glassdoor",
		]),
	}),
});

const basepath = path.dirname(url.fileURLToPath(import.meta.url));
const file = await fsp.readFile(path.join(basepath, "../jobs.json"), "utf8");
const foundPositions = schema.jobSpyListSchema.parse(JSON.parse(file));

const companies = Object.fromEntries(
	foundPositions.map((position) => [
		position.company,
		{
			url: position.company_url,
			description: position.company_description,
		},
	]),
);

const nocodbList = await jobApi.fetch({ action: "LIST" });

await fsp.writeFile(
	"./output.json",
	JSON.stringify(nocodbList, undefined, 2),
	"utf8",
);

// Find companies from scraped jobs
// List saved companies
// save companies not in the list
// List saved jobs
// save jobs not in the list with company id

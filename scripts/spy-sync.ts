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

const companiesApi = createApi({
	token: env.NOCODB_TOKEN,
	baseId: env.NOCODB_CAREERS_BASE,
	origin: env.NOCODB_URL,
	tableId: env.NOCODB_COMPANY_TABLE,
	schema: z.object({
		"name": z.string(),
		"description": z.string(),
		"url": z.string(),
		"careers page": z.string().optional().nullable(),
		"jobs": z.number().optional().nullable(),
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
		"follow up": z.string().optional().nullable(),
		"type": z.enum(["fulltime", "parttime", "internship", "contract"]),
		"pay_interval": z.enum([
			"yearly",
			"monthly",
			"weekly",
			"daily",
			"hourly",
		]),
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

const nocodbCompanyList = await companiesApi.fetch({ action: "LIST" });
const missingCompanies = Object.entries(companies).filter(([name]) => {
	return !nocodbCompanyList.records.some(
		(record) => record.fields.name === name,
	);
});

for (const [missingName, missingValue] of missingCompanies) {
	await companiesApi.fetch({
		action: "CREATE",
		body: {
			fields: {
				name: missingName,
				url: missingValue.url || "",
				description: missingValue.description || "",
			},
		},
	});
}

const nocodbJobList = await jobApi.fetch({ action: "LIST" });

const missingJobs = foundPositions.filter((position) => {
	return !nocodbJobList.records.some(
		(record) => record.fields["position title"] === position.title,
	);
});

for (const missingJob of missingJobs) {
	await jobApi.fetch({
		action: "CREATE",
		body: {
			fields: {
				"stage": "interested",
				"position title": missingJob.title,
				"url": missingJob.job_url_direct || missingJob.job_url,
				"source": missingJob.site,
				"type": missingJob.job_type || "fulltime",
				"min salary": missingJob.min_amount || 0,
				"max salary": missingJob.max_amount || 0,
				"pay_interval": missingJob.interval || "yearly",
			},
		},
	});
}

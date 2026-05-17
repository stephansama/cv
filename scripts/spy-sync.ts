import { createApi } from "@stephansama/typed-nocodb-api";
import * as fsp from "node:fs/promises";
import path from "node:path";
import * as url from "node:url";
import * as z from "zod";

import { environmentConfig } from "./environment";
import * as schema from "./spy-schema";

const environment = await environmentConfig.validate();

const companiesApi = createApi({
	baseId: environment.NOCODB_CAREERS_BASE,
	origin: environment.NOCODB_URL,
	schema: z.object({
		"careers page": z.string().trim().optional().nullable(),
		"description": z.string().trim(),
		"jobs": z.number().optional().nullable(),
		"name": z.string().trim(),
		"url": z.string().trim(),
	}),
	tableId: environment.NOCODB_COMPANY_TABLE,
	token: environment.NOCODB_TOKEN,
});

const jobApi = createApi({
	baseId: environment.NOCODB_CAREERS_BASE,
	origin: environment.NOCODB_URL,
	schema: z.object({
		"follow up": z.string().trim().optional().nullable(),
		"max salary": z.number(),
		"min salary": z.number(),
		"pay_interval": z.enum([
			"yearly",
			"monthly",
			"weekly",
			"daily",
			"hourly",
		]),
		"position title": z.string().trim(),
		"source": z.enum([
			"website",
			"indeed",
			"linkedin",
			"zip_recruiter",
			"google",
			"glassdoor",
		]),
		"stage": z.enum([
			"interested",
			"applied",
			"interview",
			"need to follow up",
		]),
		"type": z.enum(["fulltime", "parttime", "internship", "contract"]),
		"url": z.string().trim(),
	}),
	tableId: environment.NOCODB_JOB_TABLE,
	token: environment.NOCODB_TOKEN,
});

const basepath = path.dirname(url.fileURLToPath(import.meta.url));
const file = await fsp.readFile(path.join(basepath, "../jobs.json"), "utf8");
const foundPositions = schema.jobSpyListSchema.parse(JSON.parse(file));

const companies = Object.fromEntries(
	foundPositions.map((position) => [
		position.company,
		{
			description: position.company_description,
			url: position.company_url,
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
				description: missingValue.description || "",
				name: missingName,
				url: missingValue.url || "",
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
				"max salary": missingJob.max_amount || 0,
				"min salary": missingJob.min_amount || 0,
				"pay_interval": missingJob.interval || "yearly",
				"position title": missingJob.title,
				"source": missingJob.site,
				"stage": "interested",
				"type": missingJob.job_type || "fulltime",
				"url": missingJob.job_url_direct || missingJob.job_url,
			},
		},
	});
}

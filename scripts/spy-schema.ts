import * as z from "zod";

export type JobSpySchema = z.infer<typeof jobSpySchema>;
export const jobSpySchema = z.object({
	id: z.string(),
	site: z.enum([
		"indeed",
		"linkedin",
		"zip_recruiter",
		"google",
		"glassdoor",
	]),
	company: z.string(),
	date_posted: z.number(),
	job_url: z.string(),
	job_url_direct: z.string().nullable(),
	location: z.string().nullable(),
	salary_source: z.string().nullable(),
	title: z.string(),
	job_type: z
		.enum(["fulltime", "parttime", "internship", "contract"])
		.optional()
		.nullable(),
	interval: z
		.enum(["yearly", "monthly", "weekly", "daily", "hourly"])
		.optional()
		.nullable(),
	min_amount: z.number().nullable(),
	max_amount: z.number().nullable(),
	currency: z.string().nullable(),
	is_remote: z.boolean().nullable(),
	description: z.string().optional().nullable(),
	emails: z.string().optional().nullable(),
	listing_type: z.string().optional().nullable(),
	job_function: z.string().optional().nullable(),
	job_level: z.string().optional().nullable(),
	company_industry: z.string().optional().nullable(),
	company_url: z.string().optional().nullable(),
	company_logo: z.string().optional().nullable(),
	company_url_direct: z.string().optional().nullable(),
	company_addresses: z.string().optional().nullable(),
	company_num_employees: z.string().optional().nullable(),
	company_revenue: z.string().optional().nullable(),
	company_description: z.string().optional().nullable(),
	company_skills: z.string().optional().nullable(),
	company_experience_range: z.string().optional().nullable(),
	company_rating: z.string().optional().nullable(),
	company_reviews_count: z.string().optional().nullable(),
	vacancy_count: z.string().optional().nullable(),
	work_from_home_type: z.string().optional().nullable(),
});

export type JobSpyListSchema = z.infer<typeof jobSpyListSchema>;
export const jobSpyListSchema = z.array(jobSpySchema);

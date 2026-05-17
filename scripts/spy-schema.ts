import * as z from "zod";

export type JobSpySchema = z.infer<typeof jobSpySchema>;
export const jobSpySchema = z.object({
	company: z.string().trim(),
	company_addresses: z.string().trim().optional().nullable(),
	company_description: z.string().trim().optional().nullable(),
	company_experience_range: z.string().trim().optional().nullable(),
	company_industry: z.string().trim().optional().nullable(),
	company_logo: z.string().trim().optional().nullable(),
	company_num_employees: z.string().trim().optional().nullable(),
	company_rating: z.string().trim().optional().nullable(),
	company_revenue: z.string().trim().optional().nullable(),
	company_reviews_count: z.string().trim().optional().nullable(),
	company_skills: z.string().trim().optional().nullable(),
	company_url: z.string().trim().optional().nullable(),
	company_url_direct: z.string().trim().optional().nullable(),
	currency: z.string().trim().nullable(),
	date_posted: z.number().nullable(),
	description: z.string().trim().optional().nullable(),
	emails: z.string().trim().optional().nullable(),
	id: z.string().trim(),
	interval: z
		.enum(["yearly", "monthly", "weekly", "daily", "hourly"])
		.optional()
		.nullable(),
	is_remote: z.boolean().nullable(),
	job_function: z.string().trim().optional().nullable(),
	job_level: z.string().trim().optional().nullable(),
	job_type: z
		.enum(["fulltime", "parttime", "internship", "contract"])
		.optional()
		.nullable(),
	job_url: z.string().trim(),
	job_url_direct: z.string().trim().nullable(),
	listing_type: z.string().trim().optional().nullable(),
	location: z.string().trim().nullable(),
	max_amount: z.number().nullable(),
	min_amount: z.number().nullable(),
	salary_source: z.string().trim().nullable(),
	site: z.enum([
		"indeed",
		"linkedin",
		"zip_recruiter",
		"google",
		"glassdoor",
	]),
	title: z.string().trim(),
	vacancy_count: z.string().trim().optional().nullable(),
	work_from_home_type: z.string().trim().optional().nullable(),
});

export type JobSpyListSchema = z.infer<typeof jobSpyListSchema>;
export const jobSpyListSchema = z.array(jobSpySchema);

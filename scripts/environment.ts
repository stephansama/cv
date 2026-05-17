import { createEnv } from "@stephansama/typed-env";
import * as url from "node:url";
import * as z from "zod";

export const environmentConfig = createEnv(
	z.object({
		NOCODB_CAREERS_BASE: z.string().trim(),
		NOCODB_COMPANY_TABLE: z.string().trim(),
		NOCODB_JOB_TABLE: z.string().trim(),
		NOCODB_TOKEN: z.string().trim(),
		NOCODB_URL: z.string().trim(),
	}),
);

if (url.fileURLToPath(import.meta.url) === process.argv[1]) {
	await environmentConfig.generateExample(".env.example");
}

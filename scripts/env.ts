import { createEnv } from "@stephansama/typed-env";
import * as url from "node:url";
import * as z from "zod";

export const envConfig = createEnv(
	z.object({
		NOCODB_CAREERS_BASE: z.string(),
		NOCODB_COMPANY_TABLE: z.string(),
		NOCODB_JOB_TABLE: z.string(),
		NOCODB_TOKEN: z.string(),
		NOCODB_URL: z.string(),
	}),
);

if (url.fileURLToPath(import.meta.url) === process.argv[1]) {
	await envConfig.generateExample(".env.example");
}

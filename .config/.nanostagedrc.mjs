import type { Configuration } from "lint-staged";

const jsLike = "{js,cjs,mjs,jsx,ts,mts,cts,tsx,astro,svelte,vue}";

/** @see https://www.npmjs.com/package/lint-staged#configuration */
const config: Configuration = {
	[`!(*.${jsLike})`]: "prettier --write --ignore-unknown",
	[`*.${jsLike}`]: ["oxlint --fix", "prettier --write --ignore-unknown"],
};

export default config;

const jsLike = "{js,cjs,mjs,jsx,ts,mts,cts,tsx,astro,svelte,vue}";

/** @type {import("nano-staged").Configuration} */
const config = {
	[`!(*.${jsLike})`]: "prettier --write --ignore-unknown",
	[`*.${jsLike}`]: ["oxlint --fix", "prettier --write --ignore-unknown"],
};

export default config;

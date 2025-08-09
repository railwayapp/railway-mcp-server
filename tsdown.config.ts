import { defineConfig } from "tsdown";

export default defineConfig({
	entry: ["src/**/*.ts"],
	format: ["esm"],
	dts: true,
	sourcemap: true,
	clean: true,
});

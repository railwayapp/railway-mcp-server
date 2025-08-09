import z from "zod";
import { setRailwayVariables } from "../cli";
import type { SetVariablesOptions } from "../cli/variables";
import { createToolResponse } from "../utils";

export const setVariablesTool = {
	name: "set-variables",
	title: "Set Railway Variables",
	description: "Set environment variables for the active environment",
	inputSchema: {
		workspacePath: z
			.string()
			.describe("The path to the workspace to set variables in"),
		variables: z
			.array(z.string())
			.describe("Array of '{key}={value}' environment variable pairs to set"),
		service: z
			.string()
			.optional()
			.describe("The service to set variables for (optional)"),
		environment: z
			.string()
			.optional()
			.describe("The environment to set variables for (optional)"),
		skipDeploys: z
			.boolean()
			.optional()
			.describe("Skip triggering deploys when setting variables (optional)"),
	},
	handler: async ({
		workspacePath,
		variables,
		service,
		environment,
		skipDeploys,
	}: SetVariablesOptions) => {
		try {
			const result = await setRailwayVariables({
				workspacePath,
				variables,
				service,
				environment,
				skipDeploys,
			});

			return createToolResponse(result);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return createToolResponse(
				"❌ Failed to set Railway variables\n\n" +
					`**Error:** ${errorMessage}\n\n` +
					"**Next Steps:**\n" +
					"• Ensure you have a Railway project linked\n" +
					"• Check that the service and environment exist\n" +
					"• Verify you have permissions to set variables\n" +
					"• Ensure variable format is correct (KEY=value)\n" +
					"• Run `railway link` to ensure proper project connection",
			);
		}
	},
};

import z from "zod";
import { listRailwayVariables } from "../cli";
import type { ListVariablesOptions } from "../cli/variables";
import { createToolResponse } from "../utils";

export const listVariablesTool = {
	name: "list-variables",
	title: "List Railway Variables",
	description: "Show variables for the active environment",
	inputSchema: {
		workspacePath: z
			.string()
			.describe("The path to the workspace to list variables from"),
		service: z
			.string()
			.optional()
			.describe("The service to show variables for (optional)"),
		environment: z
			.string()
			.optional()
			.describe("The environment to show variables for (optional)"),
		kv: z
			.boolean()
			.optional()
			.describe("Show variables in KV format (optional)"),
		json: z.boolean().optional().describe("Output in JSON format (optional)"),
	},
	handler: async ({
		workspacePath,
		service,
		environment,
		kv,
		json,
	}: ListVariablesOptions) => {
		try {
			const variables = await listRailwayVariables({
				workspacePath,
				service,
				environment,
				kv,
				json,
			});

			return createToolResponse(variables);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return createToolResponse(
				"❌ Failed to list Railway variables\n\n" +
					`**Error:** ${errorMessage}\n\n` +
					"**Next Steps:**\n" +
					"• Ensure you have a Railway project linked\n" +
					"• Check that the service and environment exist\n" +
					"• Verify you have permissions to view variables\n" +
					"• Run `railway link` to ensure proper project connection",
			);
		}
	},
};

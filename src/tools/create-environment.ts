import z from "zod";
import { createRailwayEnvironment } from "../cli";
import type { CreateEnvironmentOptions } from "../cli/environments";
import { createToolResponse } from "../utils";

export const createEnvironmentTool = {
	name: "create-environment",
	title: "Create Environment",
	description:
		"Create a new Railway environment for the currently linked project. Optionally duplicate an existing environment and set service variables.",
	inputSchema: {
		workspacePath: z
			.string()
			.describe(
				"The path to the workspace where the environment should be created",
			),
		environmentName: z.string().describe("The name for the new environment"),
		duplicateEnvironment: z
			.string()
			.optional()
			.describe("The name of an existing environment to duplicate"),
		serviceVariables: z
			.array(
				z.object({
					service: z.string().describe("The service name or UUID"),
					variable: z
						.string()
						.describe("The variable assignment (e.g., 'BACKEND_PORT=3000')"),
				}),
			)
			.optional()
			.describe(
				"Service variables to assign in the new environment (only works when duplicating)",
			),
	},
	handler: async ({
		workspacePath,
		environmentName,
		duplicateEnvironment,
		serviceVariables,
	}: CreateEnvironmentOptions) => {
		try {
			const result = await createRailwayEnvironment({
				workspacePath,
				environmentName,
				duplicateEnvironment,
				serviceVariables,
			});
			return createToolResponse(result);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return createToolResponse(
				"❌ Failed to create environment\n\n" +
					`**Error:** ${errorMessage}\n\n` +
					"**Next Steps:**\n" +
					"• Ensure you have a Railway project linked\n" +
					"• Check that the environment name is valid and unique\n" +
					"• Verify you have permissions to create environments in this project\n" +
					"• If duplicating, ensure the source environment exists\n" +
					"• If using service variables, ensure the service exists in the source environment",
			);
		}
	},
};

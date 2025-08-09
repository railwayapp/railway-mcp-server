import z from "zod";
import { linkRailwayEnvironment } from "../cli";
import type { LinkEnvironmentOptions } from "../cli/environments";
import { createToolResponse } from "../utils";

export const linkEnvironmentTool = {
	name: "link-environment",
	title: "Link Environment",
	description:
		"Link to a specific Railway environment. If no environment is specified, it will list available environments for selection.",
	inputSchema: {
		workspacePath: z
			.string()
			.describe("The path to the workspace to link the environment to"),
		environmentName: z.string().describe("The environment name to link to"),
	},
	handler: async ({
		workspacePath,
		environmentName,
	}: LinkEnvironmentOptions) => {
		try {
			const result = await linkRailwayEnvironment({
				workspacePath,
				environmentName,
			});
			return createToolResponse(result);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return createToolResponse(
				"❌ Failed to link environment\n\n" +
					`**Error:** ${errorMessage}\n\n` +
					"**Next Steps:**\n" +
					"• Ensure you have a Railway project linked\n" +
					"• Check that the environment name is correct\n" +
					"• Run `railway environment` to see available environments",
			);
		}
	},
};

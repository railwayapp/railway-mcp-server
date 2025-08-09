import z from "zod";
import { deployRailwayProject } from "../cli";
import type { DeployOptions } from "../cli/deployment";
import { createToolResponse } from "../utils";

export const deployTool = {
	name: "deploy",
	title: "Deploy to Railway",
	description:
		"Upload and deploy from the current directory. Supports CI mode, environment, and service options.",
	inputSchema: {
		workspacePath: z.string().describe("The path to the workspace to deploy"),
		ci: z
			.boolean()
			.optional()
			.describe(
				"Stream build logs only, then exit (equivalent to setting $CI=true)",
			),
		environment: z
			.string()
			.optional()
			.describe("Environment to deploy to (defaults to linked environment)"),
		service: z
			.string()
			.optional()
			.describe("Service to deploy to (defaults to linked service)"),
	},
	handler: async ({
		workspacePath,
		ci,
		environment,
		service,
	}: DeployOptions) => {
		const {
			workspacePath: wsPath,
			ci: ciMode = false,
			environment: env,
			service: svc,
		} = { workspacePath, ci, environment, service };
		try {
			const result = await deployRailwayProject({
				workspacePath: wsPath,
				ci: ciMode,
				environment: env,
				service: svc,
			});
			return createToolResponse(
				`✅ Successfully triggered a deployment for Railway project. This process will take some time to complete:\n\n${result}`,
			);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return createToolResponse(
				"❌ Failed to deploy Railway project\n\n" +
					`**Error:** ${errorMessage}\n\n` +
					"**Next Steps:**\n" +
					"• Ensure you have a Railway project linked\n" +
					"• Check that the environment and service exist\n" +
					"• Verify your project has the necessary files for deployment\n" +
					"• Check that you have permissions to deploy to this project",
			);
		}
	},
};

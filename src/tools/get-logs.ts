import z from "zod";
import { getRailwayBuildLogs, getRailwayDeployLogs } from "../cli";
import type { GetLogsOptions as GetLogsOptionsType } from "../cli/logs";
import { createToolResponse } from "../utils";

type GetLogsOptions = {
	logType: "build" | "deploy";
} & GetLogsOptionsType;

export const getLogsTool = {
	name: "get-logs",
	title: "Get Railway Logs",
	description:
		"Get build or deployment logs for the currently linked Railway project. You can optionally specify a deployment ID, service, and environment. If no deployment ID is provided, it will get logs from the latest deployment.",
	inputSchema: {
		workspacePath: z
			.string()
			.describe("The path to the workspace to get logs from"),
		logType: z
			.enum(["build", "deploy"])
			.describe(
				"Type of logs to retrieve: 'build' for build logs or 'deploy' for deployment logs",
			),
		deploymentId: z
			.string()
			.optional()
			.describe(
				"Deployment ID to pull logs from. Omit to pull from latest deployment",
			),
		service: z
			.string()
			.optional()
			.describe("Service to view logs from (defaults to linked service)"),
		environment: z
			.string()
			.optional()
			.describe(
				"Environment to view logs from (defaults to linked environment)",
			),
	},
	handler: async ({
		workspacePath,
		logType,
		deploymentId,
		service,
		environment,
	}: GetLogsOptions) => {
		try {
			let result: string;
			if (logType === "build") {
				result = await getRailwayBuildLogs({
					workspacePath,
					deploymentId,
					service,
					environment,
				});
			} else {
				result = await getRailwayDeployLogs({
					workspacePath,
					deploymentId,
					service,
					environment,
				});
			}

			return createToolResponse(result);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return createToolResponse(
				`❌ Failed to get Railway ${logType} logs\n\n` +
					`**Error:** ${errorMessage}\n\n` +
					"**Next Steps:**\n" +
					"• Ensure you have a Railway project linked\n" +
					"• Check that the deployment ID is valid (if provided)\n" +
					"• Verify the service and environment exist\n" +
					"• Run `railway link` to ensure proper project connection",
			);
		}
	},
};

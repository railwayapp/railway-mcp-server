import z from "zod";
import { getRailwayBuildLogs, getRailwayDeployLogs } from "../cli";
import type { GetLogsOptions as GetLogsOptionsType } from "../cli/logs";
import { getCliFeatureSupport } from "../cli/version";
import { createToolResponse } from "../utils";

type GetLogsOptions = {
  logType: "build" | "deploy";
  lines?: number;
  filter?: string;
  json?: boolean;
  since?: string;
  until?: string;
} & GetLogsOptionsType;

export const getLogsTool = {
  name: "get-logs",
  title: "Get Railway Logs",
  description:
    "Get build or deployment logs for the currently linked Railway project. This will only pull the latest successful deployment by default, so if you need to inspect a failed build, you'll need to supply a deployment ID. You can optionally specify a deployment ID, service, and environment. If no deployment ID is provided, it will get logs from the latest deployment. Use 'since' and 'until' to query logs across deployments within a time range — this is essential for investigating past incidents where the deployment has since been replaced. The 'lines' and 'filter' parameters require Railway CLI v4.9.0+. Use 'lines' to limit the number of log lines (disables streaming) and 'filter' to search logs by terms or attributes (e.g., '@level:error', 'user', '@level:warn AND rate limit'). For older CLI versions, these parameters will be ignored and logs will stream.",
  inputSchema: {
    workspacePath: z
      .string()
      .describe("The path to the workspace to get logs from"),
    logType: z
      .enum(["build", "deploy"])
      .describe(
        "Type of logs to retrieve: 'build' for build logs or 'deploy' for deployment logs"
      ),
    deploymentId: z
      .string()
      .optional()
      .describe(
        "Deployment ID to pull logs from. Omit to pull from latest deployment"
      ),
    service: z
      .string()
      .optional()
      .describe("Service to view logs from (defaults to linked service)"),
    environment: z
      .string()
      .optional()
      .describe(
        "Environment to view logs from (defaults to linked environment)"
      ),
    lines: z
      .number()
      .optional()
      .describe(
        "Number of log lines to return (disables streaming). Requires Railway CLI v4.9.0+. Useful for searching through recent logs."
      ),
    filter: z
      .string()
      .optional()
      .describe(
        "Filter logs by search terms or attributes. Requires Railway CLI v4.9.0+. Examples: 'error', '@level:error', '@level:warn AND rate limit', 'user login', '@status:500'. See https://docs.railway.com/guides/logs for more info."
      ),
    json: z
      .boolean()
      .optional()
      .describe(
        "JSON provides structured log data with more information (e.g. timestamps) but uses more tokens. Defaults to false to save tokens. Set to true for more detailed logs."
      ),
    since: z
      .string()
      .optional()
      .describe(
        "Show logs since a specific time (disables streaming). Accepts relative times (e.g., '30s', '5m', '2h', '1d', '1w') or ISO 8601 timestamps (e.g., '2024-01-15T10:30:00Z'). Useful for investigating past incidents across deployments."
      ),
    until: z
      .string()
      .optional()
      .describe(
        "Show logs until a specific time (disables streaming). Same formats as 'since'. Use together with 'since' to define a time window for investigation."
      ),
  },
  handler: async ({
    workspacePath,
    logType,
    deploymentId,
    service,
    environment,
    lines,
    filter,
    json,
    since,
    until,
  }: GetLogsOptions) => {
    try {
      const features = await getCliFeatureSupport();
      const supportsFiltering =
        features.logs.args.lines && features.logs.args.filter;
      let versionWarning = "";

      if ((lines !== undefined || filter !== undefined) && !supportsFiltering) {
        versionWarning =
          "⚠️ **Note:** Your Railway CLI version does not support the 'lines' and 'filter' parameters. " +
          "Please upgrade to Railway CLI v4.9.0 or later to use these features. " +
          "Logs will be streamed without filtering.\n\n";
      }

      let result: string;
      if (logType === "build") {
        result = await getRailwayBuildLogs({
          workspacePath,
          deploymentId,
          service,
          environment,
          lines,
          filter,
          json,
          since,
          until,
        });
      } else {
        result = await getRailwayDeployLogs({
          workspacePath,
          deploymentId,
          service,
          environment,
          lines,
          filter,
          json,
          since,
          until,
        });
      }

      return createToolResponse(versionWarning + result);
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
          "• Run `railway link` to ensure proper project connection"
      );
    }
  },
};

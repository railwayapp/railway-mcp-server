import z from "zod";
import type { ListDeploymentsOptions } from "../cli/deployment";
import { listDeployments } from "../cli/deployment";
import { createToolResponse } from "../utils";

export const listDeploymentsTool = {
  name: "list-deployments",
  title: "List Railway Deployments",
  description:
    "List deployments for a Railway service with IDs, statuses and other metadata. Requires Railway CLI v4.10.0+.",
  inputSchema: {
    workspacePath: z
      .string()
      .describe("The path to the workspace to list deployments from"),
    service: z
      .string()
      .optional()
      .describe(
        "Service name or ID to list deployments for (defaults to linked service)"
      ),
    environment: z
      .string()
      .optional()
      .describe(
        "Environment to list deployments from (defaults to linked environment)"
      ),
    limit: z
      .number()
      .min(1)
      .max(1000)
      .default(20)
      .optional()
      .describe(
        "Maximum number of deployments to show (default: 20, max: 1000)"
      ),
    json: z
      .boolean()
      .default(false)
      .optional()
      .describe(
        "Return deployments as structured JSON data. When true, the output will contain ids, statuses, and other metadata"
      ),
  },
  handler: async (options: ListDeploymentsOptions) => {
    try {
      const result = await listDeployments(options);

      if (!result.success) {
        throw new Error(result.error);
      }

      return createToolResponse(result.output);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      return createToolResponse(
        "❌ Failed to list Railway deployments\n\n" +
          `**Error:** ${errorMessage}\n\n` +
          "**Next Steps:**\n" +
          "• Ensure you are logged into Railway CLI (`railway login`)\n" +
          "• Check that you have a project linked (`railway link`)\n" +
          "• Verify you have permissions to view deployments\n" +
          "• Try running `railway login` to refresh your authentication"
      );
    }
  },
};

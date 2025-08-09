import z from "zod";
import { getRailwayServices, linkRailwayService } from "../cli";
import type { LinkServiceOptions } from "../cli/services";
import { createToolResponse } from "../utils";

export const linkServiceTool = {
	name: "link-service",
	title: "Link Railway Service",
	description:
		"Link a service to the current Railway project. If no service is specified, it will list available services",
	inputSchema: {
		workspacePath: z
			.string()
			.describe("The path to the workspace to link the service to"),
		serviceName: z.string().optional().describe("The service name to link"),
	},
	handler: async ({ workspacePath, serviceName }: LinkServiceOptions) => {
		try {
			if (serviceName) {
				// Link the specified service
				const result = await linkRailwayService({
					workspacePath,
					serviceName,
				});
				return createToolResponse(
					`✅ Successfully linked service '${serviceName}':\n\n${result}`,
				);
			} else {
				// List available services
				const servicesResult = await getRailwayServices({ workspacePath });
				if (!servicesResult.success) {
					return createToolResponse(
						"❌ Failed to get Railway services\n\n" +
							`**Error:** ${servicesResult.error}\n\n` +
							"**Next Steps:**\n" +
							"• Ensure you have a Railway project linked\n" +
							"• Check that you have permissions to view services\n" +
							"• Run `railway link` to ensure proper project connection",
					);
				}

				if (!servicesResult.services || servicesResult.services.length === 0) {
					return createToolResponse(
						"ℹ️ No services found in this project. Create a service first.",
					);
				}

				const result = `Available services:\n${servicesResult.services.map((s) => `- ${s}`).join("\n")}\n\nRun with a service name to link it.`;
				return createToolResponse(result);
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return createToolResponse(
				"❌ Failed to link Railway service\n\n" +
					`**Error:** ${errorMessage}\n\n` +
					"**Next Steps:**\n" +
					"• Ensure you have a Railway project linked\n" +
					"• Check that the service name is correct\n" +
					"• Verify you have permissions to link services\n" +
					"• Run `railway link` to ensure proper project connection",
			);
		}
	},
};

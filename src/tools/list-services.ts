import z from "zod";
import { getRailwayServices } from "../cli";
import type { GetServicesOptions } from "../cli/services";
import { createToolResponse } from "../utils";

export const listServicesTool = {
	name: "list-services",
	title: "List Railway Services",
	description: "List all services for the currently linked Railway project",
	inputSchema: {
		workspacePath: z
			.string()
			.describe("The path to the workspace to list services from"),
	},
	handler: async ({ workspacePath }: GetServicesOptions) => {
		try {
			const result = await getRailwayServices({ workspacePath });

			if (!result.success) {
				throw new Error(result.error);
			}

			const services = result.services || [];

			if (services.length === 0) {
				return createToolResponse(
					"ℹ️ No services found for the currently linked Railway project.\n\n" +
						"**Next Steps:**\n" +
						"• Ensure you have a project linked (`railway link`)\n" +
						"• Check that your project has services created\n" +
						"• Create a new service through the Railway dashboard or CLI",
				);
			}

			const formattedList = services
				.map((service, index) => `${index + 1}. **${service}**`)
				.join("\n");

			return createToolResponse(
				`✅ Found ${services.length} service(s) in the linked Railway project:\n\n${formattedList}\n\n**Note:** To link to a specific service, use the \`link-service\` tool.`,
			);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return createToolResponse(
				"❌ Failed to list Railway services\n\n" +
					`**Error:** ${errorMessage}\n\n` +
					"**Next Steps:**\n" +
					"• Ensure you are logged into Railway CLI (`railway login`)\n" +
					"• Check that you have a project linked (`railway link`)\n" +
					"• Verify you have permissions to view services\n" +
					"• Try running `railway login` to refresh your authentication",
			);
		}
	},
};

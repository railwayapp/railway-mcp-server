import z from "zod";
import { generateRailwayDomain } from "../cli";
import type { GenerateDomainOptions } from "../cli/deployment";
import { createToolResponse } from "../utils";

export const generateDomainTool = {
	name: "generate-domain",
	title: "Generate Railway Domain",
	description:
		"Generate a domain for the currently linked Railway project. If a domain already exists, it will return the existing domain URL. Optionally specify a service to generate the domain for.",
	inputSchema: {
		workspacePath: z
			.string()
			.describe("The path to the workspace to generate domain for"),
		service: z
			.string()
			.optional()
			.describe(
				"The name of the service to generate the domain for (optional)",
			),
	},
	handler: async ({ workspacePath, service }: GenerateDomainOptions) => {
		try {
			const domain = await generateRailwayDomain({
				workspacePath,
				service,
			});
			return createToolResponse(
				`✅ Successfully generated Railway domain${service ? ` for service '${service}'` : ""}:\n\n🚀 ${domain}\n\n**Note:** This domain is now available for your Railway project.`,
			);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return createToolResponse(
				"❌ Failed to generate Railway domain\n\n" +
					`**Error:** ${errorMessage}\n\n` +
					"**Next Steps:**\n" +
					"• Ensure you have a Railway project linked\n" +
					"• Check that you have permissions to generate domains\n" +
					"• Verify the project has been deployed at least once\n" +
					"• Run `railway link` to ensure proper project connection",
			);
		}
	},
};

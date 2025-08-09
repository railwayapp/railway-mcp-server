import z from "zod";
import { createRailwayProject } from "../cli";
import type { CreateProjectOptions } from "../cli/projects";
import { createToolResponse } from "../utils";

export const createProjectAndLinkTool = {
	name: "create-project-and-link",
	title: "Create Railway Project",
	description:
		"Create a new Railway project and link it to the current directory",
	inputSchema: {
		projectName: z.string(),
		workspacePath: z
			.string()
			.describe("The path to the workspace to create the project in"),
	},
	handler: async ({ projectName, workspacePath }: CreateProjectOptions) => {
		try {
			const result = await createRailwayProject({
				projectName,
				workspacePath,
			});
			return createToolResponse(
				`✅ Successfully created Railway project "${projectName}":\n\n${result}\n\nThis project is now linked and all commands will be run in the context of the newly created project. No need to run \`railway link\` again.`,
			);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return createToolResponse(
				"❌ Failed to create Railway project\n\n" +
					`**Error:** ${errorMessage}\n\n` +
					"**Next Steps:**\n" +
					"• Ensure you are logged into Railway CLI (`railway login`)\n" +
					"• Check that the project name is valid and unique\n" +
					"• Verify you have permissions to create projects\n" +
					"• Ensure the workspace path is accessible",
			);
		}
	},
};

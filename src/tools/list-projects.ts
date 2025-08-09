import { listRailwayProjects } from "../cli";
import { createToolResponse } from "../utils";

export const listProjectsTool = {
	name: "list-projects",
	title: "List Railway Projects",
	description: "List all Railway projects for the currently logged in account",
	inputSchema: {},
	handler: async () => {
		try {
			const projects = await listRailwayProjects();

			const projectList = projects.map((project) => ({
				id: project.id,
				name: project.name,
				team: project.team?.name || "Unknown",
				environments:
					project.environments?.edges?.map((env) => env.node.name) || [],
				services:
					project.services?.edges?.map((service) => service.node.name) || [],
				createdAt: project.createdAt,
				updatedAt: project.updatedAt,
			}));

			const formattedList = projectList
				.map(
					(project) =>
						`**${project.name}** (ID: ${project.id})\n` +
						`Team: ${project.team}\n` +
						`Environments: ${project.environments.join(", ")}\n` +
						`Services: ${project.services.join(", ")}\n` +
						`Created: ${new Date(project.createdAt).toLocaleDateString()}\n` +
						`Updated: ${new Date(project.updatedAt).toLocaleDateString()}\n`,
				)
				.join("\n");

			return createToolResponse(
				`✅ Found ${projects.length} Railway project(s):\n\n${formattedList}\n\n**Note:** To link to one of these projects, run \`railway link\` manually.`,
			);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return createToolResponse(
				"❌ Failed to list Railway projects\n\n" +
					`**Error:** ${errorMessage}\n\n` +
					"**Next Steps:**\n" +
					"• Ensure you are logged into Railway CLI (`railway login`)\n" +
					"• Check that your authentication token is valid\n" +
					"• Verify you have permissions to view projects\n" +
					"• Try running `railway login` to refresh your authentication",
			);
		}
	},
};

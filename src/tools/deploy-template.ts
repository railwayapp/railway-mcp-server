import z from "zod";
import {
	deployTemplate,
	searchAndListTemplates,
	type Template,
} from "../api/deploy-template";
import { getCurrentEnvironmentId } from "../cli/environments";
import { getLinkedProjectInfo } from "../cli/projects";
import { createToolResponse } from "../utils";

type DeployTemplateOptions = {
	workspacePath: string;
	searchQuery: string;
	templateIndex?: number;
	teamId?: string;
};

export const deployTemplateTool = {
	name: "deploy-template",
	title: "Deploy Railway Template",
	description:
		"Search and deploy Railway templates. This tool will search for templates using fuzzy search and automatically deploy the selected template to the current Railway project and environment.",
	inputSchema: {
		workspacePath: z
			.string()
			.describe("The path to the workspace to deploy the template to"),
		searchQuery: z
			.string()
			.describe(
				"Search query to filter templates by name, description, or category",
			),
		templateIndex: z
			.number()
			.optional()
			.describe(
				"Index of the template to deploy (required if multiple templates found)",
			),
		teamId: z.string().optional().describe("The ID of the team (optional)"),
	},
	handler: async ({
		workspacePath,
		searchQuery,
		templateIndex,
		teamId,
	}: DeployTemplateOptions) => {
		try {
			// Search and list templates
			const { templates, filteredCount, totalCount } =
				await searchAndListTemplates({ searchQuery });

			if (templates.length === 0) {
				return createToolResponse(
					`🔍 No templates found matching "${searchQuery}".\n\n` +
						`**Total templates available:** ${totalCount}\n\n` +
						`**Suggestions:**\n` +
						`• Try a different search term\n` +
						`• Use broader keywords\n` +
						`• Check your internet connection`,
				);
			}

			// If multiple templates found and no index specified, show the list
			if (templates.length > 1 && templateIndex === undefined) {
				const templateList = templates
					.map((template: Template, index: number) => {
						const verifiedBadge = template.isVerified
							? "verified"
							: "unverified";
						return (
							`${index + 1}. **${template.name}** - (${verifiedBadge})\n` +
							`   ID: \`${template.id}\`\n` +
							`   Description: ${template.description || "No description available"}\n` +
							`   Category: ${template.category}\n` +
							`   Active Projects: ${template.activeProjects} | Health: ${template.health} | Payout: ${template.totalPayout}`
						);
					})
					.join("\n\n");

				return createToolResponse(
					`🔍 Multiple templates found matching "${searchQuery}":\n\n` +
						`**Showing ${filteredCount} of ${totalCount} templates:**\n\n` +
						templateList +
						`\n\n**Please specify which template to deploy by providing:**\n` +
						`• templateIndex: [1-${templates.length}]`,
				);
			}

			// Get the template to deploy
			let templateToDeploy: Template;
			if (templates.length === 1) {
				templateToDeploy = templates[0];
			} else if (templateIndex !== undefined) {
				if (templateIndex < 1 || templateIndex > templates.length) {
					return createToolResponse(
						`❌ Invalid template index: ${templateIndex}\n\n` +
							`**Valid range:** 1-${templates.length}\n\n` +
							`Please provide a valid template index.`,
					);
				}
				templateToDeploy = templates[templateIndex - 1];
			} else {
				// This shouldn't happen, but just in case
				return createToolResponse(
					"❌ Unexpected error: Multiple templates found but no index specified.",
				);
			}

			// Get current project and environment IDs from Railway context
			const projectResult = await getLinkedProjectInfo({ workspacePath });
			if (!projectResult.success || !projectResult.project) {
				return createToolResponse(
					"❌ No Railway project is linked to this workspace.\n\n" +
						"**Next Steps:**\n" +
						"• Run `railway link` to connect to a project\n" +
						"• Or use the `create-project-and-link` tool to create a new project",
				);
			}

			const currentProjectId = projectResult.project.id;
			const currentEnvironmentId = await getCurrentEnvironmentId({
				workspacePath,
			});

			// Deploy the template
			const result = await deployTemplate({
				environmentId: currentEnvironmentId,
				projectId: currentProjectId,
				serializedConfig: templateToDeploy.serializedConfig,
				templateId: templateToDeploy.id,
				teamId,
			});

			return createToolResponse(
				`✅ Successfully deployed Railway template:\n\n` +
					`**Template:** ${templateToDeploy.name}\n` +
					`**Template ID:** ${templateToDeploy.id}\n` +
					`**Project:** ${projectResult.project.name} (${currentProjectId})\n` +
					`**Environment:** ${currentEnvironmentId}\n` +
					`**Workflow ID:** ${result.workflowId}\n\n` +
					`The template has been deployed successfully to the current Railway project and environment.`,
			);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return createToolResponse(
				"❌ Failed to search/deploy Railway template\n\n" +
					`**Error:** ${errorMessage}\n\n` +
					"**Next Steps:**\n" +
					"• Check your internet connection\n" +
					"• Verify that Railway's API is accessible\n" +
					"• Make sure you're authenticated with Railway (`railway login`)",
			);
		}
	},
};

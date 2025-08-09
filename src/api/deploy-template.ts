import Fuse from "fuse.js";
import { GraphQLClient } from "graphql-request";
import { getRailwayAuthToken } from "./auth";

export type ServiceConfig = {
	[key: string]: unknown;
};

export type SerializedTemplateConfig = {
	services: Record<string, ServiceConfig>;
};

export type TemplateDeployResponse = {
	projectId: string;
	workflowId: string;
};

export type Template = {
	id: string;
	name: string;
	description: string;
	category: string;
	serializedConfig: SerializedTemplateConfig;
	activeProjects: number;
	health: number;
	totalPayout: number;
	isVerified: boolean;
};

export const searchAndListTemplates = async ({
	searchQuery,
}: {
	searchQuery?: string;
}): Promise<{
	templates: Template[];
	filteredCount: number;
	totalCount: number;
}> => {
	const query = `
		query {
			templates {
				edges {
					node {
						id
						name
						description
						category
						serializedConfig
						activeProjects
						health
						totalPayout
						isVerified
					}
				}
			}
		}
	`;

	try {
		const client = new GraphQLClient(
			"https://backboard.railway.com/graphql/v2",
			{
				headers: {
					"x-source": "railway-mcp-server",
				},
			},
		);

		const data = await client.request<{
			templates: {
				edges: Array<{
					node: Template;
				}>;
			};
		}>(query);

		const templates = data.templates.edges.map(
			(edge) => edge.node,
		) as Template[];
		const totalCount = templates.length;

		// Sort templates based on the specified criteria (verified templates first, then by totalPayout, then by activeProjects, then by health)
		const sortedTemplates = templates.sort((a: Template, b: Template) => {
			if (a.isVerified && !b.isVerified) return -1;
			if (!a.isVerified && b.isVerified) return 1;

			if (a.totalPayout !== b.totalPayout) {
				return (b.totalPayout || 0) - (a.totalPayout || 0);
			}

			if (a.activeProjects !== b.activeProjects) {
				return (b.activeProjects || 0) - (a.activeProjects || 0);
			}

			if (a.health !== b.health) {
				return (b.health || 0) - (a.health || 0);
			}

			// If all criteria are equal, maintain original order
			return 0;
		});

		// If no search query provided, return all sorted templates
		if (!searchQuery || searchQuery.trim() === "") {
			return {
				templates: sortedTemplates,
				filteredCount: totalCount,
				totalCount,
			};
		}

		// Configure Fuse.js for fuzzy search
		const fuse = new Fuse(sortedTemplates, {
			keys: ["name", "description", "category"],
			threshold: 0.3, // Lower threshold = more strict matching
			includeScore: true,
			includeMatches: true,
		});

		// Perform fuzzy search
		const searchResults = fuse.search(searchQuery.trim());
		const filteredTemplates = searchResults.map((result) => result.item);

		return {
			templates: filteredTemplates,
			filteredCount: filteredTemplates.length,
			totalCount,
		};
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw new Error(`Failed to search Railway templates: ${error.message}`);
		}
		throw new Error("Failed to search Railway templates: Unknown error");
	}
};

export const deployTemplate = async ({
	environmentId,
	projectId,
	serializedConfig,
	templateId,
	teamId,
}: {
	environmentId: string;
	projectId: string;
	serializedConfig: SerializedTemplateConfig;
	templateId: string;
	teamId?: string;
}): Promise<TemplateDeployResponse> => {
	const query = `
		mutation deployTemplate($environmentId: String, $projectId: String, $templateId: String!, $teamId: String, $serializedConfig: SerializedTemplateConfig!) {
			templateDeployV2(input: {
				environmentId: $environmentId,
				projectId: $projectId,
				templateId: $templateId,
				teamId: $teamId,
				serializedConfig: $serializedConfig
			}) {
				projectId
				workflowId
			}
		}
	`;

	try {
		const token = getRailwayAuthToken();
		const client = new GraphQLClient(
			"https://backboard.railway.com/graphql/v2",
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"x-source": "railway-mcp-server",
				},
			},
		);

		const data = await client.request<{
			templateDeployV2: TemplateDeployResponse;
		}>(query, {
			environmentId,
			projectId,
			templateId,
			teamId,
			serializedConfig,
		});

		return data.templateDeployV2;
	} catch (error: unknown) {
		if (error instanceof Error) {
			throw new Error(`Failed to deploy template: ${error.message}`);
		}
		throw new Error("Failed to deploy template: Unknown error");
	}
};

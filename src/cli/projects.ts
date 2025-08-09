import {
	checkRailwayCliStatus,
	runRailwayCommand,
	runRailwayJsonCommand,
} from "./core";
import { analyzeRailwayError, ERROR_PATTERNS } from "./error-handling";

export type RailwayProject = {
	id: string;
	name: string;
	team?: {
		name: string;
	};
	environments?: {
		edges?: Array<{
			node: {
				name: string;
			};
		}>;
	};
	services?: {
		edges?: Array<{
			node: {
				name: string;
			};
		}>;
	};
	createdAt: string;
	updatedAt: string;
};

export type GetLinkedProjectInfoOptions = {
	workspacePath: string;
};

export const getLinkedProjectInfo = async ({
	workspacePath,
}: GetLinkedProjectInfoOptions): Promise<{
	success: boolean;
	project?: RailwayProject;
	error?: string;
}> => {
	try {
		await checkRailwayCliStatus();
		const project = await runRailwayJsonCommand(
			"railway status --json",
			workspacePath,
		);

		if (!project || typeof project !== "object") {
			return { success: false, error: "Invalid response from Railway CLI" };
		}

		return { success: true, project: project as RailwayProject };
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);

		// Check if it's a "no linked project" error
		if (ERROR_PATTERNS.NO_LINKED_PROJECT.test(errorMessage)) {
			return {
				success: false,
				error:
					"No Railway project is linked. Run 'railway link' to connect to a project",
			};
		}

		return { success: false, error: errorMessage };
	}
};

export const listRailwayProjects = async (): Promise<RailwayProject[]> => {
	try {
		await checkRailwayCliStatus();
		const projects = await runRailwayJsonCommand("railway list --json");

		if (!Array.isArray(projects)) {
			throw new Error("Unexpected response format from Railway CLI");
		}

		return projects;
	} catch (error: unknown) {
		return analyzeRailwayError(error, "railway list --json");
	}
};

export type CreateProjectOptions = {
	projectName: string;
	workspacePath: string;
};

export const createRailwayProject = async ({
	projectName,
	workspacePath,
}: CreateProjectOptions): Promise<string> => {
	try {
		await checkRailwayCliStatus();

		// Check if there's already a linked project
		const linkedProjectResult = await getLinkedProjectInfo({ workspacePath });
		if (linkedProjectResult.success && linkedProjectResult.project) {
			return "A Railway project is already linked to this workspace. No new project created.";
		}

		const { output: initOutput } = await runRailwayCommand(
			`railway init --name ${projectName}`,
			workspacePath,
		);
		const { output: linkOutput } = await runRailwayCommand(
			`railway link -p ${projectName}`,
			workspacePath,
		);

		return `${initOutput}\n${linkOutput}`;
	} catch (error: unknown) {
		return analyzeRailwayError(error, `railway init --name ${projectName}`);
	}
};

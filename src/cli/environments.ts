import {
	checkRailwayCliStatus,
	runRailwayCommand,
	runRailwayJsonCommand,
} from "./core";
import { analyzeRailwayError } from "./error-handling";
import { getLinkedProjectInfo } from "./projects";

export type GetCurrentEnvironmentIdOptions = {
	workspacePath: string;
};

export const getCurrentEnvironmentId = async ({
	workspacePath,
}: GetCurrentEnvironmentIdOptions): Promise<string> => {
	try {
		await checkRailwayCliStatus();
		const result = await getLinkedProjectInfo({ workspacePath });
		if (!result.success) {
			throw new Error(result.error);
		}

		const { output: statusOutput } = await runRailwayCommand(
			["status"],
			workspacePath,
		);

		const envNameMatch = statusOutput.match(/Environment:\s+(\w+)/);
		if (!envNameMatch?.[1]) {
			throw new Error("Could not determine current environment name");
		}

		const currentEnvironmentName = envNameMatch[1];

		const statusData = await runRailwayJsonCommand(
			["status", "--json"],
			workspacePath,
		);

		if (statusData.environments?.edges?.length > 0) {
			for (const envEdge of statusData.environments.edges) {
				const env = envEdge.node;
				if (env.name === currentEnvironmentName) {
					return env.id;
				}
			}
		}

		throw new Error(
			`Could not determine environment ID for environment: ${currentEnvironmentName}`,
		);
	} catch (error: unknown) {
		return analyzeRailwayError(error, "railway environment");
	}
};

export type LinkEnvironmentOptions = {
	workspacePath: string;
	environmentName?: string;
};

export const linkRailwayEnvironment = async ({
	workspacePath,
	environmentName,
}: LinkEnvironmentOptions): Promise<string> => {
	try {
		await checkRailwayCliStatus();
		const result = await getLinkedProjectInfo({ workspacePath });
		if (!result.success) {
			throw new Error(result.error);
		}

		const args = environmentName
			? ["environment", environmentName]
			: ["environment"];
		const { output } = await runRailwayCommand(args, workspacePath);

		return output;
	} catch (error: unknown) {
		return analyzeRailwayError(error, "railway environment");
	}
};

export type CreateEnvironmentOptions = {
	workspacePath: string;
	environmentName: string;
	duplicateEnvironment?: string;
	serviceVariables?: Array<{ service: string; variable: string }>;
};

export const createRailwayEnvironment = async ({
	workspacePath,
	environmentName,
	duplicateEnvironment,
	serviceVariables,
}: CreateEnvironmentOptions): Promise<string> => {
	try {
		await checkRailwayCliStatus();
		const result = await getLinkedProjectInfo({ workspacePath });
		if (!result.success) {
			throw new Error(result.error);
		}

		const args = ["environment", "new", environmentName];

		if (duplicateEnvironment) {
			args.push("--duplicate", duplicateEnvironment);
		}

		if (serviceVariables && serviceVariables.length > 0) {
			for (const sv of serviceVariables) {
				args.push("--service-variable", sv.service, sv.variable);
			}
		}

		const { output } = await runRailwayCommand(args, workspacePath);

		return output;
	} catch (error: unknown) {
		return analyzeRailwayError(
			error,
			`railway environment new ${environmentName}`,
		);
	}
};

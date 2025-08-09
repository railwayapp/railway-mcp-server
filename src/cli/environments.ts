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

		// First, get the current environment name from railway status
		const { output: statusOutput } = await runRailwayCommand(
			"railway status",
			workspacePath,
		);

		// Parse the output to extract current environment name
		// The output format is typically: "Environment: production"
		const envNameMatch = statusOutput.match(/Environment:\s+(\w+)/);
		if (!envNameMatch?.[1]) {
			throw new Error("Could not determine current environment name");
		}

		const currentEnvironmentName = envNameMatch[1];

		// Get detailed environment information using railway status --json
		const statusData = await runRailwayJsonCommand(
			"railway status --json",
			workspacePath,
		);

		// Find the environment ID that matches the current environment name
		if (statusData.environments?.edges?.length > 0) {
			for (const envEdge of statusData.environments.edges) {
				const env = envEdge.node;
				if (env.name === currentEnvironmentName) {
					return env.id;
				}
			}
		}

		// If we can't find the environment ID, throw an error
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

		const command = environmentName
			? `railway environment ${environmentName}`
			: "railway environment";
		const { output } = await runRailwayCommand(command, workspacePath);

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

		let command = `railway environment new ${environmentName}`;

		if (duplicateEnvironment) {
			command += ` --duplicate ${duplicateEnvironment}`;
		}

		if (serviceVariables && serviceVariables.length > 0) {
			for (const sv of serviceVariables) {
				command += ` --service-variable ${sv.service} ${sv.variable}`;
			}
		}

		const { output } = await runRailwayCommand(command, workspacePath);

		return output;
	} catch (error: unknown) {
		return analyzeRailwayError(
			error,
			`railway environment new ${environmentName}`,
		);
	}
};

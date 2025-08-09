import { checkRailwayCliStatus, runRailwayCommand } from "./core";
import { analyzeRailwayError } from "./error-handling";
import { getLinkedProjectInfo } from "./projects";

export type ListVariablesOptions = {
	workspacePath: string;
	service?: string;
	environment?: string;
	kv?: boolean;
	json?: boolean;
};

export const listRailwayVariables = async ({
	workspacePath,
	service,
	environment,
	kv,
	json,
}: ListVariablesOptions): Promise<string> => {
	try {
		await checkRailwayCliStatus();
		const result = await getLinkedProjectInfo({ workspacePath });
		if (!result.success) {
			throw new Error(result.error);
		}

		let command = "railway variables";

		if (service) {
			command += ` --service ${service}`;
		}
		if (environment) {
			command += ` --environment ${environment}`;
		}
		if (kv) {
			command += " --kv";
		}
		if (json) {
			command += " --json";
		}

		const { output } = await runRailwayCommand(command, workspacePath);
		return output;
	} catch (error: unknown) {
		return analyzeRailwayError(error, "railway variables");
	}
};

export type SetVariablesOptions = {
	workspacePath: string;
	variables: string[];
	service?: string;
	environment?: string;
	skipDeploys?: boolean;
};

export const setRailwayVariables = async ({
	workspacePath,
	variables,
	service,
	environment,
	skipDeploys,
}: SetVariablesOptions): Promise<string> => {
	try {
		await checkRailwayCliStatus();
		const result = await getLinkedProjectInfo({ workspacePath });
		if (!result.success) {
			throw new Error(result.error);
		}

		let command = "railway variables";

		if (service) {
			command += ` --service ${service}`;
		}
		if (environment) {
			command += ` --environment ${environment}`;
		}
		if (skipDeploys) {
			command += " --skip-deploys";
		}

		// Add each variable with --set flag
		variables.forEach((variable) => {
			command += ` --set "${variable}"`;
		});

		const { output } = await runRailwayCommand(command, workspacePath);
		return output;
	} catch (error: unknown) {
		return analyzeRailwayError(error, "railway variables --set");
	}
};

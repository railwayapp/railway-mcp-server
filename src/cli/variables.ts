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

		const args = ["variables"];

		if (service) args.push("--service", service);
		if (environment) args.push("--environment", environment);
		if (kv) args.push("--kv");
		if (json) args.push("--json");

		const { output } = await runRailwayCommand(args, workspacePath);
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

		const args = ["variables"];

		if (service) args.push("--service", service);
		if (environment) args.push("--environment", environment);
		if (skipDeploys) args.push("--skip-deploys");

		for (const variable of variables) {
			args.push("--set", variable);
		}

		const { output } = await runRailwayCommand(args, workspacePath);
		return output;
	} catch (error: unknown) {
		return analyzeRailwayError(error, "railway variables --set");
	}
};

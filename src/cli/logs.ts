import { checkRailwayCliStatus, runRailwayCommand } from "./core";
import { analyzeRailwayError } from "./error-handling";
import { getLinkedProjectInfo } from "./projects";

const buildLogCommand = (
	type: "deployment" | "build",
	deploymentId?: string,
	service?: string,
	environment?: string,
) => {
	let command = `railway logs --${type} --json`;

	if (deploymentId) command += ` ${deploymentId}`;
	if (service) command += ` --service ${service}`;
	if (environment) command += ` --environment ${environment}`;

	return command;
};

export type GetLogsOptions = {
	workspacePath: string;
	deploymentId?: string;
	service?: string;
	environment?: string;
};

export const getRailwayDeployLogs = async ({
	workspacePath,
	deploymentId,
	service,
	environment,
}: GetLogsOptions): Promise<string> => {
	try {
		await checkRailwayCliStatus();
		const result = await getLinkedProjectInfo({ workspacePath });
		if (!result.success) {
			throw new Error(result.error);
		}

		const command = buildLogCommand(
			"deployment",
			deploymentId,
			service,
			environment,
		);
		const { output } = await runRailwayCommand(command, workspacePath);

		return output;
	} catch (error: unknown) {
		return analyzeRailwayError(error, "railway logs --deployment --json");
	}
};

export const getRailwayBuildLogs = async ({
	workspacePath,
	deploymentId,
	service,
	environment,
}: GetLogsOptions): Promise<string> => {
	try {
		await checkRailwayCliStatus();
		const result = await getLinkedProjectInfo({ workspacePath });
		if (!result.success) {
			throw new Error(result.error);
		}

		const command = buildLogCommand(
			"build",
			deploymentId,
			service,
			environment,
		);
		const { output } = await runRailwayCommand(command, workspacePath);

		return output;
	} catch (error: unknown) {
		return analyzeRailwayError(error, "railway logs --build --json");
	}
};

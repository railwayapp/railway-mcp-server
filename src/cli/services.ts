import { checkRailwayCliStatus, runRailwayCommand } from "./core";
import { analyzeRailwayError } from "./error-handling";
import { getLinkedProjectInfo } from "./projects";

export type GetServicesOptions = {
	workspacePath: string;
};

export const getRailwayServices = async ({
	workspacePath,
}: GetServicesOptions): Promise<{
	success: boolean;
	services?: string[];
	error?: string;
}> => {
	try {
		await checkRailwayCliStatus();
		const result = await getLinkedProjectInfo({ workspacePath });
		if (!result.success) {
			throw new Error(result.error);
		}

		const { output } = await runRailwayCommand(
			"railway status --json",
			workspacePath,
		);

		// Parse the JSON output to extract services
		const statusData = JSON.parse(output);

		// Extract services from the JSON structure
		const services =
			statusData.services?.edges?.map(
				(edge: { node: { name: string } }) => edge.node.name,
			) || [];

		return { success: true, services };
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		return { success: false, error: errorMessage };
	}
};

export type LinkServiceOptions = {
	workspacePath: string;
	serviceName: string;
};

export const linkRailwayService = async ({
	workspacePath,
	serviceName,
}: LinkServiceOptions): Promise<string> => {
	try {
		await checkRailwayCliStatus();
		const result = await getLinkedProjectInfo({ workspacePath });
		if (!result.success) {
			throw new Error(result.error);
		}

		const { output } = await runRailwayCommand(
			`railway service ${serviceName}`,
			workspacePath,
		);

		return output;
	} catch (error: unknown) {
		return analyzeRailwayError(error, "railway service");
	}
};

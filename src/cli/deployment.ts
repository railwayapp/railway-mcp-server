import {
	checkRailwayCliStatus,
	runRailwayCommand,
	runRailwayJsonCommand,
} from "./core";
import { analyzeRailwayError } from "./error-handling";
import { getLinkedProjectInfo } from "./projects";
import { getRailwayServices } from "./services";

export type DeployOptions = {
	workspacePath: string;
	environment?: string;
	service?: string;
	ci?: boolean;
};

export const deployRailwayProject = async ({
	workspacePath,
	environment,
	service,
	ci,
}: DeployOptions): Promise<string> => {
	try {
		await checkRailwayCliStatus();
		const result = await getLinkedProjectInfo({ workspacePath });
		if (!result.success) {
			throw new Error(result.error);
		}

		// Build the railway up command with options
		let command = "railway up";

		if (ci) {
			command += " --ci";
		}

		if (environment) {
			command += ` --environment ${environment}`;
		}

		if (service) {
			command += ` --service ${service}`;
		}

		const { output: deployOutput } = await runRailwayCommand(
			command,
			workspacePath,
		);

		// After deployment, try to link a service if none is linked
		try {
			// Check if there are any services available
			const servicesResult = await getRailwayServices({ workspacePath });
			if (
				servicesResult.success &&
				servicesResult.services &&
				servicesResult.services.length > 0
			) {
				// Link the first available service
				const firstService = servicesResult.services[0];
				const { output: linkOutput } = await runRailwayCommand(
					`railway service ${firstService}`,
					workspacePath,
				);
				return `${deployOutput}\n\nService linked: ${firstService}\n${linkOutput}`;
			}
		} catch (linkError) {
			// If linking fails, just return the deployment output
			console.warn(
				"Warning: Could not automatically link service after deployment:",
				linkError,
			);
		}

		return deployOutput;
	} catch (error: unknown) {
		return analyzeRailwayError(error, "railway up");
	}
};

export type GenerateDomainOptions = {
	workspacePath: string;
	service?: string;
};

export const generateRailwayDomain = async ({
	workspacePath,
	service,
}: GenerateDomainOptions): Promise<string> => {
	try {
		await checkRailwayCliStatus();
		const projectResult = await getLinkedProjectInfo({ workspacePath });
		if (!projectResult.success) {
			throw new Error(projectResult.error);
		}

		// Build the railway domain command with options
		let command = "railway domain --json";

		if (service) {
			command += ` --service ${service}`;
		}

		const domainResult = await runRailwayJsonCommand(command, workspacePath);

		if (domainResult.domain) {
			return domainResult.domain;
		}

		throw new Error("No domain found in Railway CLI JSON response");
	} catch (error: unknown) {
		return analyzeRailwayError(error, "railway domain --json");
	}
};

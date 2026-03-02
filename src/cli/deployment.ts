import { checkRailwayCliStatus, runRailwayCommand } from "./core";
import { analyzeRailwayError } from "./error-handling";
import { getLinkedProjectInfo } from "./projects";
import { getCliFeatureSupport, getRailwayVersion } from "./version";

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
      workspacePath
    );

    // After deployment, re-link the service that was just deployed (if specified)
    if (service) {
      try {
        const { output: linkOutput } = await runRailwayCommand(
          `railway service ${service}`,
          workspacePath
        );
        return `${deployOutput}\n\nService linked: ${service}\n${linkOutput}`;
      } catch (linkError) {
        // If linking fails, just return the deployment output
        console.warn(
          "Warning: Could not automatically link service after deployment:",
          linkError
        );
      }
    }

    return deployOutput;
  } catch (error: unknown) {
    return analyzeRailwayError(error, "railway up");
  }
};

export type ListDeploymentsOptions = {
  workspacePath: string;
  service?: string;
  environment?: string;
  limit?: number;
  json?: boolean;
};

export type Deployment = {
  id: string;
  status: string;
  createdAt: string;
  commitMessage?: string;
  commitAuthor?: string;
  branch?: string;
  serviceName?: string;
  environmentName?: string;
};

export const listDeployments = async ({
  workspacePath,
  service,
  environment,
  limit = 20,
  json = false,
}: ListDeploymentsOptions): Promise<
  | {
      success: true;
      output: string;
    }
  | {
      success: false;
      error: string;
    }
> => {
  try {
    await checkRailwayCliStatus();

    const featureSupport = await getCliFeatureSupport();
    if (!featureSupport.deployment.list) {
      const version = await getRailwayVersion();
      return {
        success: false,
        error: `Railway CLI version ${
          version || "unknown"
        } does not support 'deployment list' command. Please upgrade to version 4.10.0 or later.`,
      };
    }

    const projectResult = await getLinkedProjectInfo({ workspacePath });
    if (!projectResult.success) {
      return {
        success: false,
        error: projectResult.error ?? "Failed to get project info",
      };
    }

    let command = "railway deployment list";

    if (service) {
      command += ` --service ${service}`;
    }

    if (environment) {
      command += ` --environment ${environment}`;
    }

    if (limit) {
      command += ` --limit ${limit}`;
    }

    if (json) {
      command += " --json";
    }

    const { output } = await runRailwayCommand(command, workspacePath);
    return { success: true, output };
  } catch (error: unknown) {
    return analyzeRailwayError(error, `railway deployment list`);
  }
};

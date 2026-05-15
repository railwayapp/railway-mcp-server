import { checkRailwayCliStatus, runRailwayCommand } from "./core";
import { analyzeRailwayError } from "./error-handling";
import { getLinkedProjectInfo } from "./projects";
import { getRailwayServices } from "./services";
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

    const args = ["up"];
    if (ci) args.push("--ci");
    if (environment) args.push("--environment", environment);
    if (service) args.push("--service", service);

    const { output: deployOutput } = await runRailwayCommand(
      args,
      workspacePath
    );

    try {
      const servicesResult = await getRailwayServices({ workspacePath });
      if (
        servicesResult.success &&
        servicesResult.services &&
        servicesResult.services.length > 0
      ) {
        const firstService = servicesResult.services[0];
        const { output: linkOutput } = await runRailwayCommand(
          ["service", firstService],
          workspacePath
        );
        return `${deployOutput}\n\nService linked: ${firstService}\n${linkOutput}`;
      }
    } catch (linkError) {
      console.warn(
        "Warning: Could not automatically link service after deployment:",
        linkError
      );
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

    const args = ["deployment", "list"];
    if (service) args.push("--service", service);
    if (environment) args.push("--environment", environment);
    if (limit) args.push("--limit", String(limit));
    if (json) args.push("--json");

    const { output } = await runRailwayCommand(args, workspacePath);
    return { success: true, output };
  } catch (error: unknown) {
    return analyzeRailwayError(error, `railway deployment list`);
  }
};

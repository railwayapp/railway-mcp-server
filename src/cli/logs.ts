import { checkRailwayCliStatus, runRailwayCommand } from "./core";
import { getCliFeatureSupport } from "./version";
import { analyzeRailwayError } from "./error-handling";
import { getLinkedProjectInfo } from "./projects";

export const buildLogCommand = async (
  type: "deployment" | "build",
  deploymentId?: string,
  service?: string,
  environment?: string,
  lines?: number,
  filter?: string
): Promise<string> => {
  const args = ["logs", `--${type}`, "--json"];
  const features = await getCliFeatureSupport();
  const supportsLinesAndFilter =
    features.logs.args.lines && features.logs.args.filter;

  if (supportsLinesAndFilter) {
    // Always use --lines when specified to prevent streaming
    args.push("--lines", lines ? lines.toString() : "1000");

    if (filter) {
      args.push("--filter", `"${filter}"`);
    }
  }

  if (deploymentId) args.push(deploymentId);
  if (service) args.push("--service", service);
  if (environment) args.push("--environment", environment);

  return `railway ${args.join(" ")}`;
};

export type GetLogsOptions = {
  workspacePath: string;
  deploymentId?: string;
  service?: string;
  environment?: string;
  lines?: number;
  filter?: string;
};

export const getRailwayDeployLogs = async ({
  workspacePath,
  deploymentId,
  service,
  environment,
  lines,
  filter,
}: GetLogsOptions): Promise<string> => {
  const command = await buildLogCommand(
    "deployment",
    deploymentId,
    service,
    environment,
    lines,
    filter
  );

  try {
    await checkRailwayCliStatus();
    const result = await getLinkedProjectInfo({ workspacePath });
    if (!result.success) {
      throw new Error(result.error);
    }

    const { output } = await runRailwayCommand(command, workspacePath);

    return output;
  } catch (error: unknown) {
    return analyzeRailwayError(error, command);
  }
};

export const getRailwayBuildLogs = async ({
  workspacePath,
  deploymentId,
  service,
  environment,
  lines,
  filter,
}: GetLogsOptions): Promise<string> => {
  const command = await buildLogCommand(
    "build",
    deploymentId,
    service,
    environment,
    lines,
    filter
  );
  try {
    await checkRailwayCliStatus();
    const result = await getLinkedProjectInfo({ workspacePath });
    if (!result.success) {
      throw new Error(result.error);
    }

    const { output } = await runRailwayCommand(command, workspacePath);

    return output;
  } catch (error: unknown) {
    return analyzeRailwayError(error, command);
  }
};

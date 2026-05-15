import { checkRailwayCliStatus, runRailwayCommand } from "./core";
import { getCliFeatureSupport } from "./version";
import { analyzeRailwayError } from "./error-handling";
import { getLinkedProjectInfo } from "./projects";

type BuildLogCommandOptions = {
  type: "deployment" | "build";
  deploymentId?: string;
  service?: string;
  environment?: string;
  lines?: number;
  filter?: string;
  json?: boolean;
};

export const buildLogCommand = async ({
  type,
  deploymentId,
  service,
  environment,
  lines,
  filter,
  json = false,
}: BuildLogCommandOptions): Promise<string[]> => {
  const args = ["logs", `--${type}`];
  if (json) args.push("--json");

  const features = await getCliFeatureSupport();
  const supportsLinesAndFilter =
    features.logs.args.lines && features.logs.args.filter;

  if (supportsLinesAndFilter) {
    // JSON really eats the token limit up, so default to a low amount if that's
    // turned on.
    const defaultLines = json ? "100" : "500";

    args.push("--lines", lines ? lines.toString() : defaultLines);

    if (filter) args.push("--filter", filter);
  }

  if (deploymentId) args.push(deploymentId);
  if (service) args.push("--service", service);
  if (environment) args.push("--environment", environment);

  return args;
};

export type GetLogsOptions = Pick<
  BuildLogCommandOptions,
  "deploymentId" | "service" | "environment" | "lines" | "filter" | "json"
> & {
  workspacePath: string;
};

export const getRailwayDeployLogs = async ({
  workspacePath,
  deploymentId,
  service,
  environment,
  lines,
  filter,
  json,
}: GetLogsOptions): Promise<string> => {
  const args = await buildLogCommand({
    type: "deployment",
    deploymentId,
    service,
    environment,
    lines,
    filter,
    json,
  });

  try {
    await checkRailwayCliStatus();
    const result = await getLinkedProjectInfo({ workspacePath });
    if (!result.success) {
      throw new Error(result.error);
    }

    const { output } = await runRailwayCommand(args, workspacePath);

    return output;
  } catch (error: unknown) {
    return analyzeRailwayError(error, `railway ${args.join(" ")}`);
  }
};

export const getRailwayBuildLogs = async ({
  workspacePath,
  deploymentId,
  service,
  environment,
  lines,
  filter,
  json,
}: GetLogsOptions): Promise<string> => {
  const args = await buildLogCommand({
    type: "build",
    deploymentId,
    service,
    environment,
    lines,
    filter,
    json,
  });
  try {
    await checkRailwayCliStatus();
    const result = await getLinkedProjectInfo({ workspacePath });
    if (!result.success) {
      throw new Error(result.error);
    }

    const { output } = await runRailwayCommand(args, workspacePath);

    return output;
  } catch (error: unknown) {
    return analyzeRailwayError(error, `railway ${args.join(" ")}`);
  }
};

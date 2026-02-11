import { checkRailwayCliStatus, runRailwayCommand } from "./core";
import { getCliFeatureSupport } from "./version";
import { analyzeRailwayError } from "./error-handling";
import { getLinkedProjectInfo } from "./projects";
import { quoteArg } from "../utils";

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
}: BuildLogCommandOptions): Promise<string> => {
  const args = ["logs", `--${type}`];
  if (json) {
    args.push("--json");
  }

  const features = await getCliFeatureSupport();
  const supportsLinesAndFilter =
    features.logs.args.lines && features.logs.args.filter;

  if (supportsLinesAndFilter) {
    // JSON really eats the token limit up, so default to a low amount if that's
    // turned on.
    const defaultLines = json ? "100" : "500";

    // Always use --lines when specified to prevent streaming
    args.push("--lines", lines ? lines.toString() : defaultLines);

    if (filter) {
      args.push("--filter", `"${filter}"`);
    }
  }

  if (deploymentId) args.push(deploymentId);
  if (service) args.push("--service", quoteArg(service));
  if (environment) args.push("--environment", quoteArg(environment));

  return `railway ${args.join(" ")}`;
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
  const command = await buildLogCommand({
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
  json,
}: GetLogsOptions): Promise<string> => {
  const command = await buildLogCommand({
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

    const { output } = await runRailwayCommand(command, workspacePath);

    return output;
  } catch (error: unknown) {
    return analyzeRailwayError(error, command);
  }
};

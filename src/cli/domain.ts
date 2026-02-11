import { checkRailwayCliStatus, runRailwayJsonCommand } from "./core";
import { analyzeRailwayError } from "./error-handling";
import { getLinkedProjectInfo } from "./projects";
import { quoteArg } from "../utils";

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
      command += ` --service ${quoteArg(service)}`;
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

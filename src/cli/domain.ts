import { checkRailwayCliStatus, runRailwayJsonCommand } from "./core";
import { analyzeRailwayError } from "./error-handling";
import { getLinkedProjectInfo } from "./projects";

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

    const args = ["domain", "--json"];
    if (service) args.push("--service", service);

    const domainResult = await runRailwayJsonCommand(args, workspacePath);

    if (domainResult.domain) {
      return domainResult.domain;
    }

    throw new Error("No domain found in Railway CLI JSON response");
  } catch (error: unknown) {
    return analyzeRailwayError(error, "railway domain --json");
  }
};

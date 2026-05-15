import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { analyzeRailwayError } from "./error-handling";

const execFileAsync = promisify(execFile);

// Pass argv as an array. We invoke `railway` directly via execFile, so no shell
// is involved and metacharacters in user-supplied arguments cannot be parsed
// as commands.
export const runRailwayCommand = async (args: string[], cwd?: string) => {
  const { stdout, stderr } = await execFileAsync("railway", args, { cwd });
  return { stdout, stderr, output: stdout + stderr };
};

export const runRailwayJsonCommand = async (args: string[], cwd?: string) => {
  const { stdout } = await runRailwayCommand(args, cwd);
  return JSON.parse(stdout.trim());
};

export const checkRailwayCliStatus = async (): Promise<void> => {
  try {
    await runRailwayCommand(["--version"]);
    await runRailwayCommand(["whoami"]);
  } catch (error: unknown) {
    return analyzeRailwayError(error, "railway whoami");
  }
};

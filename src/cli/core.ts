import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { analyzeRailwayError } from "./error-handling";

const execFileAsync = promisify(execFile);

/**
 * Parse a command string into [executable, ...args], handling quoted arguments.
 * This allows us to use execFile (no shell) instead of exec (needs shell),
 * avoiding the "spawn cmd.exe ENOENT" error when running on Linux.
 */
function parseCommand(command: string): [string, string[]] {
  const tokens: string[] = [];
  let current = "";
  let inQuote = false;
  let quoteChar = "";

  for (const char of command) {
    if (inQuote) {
      if (char === quoteChar) {
        inQuote = false;
      } else {
        current += char;
      }
    } else if (char === '"' || char === "'") {
      inQuote = true;
      quoteChar = char;
    } else if (char === " " || char === "\t") {
      if (current) {
        tokens.push(current);
        current = "";
      }
    } else {
      current += char;
    }
  }
  if (current) tokens.push(current);

  const [cmd, ...args] = tokens;
  return [cmd, args];
}

export const runRailwayCommand = async (command: string, cwd?: string) => {
  const [cmd, args] = parseCommand(command);
  const { stdout, stderr } = await execFileAsync(cmd, args, { cwd });
  return { stdout, stderr, output: stdout + stderr };
};

export const runRailwayJsonCommand = async (command: string, cwd?: string) => {
  const { stdout } = await runRailwayCommand(command, cwd);
  return JSON.parse(stdout.trim());
};

export const checkRailwayCliStatus = async (): Promise<void> => {
  try {
    await runRailwayCommand("railway --version");
    await runRailwayCommand("railway whoami");
  } catch (error: unknown) {
    return analyzeRailwayError(error, "railway whoami");
  }
};

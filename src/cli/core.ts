import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { analyzeRailwayError } from "./error-handling";

const execFileAsync = promisify(execFile);

export const runRailwayCommand = async (command: string, cwd?: string) => {  
  const parts = command.split(' ');  
  const [cmd, ...args] = parts;  
    
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

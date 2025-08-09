import { exec } from "node:child_process";
import { promisify } from "node:util";
import { analyzeRailwayError } from "./error-handling";

const execAsync = promisify(exec);

export const runRailwayCommand = async (command: string, cwd?: string) => {
	const { stdout, stderr } = await execAsync(command, { cwd });
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

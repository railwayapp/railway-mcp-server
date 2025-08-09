import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const getRailwayAuthToken = (): string => {
	const homeDir = homedir();
	const configPath = join(homeDir, ".railway", "config.json");

	try {
		const configData = readFileSync(configPath, "utf-8");
		const config = JSON.parse(configData);

		if (config.user?.token) {
			return config.user.token;
		}
	} catch {
		throw new Error(
			"Railway config file not found or invalid. Run 'railway login' to authenticate",
		);
	}

	throw new Error(
		"No Railway authentication token found. Run 'railway login' to authenticate",
	);
};

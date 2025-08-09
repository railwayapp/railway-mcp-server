export const ERROR_PATTERNS = {
	UNAUTHORIZED: /Unauthorized\. Please login with `railway login`/,
	INVALID_TOKEN: /Unauthorized/,
	NO_LINKED_PROJECT:
		/No linked project found\. Run railway link to connect to a project/,
	PROJECT_NOT_FOUND:
		/Project not found\. Run `railway link` to connect to a project\./,
	PROJECT_DELETED:
		/Project is deleted\. Run `railway link` to connect to a project\./,
	ENVIRONMENT_DELETED:
		/Environment is deleted\. Run `railway environment` to connect to an environment\./,
	SERVICE_NOT_FOUND: /Service "[^"]+" not found\./,
	NO_SERVICES: /Project has no services\./,
	NO_SERVICE_LINKED:
		/No service linked\nRun `railway service` to link a service/,
	NO_PROJECTS: /No projects found\. Run `railway init` to create a new project/,
} as const;

type RailwayError = {
	code?: string;
	stdout?: string;
	stderr?: string;
	message?: string;
};

export const analyzeRailwayError = (error: unknown, command: string): never => {
	const err = error as RailwayError;
	const output = (err.stdout || "") + (err.stderr || "");

	if (ERROR_PATTERNS.UNAUTHORIZED.test(output)) {
		throw new Error(
			"Not logged in to Railway CLI. Please run 'railway login' first",
		);
	}

	if (
		ERROR_PATTERNS.INVALID_TOKEN.test(output) &&
		!ERROR_PATTERNS.UNAUTHORIZED.test(output)
	) {
		throw new Error(
			"Invalid or expired Railway token. Please run 'railway login' to refresh your authentication",
		);
	}

	if (ERROR_PATTERNS.NO_LINKED_PROJECT.test(output)) {
		throw new Error(
			"No Railway project is linked. Run 'railway link' to connect to a project",
		);
	}

	if (ERROR_PATTERNS.PROJECT_NOT_FOUND.test(output)) {
		throw new Error(
			"Project not found. Run 'railway link' to connect to a project",
		);
	}

	if (ERROR_PATTERNS.PROJECT_DELETED.test(output)) {
		throw new Error(
			"Project has been deleted. Run 'railway link' to connect to a different project",
		);
	}

	if (ERROR_PATTERNS.ENVIRONMENT_DELETED.test(output)) {
		throw new Error(
			"Environment has been deleted. Run 'railway environment' to connect to an environment",
		);
	}

	if (ERROR_PATTERNS.SERVICE_NOT_FOUND.test(output)) {
		throw new Error(
			"Service not found. Run 'railway service <service-name>' to link a service",
		);
	}

	if (ERROR_PATTERNS.NO_SERVICES.test(output)) {
		throw new Error("Project has no services. Create a service first");
	}

	if (ERROR_PATTERNS.NO_SERVICE_LINKED.test(output)) {
		throw new Error(
			"No service linked. Run 'railway service <service-name>' to link a service",
		);
	}

	if (ERROR_PATTERNS.NO_PROJECTS.test(output)) {
		throw new Error(
			"No projects found. Run 'railway init' to create a new project",
		);
	}

	// Generic error handling
	if (err.code === "ENOENT") {
		throw new Error(
			"Railway CLI is not installed. Please install it first: https://docs.railway.com/guides/cli",
		);
	}

	// If we have a specific error message, use it
	if (err.message) {
		throw new Error(`Railway CLI error: ${err.message}`);
	}

	// Fallback error

	throw new Error(`Railway CLI command '${command}' failed with unknown error`);
};

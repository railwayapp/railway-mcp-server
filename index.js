#!/usr/bin/env node
import { spawn } from "node:child_process";

const child = spawn("railway", ["mcp", ...process.argv.slice(2)], {
	stdio: "inherit",
});

const printMissingCliMessage = () => {
	console.error(`@railway/mcp-server is deprecated.

Railway MCP is now bundled into the Railway CLI.

Install or upgrade the Railway CLI, then configure your MCP client with:
  railway mcp install

Or run the local stdio server directly with:
  railway mcp

Docs: https://docs.railway.com/cli/mcp`);
};

child.on("error", (error) => {
	if (error?.code === "ENOENT") {
		printMissingCliMessage();
	} else {
		console.error(`Failed to start Railway MCP via the Railway CLI: ${error.message}`);
	}

	process.exit(1);
});

child.on("exit", (code, signal) => {
	if (signal) {
		process.kill(process.pid, signal);
		return;
	}

	process.exit(code ?? 0);
});

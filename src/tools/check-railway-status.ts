import { checkRailwayCliStatus } from "../cli";
import { createToolResponse } from "../utils";

export const checkRailwayStatusTool = {
	name: "check-railway-status",
	title: "Check Railway CLI Status",
	description:
		"Check whether the Railway CLI is installed and if the user is logged in. This tool helps agents verify the Railway CLI setup before attempting to use other Railway tools.",
	inputSchema: {},
	handler: async () => {
		try {
			await checkRailwayCliStatus();
			return createToolResponse(
				"✅ Railway CLI Status Check Passed\n\n" +
					"• Railway CLI is installed and accessible\n" +
					"• User is authenticated and logged in\n\n" +
					"You can now use other Railway tools to manage your projects.",
			);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : "Unknown error occurred";
			return createToolResponse(
				"❌ Railway CLI Status Check Failed\n\n" +
					`**Error:** ${errorMessage}\n\n` +
					"**Next Steps:**\n" +
					"• If Railway CLI is not installed: Install it from https://docs.railway.com/guides/cli\n" +
					"• If not logged in: Run `railway login` to authenticate\n" +
					"• If token is expired: Run `railway login` to refresh your authentication",
			);
		}
	},
};

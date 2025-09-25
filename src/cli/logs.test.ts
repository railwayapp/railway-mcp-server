import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildLogCommand } from "./logs";

vi.mock("./version", () => ({
  getCliFeatureSupport: vi.fn(),
}));

describe("Railway Logs Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("buildLogCommand", () => {
    it("should build deployment command with lines and filter for v4.9.0+", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand(
        "deployment",
        undefined,
        undefined,
        undefined,
        100,
        "error"
      );

      expect(command).toBe(
        'railway logs --deployment --json --lines 100 --filter "error"'
      );
    });

    it("should build build command with lines and filter for v4.9.0+", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand(
        "build",
        undefined,
        undefined,
        undefined,
        200,
        "warning"
      );

      expect(command).toBe(
        'railway logs --build --json --lines 200 --filter "warning"'
      );
    });

    it("should default to 1000 lines when not specified for v4.9.0+", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand("deployment");

      expect(command).toBe("railway logs --deployment --json --lines 1000");
    });

    it("should not include lines/filter for older CLI versions", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        logs: {
          args: {
            lines: false,
            filter: false,
          },
        },
      });

      const command = await buildLogCommand(
        "deployment",
        undefined,
        undefined,
        undefined,
        100, // Should be ignored
        "error" // Should be ignored
      );

      expect(command).toBe("railway logs --deployment --json");
    });

    it("should include deploymentId when provided", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand("deployment", "deploy-123");

      expect(command).toBe(
        "railway logs --deployment --json --lines 100 deploy-123"
      );
    });

    it("should include service and environment when provided", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand(
        "deployment",
        undefined,
        "api",
        "production",
        50
      );

      expect(command).toBe(
        "railway logs --deployment --json --lines 50 --service api --environment production"
      );
    });

    it("should handle all parameters together", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand(
        "build",
        "deploy-456",
        "backend",
        "staging",
        75,
        "timeout"
      );

      expect(command).toBe(
        'railway logs --build --json --lines 75 --filter "timeout" deploy-456 --service backend --environment staging'
      );
    });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
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
        deployment: {
          list: true,
        },
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand({
        type: "deployment",
        lines: 100,
        filter: "error",
      });

      expect(command).toBe(
        'railway logs --deployment --lines 100 --filter "error"'
      );
    });

    it("should build build command with lines and filter for v4.9.0+", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        deployment: {
          list: true,
        },
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand({
        type: "build",
        lines: 200,
        filter: "warning",
      });

      expect(command).toBe(
        'railway logs --build --lines 200 --filter "warning"'
      );
    });

    it("should default to 500 lines when json is false", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        deployment: {
          list: true,
        },
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand({ type: "deployment" });

      expect(command).toBe("railway logs --deployment --lines 500");
    });

    it("should default to 100 lines when json is true", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        deployment: {
          list: true,
        },
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand({ type: "deployment", json: true });

      expect(command).toBe("railway logs --deployment --json --lines 100");
      expect(command).toBe("railway logs --deployment --json --lines 100");
    });

    it("should not include lines/filter for older CLI versions", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        deployment: {
          list: true,
        },
        logs: {
          args: {
            lines: false,
            filter: false,
          },
        },
      });

      const command = await buildLogCommand({
        type: "deployment",
        lines: 100, // Should be ignored
        filter: "error", // Should be ignored
      });

      expect(command).toBe("railway logs --deployment");
    });

    it("should include deploymentId when provided", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        deployment: {
          list: true,
        },
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand({
        type: "deployment",
        deploymentId: "deploy-123",
      });

      expect(command).toBe("railway logs --deployment --lines 500 deploy-123");
    });

    it("should include service and environment when provided", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        deployment: {
          list: true,
        },
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand({
        type: "deployment",
        service: "api",
        environment: "production",
        lines: 50,
      });

      expect(command).toBe(
        "railway logs --deployment --lines 50 --service api --environment production"
      );
    });

    it("should handle all parameters together", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        deployment: {
          list: true,
        },
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand({
        type: "build",
        deploymentId: "deploy-456",
        service: "backend",
        environment: "staging",
        lines: 75,
        filter: "timeout",
      });

      expect(command).toBe(
        'railway logs --build --lines 75 --filter "timeout" deploy-456 --service backend --environment staging'
      );
    });

    it("should not include --json flag when json is false", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        deployment: {
          list: true,
        },
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand({
        type: "deployment",
        lines: 100,
        json: false,
      });

      expect(command).toBe("railway logs --deployment --lines 100");
    });

    it("should not include --json flag when undefined", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        deployment: {
          list: true,
        },
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand({
        type: "deployment",
        lines: 100,
        json: false,
      });

      expect(command).toBe("railway logs --deployment --lines 100");
    });

    it("should include --json flag when true", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        deployment: {
          list: true,
        },
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand({
        type: "deployment",
        lines: 100,
        json: true,
      });

      expect(command).toBe("railway logs --deployment --json --lines 100");
    });

    it("should include --since when provided", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        deployment: {
          list: true,
        },
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand({
        type: "deployment",
        since: "2h",
      });

      expect(command).toBe("railway logs --deployment --lines 500 --since 2h");
    });

    it("should include --until when provided", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        deployment: {
          list: true,
        },
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand({
        type: "deployment",
        until: "1h",
      });

      expect(command).toBe(
        "railway logs --deployment --lines 500 --until 1h"
      );
    });

    it("should include both --since and --until for time window queries", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        deployment: {
          list: true,
        },
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand({
        type: "deployment",
        since: "2024-01-15T10:00:00Z",
        until: "2024-01-15T11:00:00Z",
        lines: 200,
        json: true,
      });

      expect(command).toBe(
        "railway logs --deployment --json --lines 200 --since 2024-01-15T10:00:00Z --until 2024-01-15T11:00:00Z"
      );
    });

    it("should include --since and --until with all other parameters", async () => {
      const { getCliFeatureSupport } = await import("./version");

      vi.mocked(getCliFeatureSupport).mockResolvedValue({
        deployment: {
          list: true,
        },
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });

      const command = await buildLogCommand({
        type: "deployment",
        service: "api",
        environment: "production",
        since: "1d",
        until: "12h",
        lines: 100,
        filter: "@level:error",
      });

      expect(command).toBe(
        'railway logs --deployment --lines 100 --filter "@level:error" --since 1d --until 12h --service api --environment production'
      );
    });
  });
});

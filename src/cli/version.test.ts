import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  compareVersions,
  getRailwayVersion,
  getCliFeatureSupport,
  clearVersionCache,
} from "./version";

// Mock the core module
vi.mock("./core", () => ({
  runRailwayCommand: vi.fn(),
}));

describe("Version Detection", () => {
  beforeEach(() => {
    clearVersionCache();
    vi.clearAllMocks();
  });

  describe("compareVersions (using semver)", () => {
    it("should correctly compare version strings", () => {
      expect(compareVersions("4.9.0", "4.9.0")).toBe(0);
      expect(compareVersions("4.10.0", "4.9.0")).toBe(1);
      expect(compareVersions("4.8.5", "4.9.0")).toBe(-1);
      expect(compareVersions("5.0.0", "4.9.0")).toBe(1);
      expect(compareVersions("4.9.1", "4.9.0")).toBe(1);
    });
  });

  describe("getRailwayVersion", () => {
    it("should parse 'railway 4.9.0' format", async () => {
      const { runRailwayCommand } = await import("./core");
      vi.mocked(runRailwayCommand).mockResolvedValueOnce({
        stdout: "railway 4.9.0",
        stderr: "",
        output: "railway 4.9.0",
      });

      const version = await getRailwayVersion();
      expect(version).toBe("4.9.0");
    });

    it("should parse 'railway version 4.9.0' format", async () => {
      const { runRailwayCommand } = await import("./core");
      vi.mocked(runRailwayCommand).mockResolvedValueOnce({
        stdout: "railway version 4.9.0",
        stderr: "",
        output: "railway version 4.9.0",
      });

      const version = await getRailwayVersion();
      expect(version).toBe("4.9.0");
    });

    it("should parse plain version format", async () => {
      const { runRailwayCommand } = await import("./core");
      vi.mocked(runRailwayCommand).mockResolvedValueOnce({
        stdout: "4.9.0",
        stderr: "",
        output: "4.9.0",
      });

      const version = await getRailwayVersion();
      expect(version).toBe("4.9.0");
    });

    it("should return null if unable to parse version", async () => {
      const { runRailwayCommand } = await import("./core");
      vi.mocked(runRailwayCommand).mockResolvedValueOnce({
        stdout: "invalid output",
        stderr: "",
        output: "invalid output",
      });

      const version = await getRailwayVersion();
      expect(version).toBe(null);
    });

    it("should return null if command fails", async () => {
      const { runRailwayCommand } = await import("./core");
      vi.mocked(runRailwayCommand).mockRejectedValueOnce(
        new Error("Command failed")
      );

      const version = await getRailwayVersion();
      expect(version).toBe(null);
    });

    it("should use cached version within cache duration", async () => {
      const { runRailwayCommand } = await import("./core");
      vi.mocked(runRailwayCommand).mockResolvedValue({
        stdout: "railway 4.9.0",
        stderr: "",
        output: "railway 4.9.0",
      });

      const version1 = await getRailwayVersion();
      expect(version1).toBe("4.9.0");
      expect(runRailwayCommand).toHaveBeenCalledTimes(1);

      const version2 = await getRailwayVersion();
      expect(version2).toBe("4.9.0");
      expect(runRailwayCommand).toHaveBeenCalledTimes(1);
    });
  });

  describe("getCliFeatureSupport", () => {
    it("should return features enabled for version 4.9.0 and above", async () => {
      const { runRailwayCommand } = await import("./core");

      vi.mocked(runRailwayCommand).mockResolvedValueOnce({
        stdout: "railway 4.8.9",
        stderr: "",
        output: "railway 4.8.9",
      });
      await expect(getCliFeatureSupport()).resolves.toMatchObject({
        logs: {
          args: {
            lines: false,
            filter: false,
          },
        },
      });

      clearVersionCache();
      vi.mocked(runRailwayCommand).mockResolvedValueOnce({
        stdout: "railway 4.9.0",
        stderr: "",
        output: "railway 4.9.0",
      });
      await expect(getCliFeatureSupport()).resolves.toMatchObject({
        logs: {
          args: {
            lines: true,
            filter: true,
          },
        },
      });
    });
  });
});

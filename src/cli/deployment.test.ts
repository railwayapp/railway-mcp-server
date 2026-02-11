import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as core from "./core";
import { listDeployments } from "./deployment";
import * as errorHandling from "./error-handling";
import type { RailwayProject } from "./projects";
import * as projects from "./projects";
import * as version from "./version";

// Mock the dependencies
vi.mock("./core");
vi.mock("./error-handling");
vi.mock("./projects");
vi.mock("./version");

describe("listDeployments", () => {
  const mockWorkspacePath = "/test/workspace";

  const mockProject: RailwayProject = {
    id: "test-project-id",
    name: "test-project",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    const mockOutput = "Deployment 1\nDeployment 2\nDeployment 3";
    vi.mocked(core.runRailwayCommand).mockResolvedValue({
      output: mockOutput,
      stderr: "",
      stdout: mockOutput,
    });
    vi.mocked(core.checkRailwayCliStatus).mockResolvedValue();
    vi.mocked(projects.getLinkedProjectInfo).mockResolvedValue({
      success: true,
      project: mockProject,
    });
    vi.mocked(version.getCliFeatureSupport).mockResolvedValue({
      logs: {
        args: {
          lines: true,
          filter: true,
        },
      },
      deployment: {
        list: true,
      },
    });
    vi.mocked(version.getRailwayVersion).mockResolvedValue("4.10.0");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("successful cases", () => {
    it("should list deployments with default options", async () => {
      const result = await listDeployments({
        workspacePath: mockWorkspacePath,
      });

      expect(result.success).toBe(true);
      expect(core.runRailwayCommand).toHaveBeenCalledWith(
        "railway deployment list --limit 20",
        mockWorkspacePath
      );
    });

    it("should list deployments with JSON output", async () => {
      const result = await listDeployments({
        workspacePath: mockWorkspacePath,
        json: true,
      });

      expect(result.success).toBe(true);
      expect(core.runRailwayCommand).toHaveBeenCalledWith(
        "railway deployment list --limit 20 --json",
        mockWorkspacePath
      );
    });

    it("should list deployments with service filter", async () => {
      const result = await listDeployments({
        workspacePath: mockWorkspacePath,
        service: "my-api-service",
      });

      expect(result.success).toBe(true);
      expect(core.runRailwayCommand).toHaveBeenCalledWith(
        'railway deployment list --service "my-api-service" --limit 20',
        mockWorkspacePath
      );
    });

    it("should list deployments with environment filter", async () => {
      const mockOutput = "Environment deployment output";
      vi.mocked(core.runRailwayCommand).mockResolvedValue({
        output: mockOutput,
        stderr: "",
        stdout: mockOutput,
      });

      const result = await listDeployments({
        workspacePath: mockWorkspacePath,
        environment: "staging",
      });

      expect(result.success).toBe(true);
      expect(core.runRailwayCommand).toHaveBeenCalledWith(
        'railway deployment list --environment "staging" --limit 20',
        mockWorkspacePath
      );
    });

    it("should list deployments with custom limit", async () => {
      const mockOutput = "Limited deployment output";
      vi.mocked(core.runRailwayCommand).mockResolvedValue({
        output: mockOutput,
        stderr: "",
        stdout: mockOutput,
      });

      const result = await listDeployments({
        workspacePath: mockWorkspacePath,
        limit: 50,
      });

      expect(result.success).toBe(true);
      expect(core.runRailwayCommand).toHaveBeenCalledWith(
        "railway deployment list --limit 50",
        mockWorkspacePath
      );
    });
  });

  it("should return error when CLI version does not support deployment list", async () => {
    vi.mocked(version.getCliFeatureSupport).mockResolvedValue({
      logs: {
        args: {
          lines: false,
          filter: false,
        },
      },
      deployment: {
        list: false,
      },
    });
    vi.mocked(version.getRailwayVersion).mockResolvedValue("4.9.0");

    const result = await listDeployments({
      workspacePath: mockWorkspacePath,
    });

    expect(result.success).toBe(false);
    if (result.success) {
      throw new Error("Expected error");
    }
    expect(result.error).toBe(
      "Railway CLI version 4.9.0 does not support 'deployment list' command. Please upgrade to version 4.10.0 or later."
    );
  });
});

import * as semver from "semver";
import { runRailwayCommand } from "./core";

let cachedVersion: string | null = null;
let versionCacheTime: number | null = null;
const VERSION_CACHE_DURATION = 5 * 60 * 1000;

/**
 * Get the Railway CLI version
 * @returns Version string (e.g., "4.9.0") or null if unable to determine
 */
export const getRailwayVersion = async (): Promise<string | null> => {
  // Use a cache to avoid constantly running railway --version.
  if (
    cachedVersion &&
    versionCacheTime &&
    Date.now() - versionCacheTime < VERSION_CACHE_DURATION
  ) {
    return cachedVersion;
  }

  try {
    const { stdout } = await runRailwayCommand("railway --version");
    // Use semver.coerce to extract a valid semver from various formats
    // This handles "railway 4.9.0", "railway version 4.9.0", "4.9.0", etc.
    const version = semver.coerce(stdout);
    if (version) {
      cachedVersion = version.version;
      versionCacheTime = Date.now();
      return cachedVersion;
    }
  } catch (error) {
    // Unable to determine version
  }

  return null;
};

/** Clear the cached version  */
export const clearVersionCache = (): void => {
  cachedVersion = null;
  versionCacheTime = null;
};

/**Force a fresh version check */
export const refreshRailwayVersion = async (): Promise<string | null> => {
  clearVersionCache();
  return getRailwayVersion();
};

/**
 * Compare version strings using semver
 * @returns 1 if version1 > version2, -1 if version1 < version2, 0 if equal
 */
export const compareVersions = (version1: string, version2: string): number => {
  return semver.compare(version1, version2);
};

export type CliFeatureSupport = {
  logs: {
    args: {
      lines: boolean;
      filter: boolean;
    };
  };
};

/** Get Railway CLI feature support based on version */
export const getCliFeatureSupport = async (): Promise<CliFeatureSupport> => {
  const version = await getRailwayVersion();

  const supportsLogFeatures = version ? semver.gte(version, "4.9.0") : false;

  return {
    logs: {
      args: {
        lines: supportsLogFeatures,
        filter: supportsLogFeatures,
      },
    },
  };
};

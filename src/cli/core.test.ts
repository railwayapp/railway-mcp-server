import { describe, expect, it } from "vitest";
import { getRailwayExecutable } from "./core";

describe("getRailwayExecutable", () => {
	it("uses the Windows command shim on win32", () => {
		expect(getRailwayExecutable("win32")).toBe("railway.cmd");
	});

	it("uses the bare railway executable on non-Windows platforms", () => {
		expect(getRailwayExecutable("darwin")).toBe("railway");
		expect(getRailwayExecutable("linux")).toBe("railway");
	});
});

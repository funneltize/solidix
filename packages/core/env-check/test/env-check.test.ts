import { describe, expect, test } from "vitest";
import { IS_DEVELOPMENT } from "@soldix/env-check/is-development";

describe("@soldix/env-check", () => {
  test("resolves the development constant from source", () => {
    expect(IS_DEVELOPMENT).toBe(true);
  });
});

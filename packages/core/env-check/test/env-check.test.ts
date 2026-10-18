import { describe, expect, test } from "vitest";
import { IS_DEVELOPMENT } from "@solidix/env-check/is-development";

describe("@solidix/env-check", () => {
  test("resolves the development constant from source", () => {
    expect(IS_DEVELOPMENT).toBe(true);
  });
});

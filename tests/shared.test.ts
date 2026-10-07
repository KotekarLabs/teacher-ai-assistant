import { expect, test } from "vitest";
import { IS_SHARED } from "../packages/shared/index";

test("shared package", () => {
  expect(IS_SHARED).toBe(true);
});

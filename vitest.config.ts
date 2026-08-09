import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      AUDIT_HMAC_SECRET: "test-secret-for-vitest-only",
    },
  },
});
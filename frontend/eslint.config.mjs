import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

export default defineConfig([
  ...nextVitals,
  {
    // The existing UI predates React Compiler lint rules. Keep security and
    // correctness rules active while those broad refactors are migrated
    // incrementally instead of making lint permanently unusable.
    rules: {
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",
    },
  },
  globalIgnores([".next/**", "out/**", "build/**"]),
]);

import type { Plugin } from "@abap/ui5-blueprint-audit-types";
import en from "./en.js";
import de from "./de.js";
import ptBR from "./pt-BR.js";

/**
 * The report/CLI/error labels of the engine package itself, packaged as a pseudo-plugin
 * with no rules, so they go through the same `buildLocaleRegistry()` merge as every
 * other plugin's locale bundles (see @abap/ui5-blueprint-audit-types).
 */
export const cliLocalesPlugin: Plugin = {
  name: "__cli__",
  apiVersion: "1",
  rules: {},
  locales: { en, de, "pt-BR": ptBR },
};

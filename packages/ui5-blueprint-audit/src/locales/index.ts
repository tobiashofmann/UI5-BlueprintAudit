import type { Plugin } from "@abap/ui5-blueprint-audit-types";
import en from "./en.js";
import de from "./de.js";
import ptBR from "./pt-BR.js";

/**
 * Die Reporter-/CLI-/Fehler-Labels des Engine-Pakets selbst, verpackt als Pseudo-Plugin
 * ohne Regeln, damit sie über denselben buildLocaleRegistry()-Merge laufen wie alle
 * anderen Plugin-Bundles (siehe @abap/ui5-blueprint-audit-types).
 */
export const cliLocalesPlugin: Plugin = {
  name: "__cli__",
  apiVersion: "1",
  rules: {},
  locales: { en, de, "pt-BR": ptBR },
};

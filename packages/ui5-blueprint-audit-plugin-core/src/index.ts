import type { Plugin } from "@abap/ui5-blueprint-audit-types";
import { typescriptRule } from "./rules/typescript.js";
import { xmlViewsRule } from "./rules/xml-views.js";
import { controllerMatchesViewRule } from "./rules/controller-matches-view.js";
import { folderStructureRule } from "./rules/folder-structure.js";
import { noCustomControlsRule } from "./rules/no-custom-controls.js";
import { odataServiceRule } from "./rules/odata-service.js";
import { odataMetadataLocalRule } from "./rules/odata-metadata-local.js";
import { odataMockdataRule } from "./rules/odata-mockdata.js";
import { nonOdataJsonRule } from "./rules/non-odata-json.js";
import { noCustomCssRule } from "./rules/no-custom-css.js";
import { themeRule } from "./rules/theme.js";
import { cacheBusterRule } from "./rules/cache-buster.js";
import { namespaceRule } from "./rules/namespace.js";
import { consistentNamespaceRule } from "./rules/consistent-namespace.js";
import { fragmentsFolderRule } from "./rules/fragments-folder.js";
import { dialogsFolderRule } from "./rules/dialogs-folder.js";
import { i18nUsedRule } from "./rules/i18n-used.js";
import { i18nLanguagesRule } from "./rules/i18n-languages.js";
import { i18nFallbackRule } from "./rules/i18n-fallback.js";
import { deviceTypesRule } from "./rules/device-types.js";
import { flexEnabledRule } from "./rules/flex-enabled.js";
import { contentDensitiesRule } from "./rules/content-densities.js";
import { mockserverConfigRule } from "./rules/mockserver-config.js";
import { frameworkRule } from "./rules/framework.js";
import { ui5VersionRule } from "./rules/ui5-version.js";
import { flpConfigRule } from "./rules/flp-config.js";
import { deployConfigRule } from "./rules/deploy-config.js";
import { appTitleDescriptionRule } from "./rules/app-title-description.js";
import { qunitOpaTestsRule } from "./rules/qunit-opa-tests.js";
import { wdi5TestsRule } from "./rules/wdi5-tests.js";
import { playwrightTestsRule } from "./rules/playwright-tests.js";
import { appIconsRule } from "./rules/app-icons.js";
import { appVersionRule } from "./rules/app-version.js";
import { locales } from "./locales/index.js";

/**
 * The core plugin with the 33 default rules from docs/ui5-blueprint-audit-rules.md.
 * Rule IDs here have no prefix (see CLAUDE.md, "Plugins" section).
 */
const corePlugin: Plugin = {
  name: "core",
  apiVersion: "1",
  rules: {
    typescript: typescriptRule,
    "xml-views": xmlViewsRule,
    "controller-matches-view": controllerMatchesViewRule,
    "folder-structure": folderStructureRule,
    "no-custom-controls": noCustomControlsRule,
    "odata-service": odataServiceRule,
    "odata-metadata-local": odataMetadataLocalRule,
    "odata-mockdata": odataMockdataRule,
    "non-odata-json": nonOdataJsonRule,
    "no-custom-css": noCustomCssRule,
    theme: themeRule,
    "cache-buster": cacheBusterRule,
    namespace: namespaceRule,
    "consistent-namespace": consistentNamespaceRule,
    "fragments-folder": fragmentsFolderRule,
    "dialogs-folder": dialogsFolderRule,
    "i18n-used": i18nUsedRule,
    "i18n-languages": i18nLanguagesRule,
    "i18n-fallback": i18nFallbackRule,
    "device-types": deviceTypesRule,
    "flex-enabled": flexEnabledRule,
    "content-densities": contentDensitiesRule,
    "mockserver-config": mockserverConfigRule,
    framework: frameworkRule,
    "ui5-version": ui5VersionRule,
    "flp-config": flpConfigRule,
    "deploy-config": deployConfigRule,
    "app-title-description": appTitleDescriptionRule,
    "qunit-opa-tests": qunitOpaTestsRule,
    "wdi5-tests": wdi5TestsRule,
    "playwright-tests": playwrightTestsRule,
    "app-icons": appIconsRule,
    "app-version": appVersionRule,
  },
  locales,
};

export default corePlugin;

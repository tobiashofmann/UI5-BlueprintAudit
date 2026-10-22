/**
 * English reference bundle for the core plugin's rule descriptions and messages.
 * Source of truth for key names — de.ts/pt-BR.ts are typed against `keyof typeof en`.
 */
const en = {
  "typescript.description": "The project uses TypeScript.",
  "typescript.missingTsconfig": "Missing tsconfig.json in the project root.",
  "typescript.jsInsteadOfTs": "JavaScript file instead of TypeScript: {file}",

  "xml-views.description": "Views are implemented as XML views.",
  "xml-views.nonXmlView": "Non-XML view found: {file}",
  "xml-views.forbiddenUsage": "Use of sap.ui.jsview/htmlview/jsonview in {file}",

  "controller-matches-view.description": "Every XML view's controller name matches the view's own file name, and that controller file exists.",
  "controller-matches-view.nameMismatch":
    'View "{viewFile}" should reference a controller named "{viewBaseName}", but references "{controllerName}" (expected base name "{viewBaseName}", got "{controllerBaseName}").',
  "controller-matches-view.missingController":
    'View "{viewFile}" references controller "{controllerName}", for which no file "{expectedBaseName}.controller.ts" exists.',

  "folder-structure.description": "The minimum folder structure is present.",
  "folder-structure.missingFolder": "Required folder missing: {folderPath}",
  "folder-structure.viewWrongPath": "View is not located under {viewPath}: {file}",
  "folder-structure.controllerWrongPath": "Controller is not located under {controllerPath}: {file}",

  "no-custom-controls.description": "The project does not define its own UI5 controls.",
  "no-custom-controls.customControl": 'Custom control "{name}" in {file}',

  "odata-service.description": "The number of OData services used is within the expected range.",
  "odata-service.belowMin": "Only {count} OData service(s) found, at least {min} expected.",
  "odata-service.aboveMax": "{count} OData service(s) found, at most {max} allowed.",

  "odata-metadata-local.description": "The OData metadata document is available locally.",
  "odata-metadata-local.missingLocalUri": 'OData dataSource "{name}" has no settings.localUri.',
  "odata-metadata-local.missingFile": "Local metadata file missing: {filePath}",
  "odata-metadata-local.wrongPath": "Metadata file is not located under {basePath}: {filePath}",

  "odata-mockdata.description": "Mock data for the OData service is available.",
  "odata-mockdata.noneAny": "No mock data file under {dataPath}.",
  "odata-mockdata.missingAllEntities": "Mock data missing for EntitySets: {entities}",
  "odata-mockdata.noneOneEntity": "No mock data for at least one EntitySet under {dataPath}.",

  "non-odata-json.description": "Non-OData services are implemented as a JSONModel.",
  "non-odata-json.wrongType": 'Non-OData dataSource "{name}" has type "{type}" instead of "JSON".',
  "non-odata-json.wrongModel": 'Model for dataSource "{name}" is not a JSONModel.',

  "no-custom-css.description": "The project does not contain its own CSS.",
  "no-custom-css.cssFile": "Custom CSS file: {file}",
  "no-custom-css.resourcesNotEmpty": "sap.ui5/resources/css in the manifest is not empty.",

  "theme.description": "The theme is prescribed and configured consistently.",
  "theme.conflict": 'Theme in index.html ("{htmlTheme}") and ui5.yaml ("{yamlTheme}") contradict each other.',
  "theme.notDetected": "Could not determine a theme (neither index.html nor ui5.yaml).",
  "theme.notAllowed": 'Theme "{theme}" is not allowed (allowed: {allowed}).',

  "cache-buster.description": "The app uses the cache buster.",
  "cache-buster.missing":
    "No cache buster task/middleware configured in ui5.yaml, and index.html does not load UI5 via a versioned cache buster URL.",

  "namespace.description": "The app uses the prescribed namespace.",
  "namespace.wrongPrefix": '{label} ("{id}") does not start with "{expected}".',

  "consistent-namespace.description": "All artifacts of the app use the same namespace.",
  "consistent-namespace.rootView":
    'sap.ui5/rootView/viewName ("{rootViewName}") does not use the namespace "{baseNamespace}".',
  "consistent-namespace.controllerName":
    'controllerName "{controllerName}" in {file} does not use the namespace "{baseNamespace}".',

  "fragments-folder.description": "XML fragments that are not dialogs are located in the fragments folder.",
  "fragments-folder.wrongPath": "Fragment is not located under {basePath}: {file}",

  "dialogs-folder.description": "Fragments with a dialog as the root element are located in the dialogs folder.",
  "dialogs-folder.wrongPath": "Dialog fragment is not located under {basePath}: {file}",

  "i18n-used.description": "i18n is used.",
  "i18n-used.noModel": "No i18n model (sap.ui.model.resource.ResourceModel) configured in the manifest.",
  "i18n-used.missingBaseFile": "Base file missing: {basePath}/{prefix}.properties",

  "i18n-languages.description": "The app supports the languages prescribed by the company.",
  "i18n-languages.missingSupportedLocale": '{source}: language "{lang}" is missing from supportedLocales.',
  "i18n-languages.missingFile": "Missing {basePath}/{prefix}_{lang}.properties.",
  "i18n-languages.extraLanguage": '{source}: language "{lang}" is not part of the requirement (strict).',

  "i18n-fallback.description": "A default language is set.",
  "i18n-fallback.wrongFallback": '{source}: fallbackLocale is "{fallbackLocale}", expected "{expected}".',
  "i18n-fallback.notInSupported": '{source}: fallbackLocale "{expected}" is not included in supportedLocales.',

  "device-types.description": "The supported device types are defined.",
  "device-types.wrongValue": "sap.ui/deviceTypes/{key} is not {expected}.",

  "flex-enabled.description": "flexEnabled has the prescribed value.",
  "flex-enabled.wrongValue": 'sap.ui5/flexEnabled is "{actual}", expected "{expected}".',

  "content-densities.description": "The content densities have the prescribed values.",
  "content-densities.wrongValue": "sap.ui5/contentDensities/{key} is not {expected}.",

  "mockserver-config.description": "A mock server configuration is present.",
  "mockserver-config.missing": "Missing {fileName} in the project root.",

  "framework.description": "The framework used is prescribed.",
  "framework.wrongValue": 'framework.name in ui5.yaml is "{actual}", expected "{expected}".',

  "ui5-version.description": "The UI5 version meets the requirement.",
  "ui5-version.notSet": "{label} is not set.",
  "ui5-version.belowMin": '{label} ("{version}") is below the minimum version "{min}".',
  "ui5-version.aboveMax": '{label} ("{version}") exceeds the maximum version "{max}".',
  "ui5-version.inconsistent":
    'minUI5Version ("{manifestVersion}") and framework.version ("{yamlVersion}") are not consistent (major.minor).',

  "flp-config.description": "The app has a Fiori Launchpad configuration for at least one tile.",
  "flp-config.missing": "sap.app/crossNavigation/inbounds has no entry with semanticObject and action.",

  "deploy-config.description": "A deployment configuration with a configured backend is present.",
  "deploy-config.missingFile": "Missing {fileName} in the project root.",
  "deploy-config.noBackend": "{fileName} contains no deploy task with configuration.target.destination or .url.",

  "app-title-description.description": "The app has a title and a description with actual text.",
  "app-title-description.noI18nRef": '{label} does not reference i18n ("{{...}}").',
  "app-title-description.emptyValue": 'i18n key "{key}" for {label} is empty or missing.',

  "qunit-opa-tests.description": "The project has unit or integration tests with QUnit or OPA5.",
  "qunit-opa-tests.missing": "No QUnit or OPA5 tests found under {basePath}.",

  "wdi5-tests.description": "The project uses wdio-ui5 (wdi5) for end-to-end tests.",
  "wdi5-tests.missingConfig": "Missing {configFile} (or .ts) in the project root.",
  "wdi5-tests.missingDependency": "wdio-ui5-service is not a dependency in package.json.",

  "playwright-tests.description": "The project uses Playwright for end-to-end tests.",
  "playwright-tests.missingConfig": "Missing {configFile} (or .js) in the project root.",
  "playwright-tests.missingDependency": "@playwright/test is not a dependency in package.json.",

  "app-icons.description": "The app has its own icons instead of the generator placeholders.",
  "app-icons.notSet": "sap.ui/icons/{field} is not set.",

  "app-version.description": "The app version has been maintained and is not the generator default.",
  "app-version.stillDefault": '{label} is still the default "{defaultValue}".',
} as const;

export default en;

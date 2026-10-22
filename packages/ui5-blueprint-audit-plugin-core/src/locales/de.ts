import type en from "./en.js";

const de: Record<keyof typeof en, string> = {
  "typescript.description": "Das Projekt verwendet TypeScript.",
  "typescript.missingTsconfig": "Es fehlt eine tsconfig.json im Projektroot.",
  "typescript.jsInsteadOfTs": "JavaScript-Datei statt TypeScript: {file}",

  "xml-views.description": "Views sind als XML Views implementiert.",
  "xml-views.nonXmlView": "Nicht-XML-View gefunden: {file}",
  "xml-views.forbiddenUsage": "Verwendung von sap.ui.jsview/htmlview/jsonview in {file}",

  "controller-matches-view.description": "Der Controller-Name jeder XML View entspricht dem Dateinamen der View, und diese Controller-Datei existiert.",
  "controller-matches-view.nameMismatch":
    'View "{viewFile}" sollte einen Controller namens "{viewBaseName}" referenzieren, referenziert aber "{controllerName}" (erwarteter Basisname "{viewBaseName}", tatsächlich "{controllerBaseName}").',
  "controller-matches-view.missingController":
    'View "{viewFile}" referenziert Controller "{controllerName}", für den keine Datei "{expectedBaseName}.controller.ts" existiert.',

  "folder-structure.description": "Die Mindest-Ordnerstruktur ist vorhanden.",
  "folder-structure.missingFolder": "Pflichtordner fehlt: {folderPath}",
  "folder-structure.viewWrongPath": "View liegt nicht unter {viewPath}: {file}",
  "folder-structure.controllerWrongPath": "Controller liegt nicht unter {controllerPath}: {file}",

  "no-custom-controls.description": "Das Projekt definiert keine eigenen UI5 Controls.",
  "no-custom-controls.customControl": 'Eigenes Control "{name}" in {file}',

  "odata-service.description": "Anzahl der verwendeten OData Services liegt im erwarteten Bereich.",
  "odata-service.belowMin": "Nur {count} OData-Service(s) gefunden, mindestens {min} erwartet.",
  "odata-service.aboveMax": "{count} OData-Service(s) gefunden, höchstens {max} erlaubt.",

  "odata-metadata-local.description": "Das OData-Metadaten-Dokument liegt lokal vor.",
  "odata-metadata-local.missingLocalUri": 'OData-dataSource "{name}" hat kein settings.localUri.',
  "odata-metadata-local.missingFile": "Lokale Metadaten-Datei fehlt: {filePath}",
  "odata-metadata-local.wrongPath": "Metadaten-Datei liegt nicht unter {basePath}: {filePath}",

  "odata-mockdata.description": "Mockdaten für den OData Service sind vorhanden.",
  "odata-mockdata.noneAny": "Keine Mockdaten-Datei unter {dataPath}.",
  "odata-mockdata.missingAllEntities": "Mockdaten fehlen für EntitySets: {entities}",
  "odata-mockdata.noneOneEntity": "Keine Mockdaten für mindestens ein EntitySet unter {dataPath}.",

  "non-odata-json.description": "Nicht-OData-Services werden als JSONModel realisiert.",
  "non-odata-json.wrongType": 'Nicht-OData-dataSource "{name}" hat type "{type}" statt "JSON".',
  "non-odata-json.wrongModel": 'Model für dataSource "{name}" ist kein JSONModel.',

  "no-custom-css.description": "Das Projekt enthält kein eigenes CSS.",
  "no-custom-css.cssFile": "Eigene CSS-Datei: {file}",
  "no-custom-css.resourcesNotEmpty": "sap.ui5/resources/css im Manifest ist nicht leer.",

  "theme.description": "Das Theme ist vorgegeben und konsistent konfiguriert.",
  "theme.conflict": 'Theme in index.html ("{htmlTheme}") und ui5.yaml ("{yamlTheme}") widersprechen sich.',
  "theme.notDetected": "Es konnte kein Theme ermittelt werden (weder index.html noch ui5.yaml).",
  "theme.notAllowed": 'Theme "{theme}" ist nicht erlaubt (erlaubt: {allowed}).',

  "cache-buster.description": "Die App verwendet den Cache Buster.",
  "cache-buster.missing":
    "Kein Cachebuster-Task/-Middleware in ui5.yaml konfiguriert und index.html bindet UI5 nicht über eine versionierte Cachebuster-URL ein.",

  "namespace.description": "Die App verwendet den vorgegebenen Namensraum.",
  "namespace.wrongPrefix": '{label} ("{id}") beginnt nicht mit "{expected}".',

  "consistent-namespace.description": "Alle Artefakte der App verwenden denselben Namensraum.",
  "consistent-namespace.rootView":
    'sap.ui5/rootView/viewName ("{rootViewName}") verwendet nicht den Namensraum "{baseNamespace}".',
  "consistent-namespace.controllerName":
    'controllerName "{controllerName}" in {file} verwendet nicht den Namensraum "{baseNamespace}".',

  "fragments-folder.description": "XML Fragmente, die keine Dialoge sind, liegen im Fragments-Ordner.",
  "fragments-folder.wrongPath": "Fragment liegt nicht unter {basePath}: {file}",

  "dialogs-folder.description": "Fragmente mit einem Dialog als Wurzelelement liegen im Dialogs-Ordner.",
  "dialogs-folder.wrongPath": "Dialog-Fragment liegt nicht unter {basePath}: {file}",

  "i18n-used.description": "i18n wird verwendet.",
  "i18n-used.noModel": "Kein i18n-Model (sap.ui.model.resource.ResourceModel) im Manifest konfiguriert.",
  "i18n-used.missingBaseFile": "Basisdatei fehlt: {basePath}/{prefix}.properties",

  "i18n-languages.description": "Die App unterstützt die vom Unternehmen vorgegebenen Sprachen.",
  "i18n-languages.missingSupportedLocale": '{source}: Sprache "{lang}" fehlt in supportedLocales.',
  "i18n-languages.missingFile": "Es fehlt {basePath}/{prefix}_{lang}.properties.",
  "i18n-languages.extraLanguage": '{source}: Sprache "{lang}" ist nicht in der Vorgabe enthalten (strict).',

  "i18n-fallback.description": "Eine Default-Sprache ist festgelegt.",
  "i18n-fallback.wrongFallback": '{source}: fallbackLocale ist "{fallbackLocale}", erwartet "{expected}".',
  "i18n-fallback.notInSupported": '{source}: fallbackLocale "{expected}" ist nicht in supportedLocales enthalten.',

  "device-types.description": "Die unterstützten Device Types sind festgelegt.",
  "device-types.wrongValue": "sap.ui/deviceTypes/{key} ist nicht {expected}.",

  "flex-enabled.description": "flexEnabled hat den vorgegebenen Wert.",
  "flex-enabled.wrongValue": 'sap.ui5/flexEnabled ist "{actual}", erwartet "{expected}".',

  "content-densities.description": "Die Content Densities haben die vorgegebenen Werte.",
  "content-densities.wrongValue": "sap.ui5/contentDensities/{key} ist nicht {expected}.",

  "mockserver-config.description": "Eine MockServer-Konfiguration ist vorhanden.",
  "mockserver-config.missing": "Es fehlt eine {fileName} im Projektroot.",

  "framework.description": "Das verwendete Framework ist vorgegeben.",
  "framework.wrongValue": 'framework.name in ui5.yaml ist "{actual}", erwartet "{expected}".',

  "ui5-version.description": "Die UI5-Version erfüllt die Vorgabe.",
  "ui5-version.notSet": "{label} ist nicht gesetzt.",
  "ui5-version.belowMin": '{label} ("{version}") ist kleiner als die Mindestversion "{min}".',
  "ui5-version.aboveMax": '{label} ("{version}") überschreitet die Höchstversion "{max}".',
  "ui5-version.inconsistent":
    'minUI5Version ("{manifestVersion}") und framework.version ("{yamlVersion}") sind nicht konsistent (major.minor).',

  "flp-config.description": "Die App hat eine Fiori-Launchpad-Konfiguration für mindestens eine Kachel.",
  "flp-config.missing": "sap.app/crossNavigation/inbounds hat keinen Eintrag mit semanticObject und action.",

  "deploy-config.description": "Eine Deployment-Konfiguration mit eingerichtetem Backend ist vorhanden.",
  "deploy-config.missingFile": "Es fehlt eine {fileName} im Projektroot.",
  "deploy-config.noBackend": "{fileName} enthält keinen Deploy-Task mit configuration.target.destination oder .url.",

  "app-title-description.description": "Die App hat einen Titel und eine Beschreibung mit tatsächlichem Text.",
  "app-title-description.noI18nRef": '{label} referenziert kein i18n ("{{...}}").',
  "app-title-description.emptyValue": 'i18n-Schlüssel "{key}" für {label} ist leer oder fehlt.',

  "qunit-opa-tests.description": "Das Projekt hat Unit- oder Integrationstests mit QUnit oder OPA5.",
  "qunit-opa-tests.missing": "Keine QUnit- oder OPA5-Tests unter {basePath} gefunden.",

  "wdi5-tests.description": "Das Projekt nutzt wdio-ui5 (wdi5) für End-to-End-Tests.",
  "wdi5-tests.missingConfig": "Es fehlt eine {configFile} (oder .ts) im Projektroot.",
  "wdi5-tests.missingDependency": "wdio-ui5-service ist keine Abhängigkeit in package.json.",

  "playwright-tests.description": "Das Projekt nutzt Playwright für End-to-End-Tests.",
  "playwright-tests.missingConfig": "Es fehlt eine {configFile} (oder .js) im Projektroot.",
  "playwright-tests.missingDependency": "@playwright/test ist keine Abhängigkeit in package.json.",

  "app-icons.description": "Die App hat eigene Icons statt der Generator-Platzhalter.",
  "app-icons.notSet": "sap.ui/icons/{field} ist nicht gesetzt.",

  "app-version.description": "Die App-Version wurde gepflegt und ist nicht der Generator-Default.",
  "app-version.stillDefault": '{label} ist noch der Default "{defaultValue}".',
};

export default de;

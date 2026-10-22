# Regelkatalog: UI5 BlueprintAudit

Stand: 2026-10-16 (Entwurf)

Dieser Katalog beschreibt alle Regeln des Unternehmens-Linters für UI5-Projekte. Jede Regel hat eine feste ID, einen Default-Status und optionale Parameter. Die Defaults können pro Projekt in der Konfigurationsdatei (`ui5-blueprint-audit.yaml`) überschrieben werden. Regeln können dort ein- oder ausgeschaltet werden.

## Konventionen

- **Severity:** `off`, `warn`, `error`
- **Projekttypen:** `freestyle` (FS), `fiori-elements` (FE), `library` (LIB). Eine Regel wird nur auf Projekte der angegebenen Typen angewendet.
- **Projekttyp-Angabe:** Der Anwender gibt den Typ beim Start des Tools an, er wird nicht automatisch erkannt. Beispiel: `ui5-blueprint-audit --type fs`, `--type fe` oder `--type lib`. Alternativ kann er in der Konfigurationsdatei als `projectType` stehen. Die Angabe auf der Kommandozeile hat Vorrang. Fehlt der Typ, bricht das Tool mit einer Fehlermeldung ab.
- **Namespacing:** Regeln des Kern-Plugins haben keinen Präfix. Regeln aus Plugins haben den Präfix `<plugin>/<regel>`.
- **Versionsangaben** werden immer als String konfiguriert (`"1.152"`) und semantisch verglichen.
- **Quellen der Prüfung:** `manifest.json`, `ui5.yaml`, `ui5-*.yaml`, `index.html`, Dateibaum unter `webapp`, XML Views und Fragmente.

## Übersicht

| # | ID | Kategorie | Default | Projekttypen |
|---|---|---|---|---|
| 1 | `typescript` | Technologie | error | FS, LIB |
| 2 | `xml-views` | Technologie | error | FS, FE, LIB (nur mit UI5 Controls) |
| 3 | `controller-matches-view` | Struktur | error | FS |
| 4 | `folder-structure` | Struktur | error | FS |
| 5 | `no-custom-controls` | Technologie | error | FS, FE |
| 6 | `odata-service` | Daten | error | FS, FE |
| 7 | `odata-metadata-local` | Daten | error | FS, FE |
| 8 | `odata-mockdata` | Daten | off | FS, FE |
| 9 | `non-odata-json` | Daten | error | FS |
| 10 | `no-custom-css` | Technologie | error | FS, FE |
| 11 | `theme` | Konfiguration | error | FS |
| 12 | `cache-buster` | Konfiguration | error | FS |
| 13 | `namespace` | Namensraum | error | FS, FE, LIB |
| 14 | `consistent-namespace` | Namensraum | error | FS, FE, LIB |
| 15 | `fragments-folder` | Struktur | error | FS |
| 16 | `dialogs-folder` | Struktur | error | FS |
| 17 | `i18n-used` | i18n | error | FS, FE, LIB |
| 18 | `i18n-languages` | i18n | error | FS, FE, LIB |
| 19 | `i18n-fallback` | i18n | warn | FS, FE |
| 20 | `device-types` | Konfiguration | error | FS, FE |
| 21 | `flex-enabled` | Konfiguration | warn | FS, FE |
| 22 | `content-densities` | Konfiguration | error | FS, FE |
| 23 | `mockserver-config` | Daten | warn | FS, FE |
| 24 | `framework` | Konfiguration | error | FS, FE, LIB |
| 25 | `ui5-version` | Konfiguration | error | FS, FE, LIB |
| 26 | `flp-config` | Konfiguration | error | FS, FE |
| 27 | `deploy-config` | Konfiguration | error | FS, FE |
| 28 | `app-title-description` | Konfiguration | error | FS, FE |
| 29 | `qunit-opa-tests` | Tests | warn | FS, FE, LIB |
| 30 | `wdi5-tests` | Tests | warn | FS |
| 31 | `playwright-tests` | Tests | warn | FS, FE |
| 32 | `app-icons` | Konfiguration | warn | FS, FE |
| 33 | `app-version` | Konfiguration | warn | FS, FE, LIB |

---

## Technologie

### 1. `typescript`

**Beschreibung:** Das Projekt verwendet TypeScript.

**Prüfung:**
- `tsconfig.json` existiert im Projektroot.
- Unter `webapp` liegen keine `.js`-Dateien für Controller, Komponenten oder Module, sondern `.ts`-Dateien.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `allowJs` | `[]` | Glob-Muster für `.js`-Dateien, die erlaubt sind (z. B. Polyfills) |

### 2. `xml-views`

**Beschreibung:** Views sind als XML Views implementiert.

**Prüfung:** Es gibt keine Dateien mit den Endungen `.view.js`, `.view.json`, `.view.html` oder `.view.ts` und keine `sap.ui.jsview`-, `sap.ui.htmlview`- oder `sap.ui.jsonview`-Nutzung.

**Projekttypen:** Gilt für Freestyle-Apps, Fiori-Elements-Apps und Libraries. Bei Libraries wird die Regel nur angewendet, wenn die Library UI5 Controls enthält (Klassen, die `Control` erweitern); sonst wird sie übersprungen.

**Parameter:** keine

### 5. `no-custom-controls`

**Beschreibung:** Das Projekt definiert keine eigenen UI5 Controls. Standardmäßig eingeschaltet, kann pro Projekt ausgeschaltet werden.

**Prüfung:** Keine Klasse im Projekt erweitert `sap/ui/core/Control`, `sap/ui/core/Element` oder ein anderes Control (`extends Control`, `Control.extend(...)`). Erfordert AST-Analyse.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `allow` | `[]` | Namen von Klassen, die erlaubt sind |

### 10. `no-custom-css`

**Beschreibung:** Das Projekt enthält kein eigenes CSS.

**Prüfung:**
- Es gibt keine `.css`-Dateien unter `webapp`.
- `sap.ui5/resources/css` im Manifest ist leer oder fehlt.
- Inline-Styles (`style=` in XML) werden **nicht** geprüft und bleiben erlaubt.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `allow` | `[]` | Glob-Muster für erlaubte CSS-Dateien |

---

## Struktur

### 3. `controller-matches-view`

**Beschreibung:** Jede XML View mit Controller verweist auf einen Controller, dessen Name dem
Dateinamen der View entspricht, und dieser Controller existiert als Datei.

**Prüfung:** Für jede View mit `controllerName`:
- Massgeblich ist der Name der View selbst (nicht der Controller): `Home.view.xml` muss auf
  einen Controller `....Home` verweisen, z. B. nicht auf `....App` — auch wenn `App.controller.ts`
  zufällig existiert.
- Stimmt der Name überein, muss die zugehörige Controller-Datei (`Home.controller.ts`/`.js`)
  tatsächlich existieren.
- Views ohne `controllerName` werden nicht beanstandet.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `caseSensitive` | `false` | Groß-/Kleinschreibung beim Vergleich beachten |

### 4. `folder-structure`

**Beschreibung:** Die Mindest-Ordnerstruktur ist vorhanden, und XML Views und Controller liegen in den vorgesehenen Ordnern.

**Prüfung:**
- `webapp/controller`, `webapp/view` und `webapp/model` existieren.
- `*.view.xml` liegen unter `webapp/view`, `*.controller.ts` unter `webapp/controller`.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `folders` | `controller`, `view`, `model` | Pflichtordner unterhalb von `webapp` |
| `viewPath` | `webapp/view` | Ort der Views |
| `controllerPath` | `webapp/controller` | Ort der Controller |

### 15. `fragments-folder`

**Beschreibung:** XML Fragmente, die keine Dialoge sind, liegen in einem Ordner `fragments`.

**Prüfung:** Jede `*.fragment.xml`, deren Wurzelelement kein Dialog ist (siehe `dialogs-folder`), liegt unter `basePath`.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `basePath` | `webapp/view/fragments` | Ordner für Fragmente |

### 16. `dialogs-folder`

**Beschreibung:** Fragmente mit einem Dialog als Wurzelelement liegen in einem Ordner `dialogs`, getrennt von normalen Fragmenten.

**Prüfung:** Jede `*.fragment.xml`, deren Wurzelelement in `dialogRoots` steht, liegt unter `basePath`.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `dialogRoots` | `Dialog`, `Popover` | Wurzelelemente, die als Dialog gelten |
| `basePath` | `webapp/view/dialogs` | Ordner für Dialoge |

---

## Daten

**Besonderheit FLP-Plugins:** Ist `sap.app/type` im Manifest `"component"` (statt
`"application"`), überspringen sich alle vier Regeln dieses Abschnitts (`odata-service`,
`odata-metadata-local`, `odata-mockdata`, `non-odata-json`) automatisch. Ein Fiori-
Launchpad-Plugin klinkt sich nur in die Shell ein und hat konstruktionsbedingt keinen
eigenen Backend-Service — anders als bei der Projekttyp-Erkennung (`fs`/`fe`/`lib`, siehe
Abschnitt "Projekttyp" in `CLAUDE.md`) ist das hier kein Fall von Auto-Erkennung des
*Projekttyps*, sondern eine zusätzliche, rein manifestbasierte Bedingung innerhalb des
Typs `fs`/`fe`.

### 6. `odata-service`

**Beschreibung:** Anzahl der verwendeten OData Services. Deckt auch die Vorgabe zur Anzahl mehrerer Services ab.

**Prüfung:** Gezählt werden alle `dataSources` in `sap.app` mit `type: OData`, die in `sap.ui5/models` einem Model zugeordnet sind. Die Anzahl muss zwischen `min` und `max` liegen.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `min` | `1` | Mindestanzahl |
| `max` | keine Grenze | Höchstanzahl |

### 7. `odata-metadata-local`

**Beschreibung:** Das OData-Metadaten-Dokument liegt lokal im Verzeichnis `localService`.

**Prüfung:** Jede OData-`dataSource` hat ein `settings.localUri`, und die dort angegebene `metadata.xml` existiert.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `basePath` | `webapp/localService` | Ort der lokalen Service-Dateien |

### 8. `odata-mockdata`

**Beschreibung:** Mockdaten für den OData Service sind vorhanden. Standardmäßig ausgeschaltet, kann pro Projekt eingeschaltet werden.

**Prüfung:** Je nach `mode`:
- `any`: Im `dataPath` existiert mindestens eine `.json`-Datei.
- `one-entity`: Für mindestens ein EntitySet aus der `metadata.xml` existiert eine `<EntitySet>.json`.
- `all-entities`: Für jedes EntitySet existiert eine `<EntitySet>.json`.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `mode` | `any` | `any`, `one-entity` oder `all-entities` |
| `dataPath` | `webapp/localService/data` | Ort der Mockdaten |

### 9. `non-odata-json`

**Beschreibung:** Weitere Services, die kein OData sind, werden als JSONModel realisiert.

**Prüfung:** Jede `dataSource` in `sap.app`, die nicht vom Typ `OData` ist, hat `type: JSON`. Das Model in `sap.ui5/models` ist ein JSONModel. Die Anzahl der OData Services wird in `odata-service` geprüft.

**Parameter:** keine

### 23. `mockserver-config`

**Beschreibung:** Eine Konfiguration für den Betrieb der App mit MockServer ist vorhanden und benutzt die Best-Practice-Benennung.

**Prüfung:** Die Datei `fileName` existiert im Projektroot.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `fileName` | `ui5-mockserver.yaml` | Erwarteter Dateiname |

---

## Konfiguration

### 11. `theme`

**Beschreibung:** Das Theme ist vorgegeben und konsistent konfiguriert.

**Prüfung:**
- Das Theme in `index.html` (`data-sap-ui-theme`) liegt in der Liste `themes`.
- In der `ui5.yaml` ist die passende Theme-Library (`themelib_<theme>`) eingetragen.
- Fehlt eine der beiden Dateien (z. B. bei Launchpad-Apps), wird sie übersprungen. Wird das Theme in keiner gefunden, gibt es einen Fehler.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `themes` | `sap_horizon` | Erlaubte Themes (Liste) |

### 12. `cache-buster`

**Beschreibung:** Die App verwendet den Cache Buster.

**Prüfung:** In der `ui5.yaml` ist der Cachebuster-Task bzw. die entsprechende Middleware konfiguriert, oder die `index.html` bindet UI5 über die versionierte Cachebuster-URL ein.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `sources` | `ui5.yaml`, `index.html` | Wo gesucht wird |

### 20. `device-types`

**Beschreibung:** Die unterstützten Device Types sind festgelegt.

**Prüfung:** `sap.ui/deviceTypes` im Manifest entspricht den erwarteten Werten.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `desktop` | `true` | erwarteter Wert |
| `tablet` | `true` | erwarteter Wert |
| `phone` | `true` | erwarteter Wert |

### 21. `flex-enabled`

**Beschreibung:** `flexEnabled` hat den vorgegebenen Wert.

**Prüfung:** `sap.ui5/flexEnabled` im Manifest entspricht `value`.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `value` | `true` | erwarteter Wert |

### 22. `content-densities`

**Beschreibung:** Die Content Densities haben die vorgegebenen Werte.

**Prüfung:** `sap.ui5/contentDensities` im Manifest entspricht den erwarteten Werten.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `compact` | `true` | erwarteter Wert |
| `cozy` | `true` | erwarteter Wert |

### 24. `framework`

**Beschreibung:** Das verwendete Framework ist vorgegeben.

**Prüfung:** `framework.name` in der `ui5.yaml` entspricht `name`.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `name` | `SAPUI5` | `SAPUI5` oder `OpenUI5` |

### 25. `ui5-version`

**Beschreibung:** Die UI5-Version erfüllt die Vorgabe.

**Prüfung:**
- `sap.ui5/dependencies/minUI5Version` im Manifest und `framework.version` in der `ui5.yaml` sind mindestens `min`.
- Beide Angaben sind zueinander konsistent.
- Versionen werden semantisch verglichen, nicht als String.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `min` | `"1.152"` | Mindestversion (regelmäßig zu pflegen) |
| `max` | keine Grenze | Höchstversion |

### 26. `flp-config`

**Beschreibung:** Die App hat eine Fiori-Launchpad-Konfiguration für mindestens eine Kachel.

**Prüfung:** `sap.app/crossNavigation/inbounds` im Manifest hat mindestens einen Eintrag mit `semanticObject` und `action`.

**Parameter:** keine

### 27. `deploy-config`

**Beschreibung:** Eine Deployment-Konfiguration mit eingerichtetem Backend ist vorhanden.

**Prüfung:**
- Die Datei `fileName` existiert im Projektroot.
- Darin ist ein Deploy-Task konfiguriert (z. B. `deploy-to-abap`), dessen `configuration.target.destination` oder `configuration.target.url` gesetzt und nicht leer ist.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `fileName` | `ui5-deploy.yaml` | Erwarteter Dateiname |

### 28. `app-title-description`

**Beschreibung:** Die App hat einen Titel und eine Beschreibung mit tatsächlichem Text.

**Prüfung:**
- `sap.app/title` und `sap.app/description` sind im Manifest gesetzt und referenzieren i18n (z. B. `{{appTitle}}`).
- Der jeweils referenzierte Schlüssel existiert in der i18n-Basisdatei (`i18n.properties`) und hat dort einen nicht-leeren Wert.

**Parameter:** keine

### 32. `app-icons`

**Beschreibung:** Die App hat eigene Icons statt der Generator-Platzhalter.

**Prüfung:** Die Felder in `requiredIcons` unter `sap.ui/icons` im Manifest sind gesetzt (nicht leer).

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `requiredIcons` | `icon`, `favIcon` | Zu prüfende Felder unter `sap.ui/icons` |

### 33. `app-version`

**Beschreibung:** Die App-Version wurde gepflegt und ist nicht der Generator-Default.

**Prüfung:** `sap.app/applicationVersion/version` im Manifest ist ungleich `defaultValue`.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `defaultValue` | `0.0.1` | Wert, der als "nicht gepflegt" gilt |

---

## Namensraum

### 13. `namespace`

**Beschreibung:** Die App verwendet den vorgegebenen Namensraum.

**Prüfung:** `sap.app/id` im Manifest beginnt mit `value`.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `value` | `de.itsfullofstars` | Erwarteter Namensraum |

### 14. `consistent-namespace`

**Beschreibung:** Alle Artefakte der App verwenden denselben Namensraum.

**Prüfung:** `sap.app/id`, `controllerName`, `fragmentName`, `viewName` und Klassen-IDs in Views, Fragmenten und Code beginnen mit demselben Namensraum wie `sap.app/id`.

**Parameter:** keine

---

## i18n

### 17. `i18n-used`

**Beschreibung:** i18n wird verwendet.

**Prüfung:**
- Ein i18n-Model ist im Manifest konfiguriert.
- Die Basisdatei (`i18n.properties`) existiert.
- Hartcodierte Texte in Views werden **nicht** geprüft.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `basePath` | `webapp/i18n` | Ort der i18n-Dateien |

### 18. `i18n-languages`

**Beschreibung:** Die App unterstützt die vom Unternehmen vorgegebenen Sprachen.

**Prüfung:** Für jede Sprache aus `languages`:
- Sie steht in `supportedLocales` — geprüft an beiden Stellen, die UI5 nicht automatisch
  synchronisiert (siehe `i18n-fallback`): `sap.app/i18n/supportedLocales` und
  `sap.ui5/models/i18n/settings/supportedLocales`. Fehlt sie in einer der beiden Stellen,
  gibt es dafür einen eigenen Fehler.
- Es gibt eine zugehörige Datei `i18n_<xx>.properties`. Für die Fallback-Sprache
  (`sap.ui5/models/i18n/settings/fallbackLocale`, maßgeblich für das Laden der Datei zur
  Laufzeit) reicht die Basisdatei `i18n.properties`.

Fehlt eines davon (z. B. `pt`), gibt es einen Fehler.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `languages` | `de`, `en` | Erforderliche Sprachen |
| `strict` | `false` | Bei `true` sind zusätzliche, nicht vorgegebene Sprachen ein Fehler |

### 19. `i18n-fallback`

**Beschreibung:** Eine Default-Sprache ist festgelegt.

**Prüfung:** `fallbackLocale` entspricht `value` und ist in `supportedLocales` enthalten — geprüft an
zwei getrennten Stellen im Manifest, die UI5 nicht automatisch synchronisiert: `sap.app/i18n`
(Descriptor-Ebene, u. a. für die Auflösung von `sap.app/title`/`sap.app/description` durch Tools
ohne laufende UI5-Runtime) und `sap.ui5/models/i18n/settings` (das Runtime-ResourceModel für
`{i18n>...}`-Bindings). Beide müssen `fallbackLocale` explizit setzen; ist `sap.app/i18n` nur als
String (alte Kurzform, nur `bundleUrl`) angegeben, gilt das als fehlende Angabe.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `value` | `en` | Erwartete Fallback-Sprache |

---

## Tests

### 29. `qunit-opa-tests`

**Beschreibung:** Das Projekt hat Unit- oder Integrationstests mit QUnit oder OPA5.

**Prüfung:** Unter `basePath` existiert mindestens eine Testdatei: eine QUnit-Testsuite
(`*.qunit.js`, `*.qunit.ts` oder `*.qunit.html`) oder ein OPA5-Journey (eine Datei, die
`sap/ui/test/Opa5` importiert bzw. requires). Fehlen beide, gibt es eine Warnung.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `basePath` | `webapp/test` | Ort der Tests |

### 30. `wdi5-tests`

**Beschreibung:** Das Projekt nutzt wdio-ui5 (`wdi5`) für End-to-End-Tests.

**Prüfung:** Eine wdio-Konfigurationsdatei (`configFile`) existiert im Projektroot, und
`package.json` hat `wdio-ui5-service` als Abhängigkeit.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `configFile` | `wdio.conf.js` | Erwarteter Dateiname (auch `.ts` wird akzeptiert) |

### 31. `playwright-tests`

**Beschreibung:** Das Projekt nutzt Playwright für End-to-End-Tests.

**Prüfung:** Eine Playwright-Konfigurationsdatei (`configFile`) existiert im Projektroot, und
`package.json` hat `@playwright/test` als Abhängigkeit.

**Parameter:**
| Name | Default | Beschreibung |
|---|---|---|
| `configFile` | `playwright.config.ts` | Erwarteter Dateiname (auch `.js` wird akzeptiert) |

---

## Besonderheiten bei Libraries

Libraries haben kein `webapp/manifest.json` — der Quellcode liegt unter `src/<namensraum-als-pfad>/`,
Tests unter `test/` (nicht `webapp/test/`), und es gibt kein App-Manifest. Folgende Regeln
lesen deshalb bei `projectType: lib` aus anderen Quellen als bei FS/FE, prüfen aber inhaltlich
dasselbe:

| Regel | FS/FE-Quelle | LIB-Quelle |
|---|---|---|
| `typescript` | `.js`-Dateien unter `webapp/` (außer `webapp/test/`) | `.js`-Dateien unter `src/` |
| `xml-views` | Quelldateien unter `webapp/` | Quelldateien unter `src/` |
| `namespace` | `sap.app/id` in `manifest.json` | `metadata.name` in `ui5.yaml` |
| `consistent-namespace` | `sap.app/id` als Basis-Namensraum | `metadata.name` in `ui5.yaml` als Basis-Namensraum |
| `i18n-used` | i18n-Model in `manifest.json` + `webapp/i18n/i18n.properties` | `src/<namensraum>/messagebundle.properties` (kein Model zu prüfen, da kein Manifest) |
| `i18n-languages` | `supportedLocales` in `manifest.json` + `webapp/i18n/i18n_<xx>.properties` | `src/<namensraum>/messagebundle_<xx>.properties` für **jede** vorgegebene Sprache (kein `supportedLocales`, daher auch kein Fallback-Freifahrtschein für die Basisdatei) |
| `framework` / `ui5-version` | `ui5.yaml` + zusätzlich `sap.ui5/dependencies/minUI5Version` in `manifest.json` (inkl. Konsistenz-Check) | nur `ui5.yaml` — `manifest.json` existiert nicht, Konsistenz-Check entfällt |
| `app-version` | `sap.app/applicationVersion/version` in `manifest.json`, Default `"0.0.1"` | `version` in `package.json`, Default `"1.0.0"` |
| `qunit-opa-tests` | Tests unter `webapp/test/` | Tests unter `test/` |

Zwei Regeln, die in früheren Katalog-Fassungen `LIB` gelistet hatten, gelten jetzt nur noch
für FS/FE, weil es für Libraries keine entsprechende Konfigurationsmöglichkeit gibt:

- **`i18n-fallback`**: Libraries deklarieren kein `fallbackLocale` — die Basisdatei
  (`messagebundle.properties`) ist per UI5-Konvention immer der Fallback, es gibt nichts,
  das falsch konfiguriert werden könnte.
- **`app-icons`**: `sap.ui/icons` ist ein App-/Launchpad-Kachel-Konzept aus `manifest.json`,
  das für Libraries nicht existiert.

## Offene Punkte

Aktuell keine. Neue Fragen, die bei der Implementierung auftauchen, werden hier ergänzt.

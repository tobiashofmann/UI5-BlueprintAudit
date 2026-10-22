# prj-violations-2

Testreferenz für `ui5-blueprint-audit`: basiert auf `prj-valid` (identischer Namensraum-
Präfix, FLP-Inbound, Deploy-Konfiguration, Framework/Version), verletzt aber gezielt genau
die 10 Regeln, die sonst in keinem anderen `sample-prj`-Projekt als Fehler auftauchen
(siehe `testcases.md`):

| Regel | Verstoß |
|---|---|
| `app-title-description` | `sap.app/title` ist der feste String `"Sample App"` statt einer i18n-Referenz |
| `dialogs-folder` | `ConfirmDialog.fragment.xml` (Wurzelelement `Dialog`) liegt direkt unter `webapp/view/` statt `webapp/view/dialogs/` |
| `flex-enabled` | `sap.ui5/flexEnabled` ist `false` statt `true` |
| `fragments-folder` | `InfoFragment.fragment.xml` liegt direkt unter `webapp/view/` statt `webapp/view/fragments/` |
| `i18n-used` | Das i18n-Model in `manifest.json` hat `type: sap.ui.model.odata.v4.ODataModel` statt `sap.ui.model.resource.ResourceModel` |
| `no-custom-controls` | `webapp/control/MyCustomControl.ts` erweitert `sap/ui/core/Control` |
| `non-odata-json` | Zusätzliche dataSource `staticConfig` hat `type: "XML"` statt `"JSON"` |
| `odata-metadata-local` | `localUri` der `northwind`-dataSource zeigt auf `data/metadata.xml`, die Datei liegt also außerhalb von `webapp/localService` |
| `odata-mockdata` | In `ui5-blueprint-audit.yaml` bewusst von `off` auf `error` (Modus `any`) gestellt — es existiert kein `webapp/localService/data`-Ordner |
| `xml-views` | `webapp/view/Legacy.view.ts` ist eine Nicht-XML-View und nutzt `sap.ui.jsview(...)` (bewusst `.ts` statt `.js`, um nicht zusätzlich die `typescript`-Regel zu verletzen) |

Alle anderen Regeln aus dem Katalog erfüllt dieses Projekt wie `prj-valid` (bewusst keine
zusätzlichen, nicht dokumentierten Nebenwirkungen).

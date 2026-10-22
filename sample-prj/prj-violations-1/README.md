# prj-violations-1

Testreferenz für `ui5-blueprint-audit`. Dieses Projekt verletzt absichtlich folgende Regeln aus
`docs/ui5-blueprint-audit-rules.md`, alle anderen Regeln sind bewusst erfüllt (siehe
`sample-prj/testcases.md` für die Details):

- `controller-matches-view` — `Detail.view.xml` referenziert einen Controller, den es nicht gibt.
- `folder-structure` — es gibt kein `webapp/model`.
- `theme` — verwendet `sap_bluecrystal` statt des vorgegebenen `sap_horizon`.
- `consistent-namespace` — `View1.view.xml` verweist auf eine falsche Controller-Namespace (kopiert von `prj-ts`).
- `i18n-languages` — `de` fehlt in `supportedLocales` und als `i18n_de.properties`.
- `device-types` — nur `tablet` ist aktiviert.
- `content-densities` — nur `cozy` ist aktiviert.

Als OData-Service wird der öffentliche Northwind-Sample-Service in OData v4
(`https://services.odata.org/v4/northwind/northwind.svc/`) verwendet, inkl. lokaler
`$metadata` unter `webapp/localService/metadata.xml`.

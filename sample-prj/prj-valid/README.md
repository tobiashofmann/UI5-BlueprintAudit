# prj-valid

Testreferenz für `ui5-blueprint-audit`: dieses Projekt erfüllt **alle** Regeln aus
`docs/ui5-blueprint-audit-rules.md` (siehe `sample-prj/testcases.md` für die Details je Regel).

Als OData-Service wird der öffentliche Northwind-Sample-Service in OData v4
(`https://services.odata.org/v4/northwind/northwind.svc/`) verwendet, inkl. lokaler
`$metadata` unter `webapp/localService/metadata.xml`.

Deploy-Konfiguration (`ui5-deploy.yaml`) und FLP-Inbound (`sap.app/crossNavigation/inbounds`
in `manifest.json`) sind 1:1 aus `prj-ts` übernommen (gleiches Zielsystem, gleicher
Semantic Object/Action).

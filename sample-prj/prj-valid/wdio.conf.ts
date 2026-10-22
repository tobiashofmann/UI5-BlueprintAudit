// Minimale wdio-ui5-Konfiguration für die ui5-blueprint-audit-Regel "wdi5-tests".
export const config = {
  specs: ["./webapp/test/e2e/**/*.ts"],
  services: [["ui5", {}]],
  baseUrl: "http://localhost:8080",
};

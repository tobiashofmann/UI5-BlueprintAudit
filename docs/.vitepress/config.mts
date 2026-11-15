import { defineConfig } from "vitepress";
import { withMermaid } from "vitepress-plugin-mermaid";

const repo = "https://github.com/tobiashofmann/UI5-BlueprintAudit";

// Set DOCS_BASE (e.g. "/UI5-BlueprintAudit/") when hosting under a sub-path such as GitHub Pages.
const base = process.env.DOCS_BASE ?? "/";

export default withMermaid(
  defineConfig({
    title: "UI5 BlueprintAudit",
    description: "Check a UI5 project against your company guidelines: structure, manifest, and configuration.",
    lang: "en-US",
    base,
    cleanUrls: true,
    lastUpdated: true,

    // The docs/ folder also holds files that are not part of the site:
    // the rule catalog is rendered through rules/catalog.md (an include), and the rest are repo-internal notes.
    srcExclude: ["api/**", "ui5-blueprint-audit-rules.md", "linter-coverage.md", "testing-dependabot-prs-locally.md"],

    head: [["link", { rel: "icon", href: `${base}favicon.svg` }]],

    themeConfig: {
      logo: "/favicon.svg",
      nav: [
        { text: "Guide", link: "/guide/", activeMatch: "/guide/" },
        { text: "Concepts", link: "/concepts/why", activeMatch: "/concepts/" },
        { text: "Packages", link: "/packages/", activeMatch: "/packages/" },
        { text: "Rules", link: "/rules/", activeMatch: "/rules/" },
        { text: "Developers", link: "/dev/", activeMatch: "/dev/" },
        { text: "Decisions", link: "/adr/", activeMatch: "/adr/" },
      ],

      sidebar: {
        "/guide/": [
          {
            text: "Guide",
            items: [
              { text: "Scan your first project", link: "/guide/" },
              { text: "CLI reference", link: "/guide/cli" },
              { text: "Configuration", link: "/guide/configuration" },
              { text: "Full configuration file", link: "/guide/full-config" },
              { text: "Reports", link: "/guide/reports" },
              { text: "Use it in CI", link: "/guide/ci" },
            ],
          },
        ],
        "/concepts/": [
          {
            text: "Concepts",
            items: [
              { text: "Why BlueprintAudit", link: "/concepts/why" },
              { text: "What it checks", link: "/concepts/checks" },
              { text: "Bring your own rules", link: "/concepts/own-rules" },
            ],
          },
        ],
        "/packages/": [
          {
            text: "Packages",
            items: [
              { text: "Overview", link: "/packages/" },
              { text: "ui5-blueprint-audit", link: "/packages/audit" },
              { text: "ui5-blueprint-audit-plugin-core", link: "/packages/plugin-core" },
              { text: "ui5-blueprint-audit-types", link: "/packages/types" },
            ],
          },
        ],
        "/rules/": [
          {
            text: "Rules",
            items: [
              { text: "Overview table", link: "/rules/" },
              { text: "Full catalog", link: "/rules/catalog" },
            ],
          },
        ],
        "/dev/": [
          {
            text: "Developers",
            items: [
              { text: "Architecture", link: "/dev/" },
              { text: "Run flow", link: "/dev/flow" },
              { text: "Project context and rules", link: "/dev/context-and-rules" },
              { text: "Plugins and localization", link: "/dev/plugins-and-locales" },
              { text: "Testing and releases", link: "/dev/testing" },
            ],
          },
        ],
        "/adr/": [
          {
            text: "Decisions",
            items: [
              { text: "Overview", link: "/adr/" },
              { text: "ADR-0001: Standalone CLI", link: "/adr/0001-standalone-cli" },
              { text: "ADR-0002: TypeScript, ESM, Node.js 24", link: "/adr/0002-typescript-esm-node-24" },
              { text: "ADR-0003: Monorepo with three packages", link: "/adr/0003-monorepo-three-packages" },
              { text: "ADR-0004: Core rules as a plugin", link: "/adr/0004-core-rules-as-regular-plugin" },
              { text: "ADR-0005: Translation logic in types", link: "/adr/0005-translation-logic-in-types-package" },
              { text: "ADR-0006: Project context loaded once", link: "/adr/0006-project-context-loaded-once" },
              { text: "ADR-0007: Explicit project type", link: "/adr/0007-explicit-project-type" },
              { text: "ADR-0008: Library projects", link: "/adr/0008-library-projects" },
              { text: "ADR-0009: Catalog as source of truth", link: "/adr/0009-rule-catalog-source-of-truth" },
              { text: "ADR-0010: TypeScript as runtime dependency", link: "/adr/0010-typescript-as-runtime-dependency" },
              { text: "ADR-0011: YAML configuration", link: "/adr/0011-yaml-configuration" },
              { text: "ADR-0012: Plugin loading", link: "/adr/0012-plugin-loading" },
              { text: "ADR-0013: Rule namespacing", link: "/adr/0013-rule-namespacing" },
              { text: "ADR-0014: Engine error isolation", link: "/adr/0014-engine-error-isolation" },
              { text: "ADR-0015: Localization", link: "/adr/0015-localization" },
              { text: "ADR-0016: Report formats and exit codes", link: "/adr/0016-report-formats-and-exit-codes" },
              { text: "ADR-0017: Testing strategy", link: "/adr/0017-testing-strategy" },
              { text: "ADR-0018: Protected main and pull requests", link: "/adr/0018-protected-main-and-pull-requests" },
              { text: "ADR-0019: Automated release", link: "/adr/0019-automated-release-with-trusted-publishing" },
              { text: "ADR-0020: SBOM generation", link: "/adr/0020-sbom-generation" },
              { text: "ADR-0021: VitePress documentation site", link: "/adr/0021-vitepress-documentation-site" },
              { text: "ADR-0022: English-only content", link: "/adr/0022-english-only-written-content" },
            ],
          },
        ],
      },

      socialLinks: [{ icon: "github", link: repo }],
      search: { provider: "local" },
      editLink: {
        pattern: `${repo}/edit/main/docs/:path`,
        text: "Edit this page on GitHub",
      },
      footer: {
        message: "Released under the MIT License.",
        copyright: "Tobias Hofmann",
      },
    },

    mermaid: {},

    vite: {
      // Dev server only: mermaid imports fastdom and its promise extension (both CommonJS) as default
      // exports, and Vite does not pre-bundle them on its own, so the page stays blank with
      // "does not provide an export named 'default'". Pre-bundling them makes the interop work.
      optimizeDeps: {
        include: ["fastdom", "fastdom/extensions/fastdom-promised.js"],
      },
    },
  }),
);

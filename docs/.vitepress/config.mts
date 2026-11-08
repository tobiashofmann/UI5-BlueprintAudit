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
  }),
);

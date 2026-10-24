#!/usr/bin/env node
// Generates CycloneDX SBOMs for the monorepo root and each publishable package,
// each in two variants: "devdependencies" (full tree, incl. devDependencies) and
// "production" (--omit=dev). Written to sbom/<project>/<variant>.cdx.json.
//
// npm's own `npm sbom --omit=dev` silently drops packages that are a devDependency
// anywhere in the workspace, even when another workspace needs them in production
// (confirmed on this repo: it drops "typescript" and "yaml", both real production
// dependencies). @cyclonedx/cyclonedx-npm resolves --omit correctly, so it's used
// here instead.
//
// For workspace-scoped runs, cyclonedx-npm's `metadata.component` still describes
// the monorepo root, not the package being scoped to. fixMainComponent() promotes
// that package's own (already correctly computed) entry from `components` into
// `metadata.component`, and strips the monorepo-root bom-ref prefix from every
// reference in the tree so the SBOM is self-contained.

import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(rootDir, "sbom");

const projects = [
  { id: "monorepo", manifest: "package.json", workspace: null },
  { id: "ui5-blueprint-audit", manifest: "packages/ui5-blueprint-audit/package.json", workspace: "packages/ui5-blueprint-audit" },
  {
    id: "ui5-blueprint-audit-plugin-core",
    manifest: "packages/ui5-blueprint-audit-plugin-core/package.json",
    workspace: "packages/ui5-blueprint-audit-plugin-core",
  },
  { id: "ui5-blueprint-audit-types", manifest: "packages/ui5-blueprint-audit-types/package.json", workspace: "packages/ui5-blueprint-audit-types" },
];

const variants = [
  { id: "devdependencies", extraArgs: [] },
  { id: "production", extraArgs: ["--omit", "dev"] },
];

const cyclonedxBin = resolve(rootDir, "node_modules/.bin/cyclonedx-npm");

function runCycloneDx(args) {
  return execFileSync(cyclonedxBin, args, {
    cwd: rootDir,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 64,
  });
}

function fixMainComponent(sbom, manifestPath) {
  const pkg = JSON.parse(readFileSync(resolve(rootDir, manifestPath), "utf8"));
  const rootRef = sbom.metadata.component["bom-ref"];
  const prefix = `${rootRef}|`;

  // Every bom-ref in a workspace-scoped run is prefixed with the monorepo root's
  // own bom-ref (e.g. "ui5-blueprint-audit-monorepo@0.0.0|@abap/foo@1.0.0").
  // Stripping it globally turns these into clean, self-contained refs.
  const stripped = JSON.parse(JSON.stringify(sbom).split(prefix).join(""));

  const idx = stripped.components.findIndex((c) => (c.group ? `${c.group}/${c.name}` : c.name) === pkg.name);
  if (idx === -1) {
    throw new Error(`Could not find component "${pkg.name}" in the generated SBOM for ${manifestPath}`);
  }
  const [mainComponent] = stripped.components.splice(idx, 1);

  stripped.metadata.component = mainComponent;
  stripped.dependencies = stripped.dependencies.filter((d) => d.ref !== rootRef);
  stripped.serialNumber = `urn:uuid:${randomUUID()}`;

  return stripped;
}

for (const project of projects) {
  const projectOutDir = join(outDir, project.id);
  mkdirSync(projectOutDir, { recursive: true });

  for (const variant of variants) {
    const args = [...variant.extraArgs, "--validate", "--output-file", "-"];
    if (project.workspace) args.push("-w", project.workspace);

    console.log(`Generating ${project.id}/${variant.id}.cdx.json ...`);
    let sbom = JSON.parse(runCycloneDx(args));
    if (project.workspace) sbom = fixMainComponent(sbom, project.manifest);

    writeFileSync(join(projectOutDir, `${variant.id}.cdx.json`), `${JSON.stringify(sbom, null, 2)}\n`, "utf8");
  }
}

import ts from "typescript";

/** A class or legacy `.extend()` call found to extend a UI5 control. */
export interface ControlExtension {
  name: string;
}

/** A custom control, with the file that defines it. */
export interface CustomControl extends ControlExtension {
  file: string;
}

/** Any class with a base class, or any `Base.extend(...)` call, before deciding whether it is a control. */
interface ClassExtension {
  name: string;
  /** The base class expression as written, e.g. `"Button"` or `"sap.m.Button"`. */
  baseText: string;
  /** The module the base class comes from, e.g. `"sap/m/Button"` or `"./BaseControl"`, if it can be resolved. */
  baseModule?: string;
}

const ANONYMOUS = "<anonymous>";

/**
 * UI5 libraries whose classes are controls or elements. Extending anything from them
 * (e.g. `sap/m/Button`) creates a custom control, just like extending
 * `sap/ui/core/Control` directly.
 */
const CONTROL_LIBRARY_PREFIXES = [
  "sap/m/",
  "sap/f/",
  "sap/tnt/",
  "sap/uxap/",
  "sap/ui/table/",
  "sap/ui/layout/",
  "sap/ui/unified/",
  "sap/ui/commons/",
  "sap/ui/ux3/",
  "sap/ui/comp/",
  "sap/ui/mdc/",
  "sap/ui/webc/",
  "sap/ui/richtexteditor/",
  "sap/ui/codeeditor/",
  "sap/ui/integration/",
  "sap/ui/suite/",
  "sap/ui/vbm/",
  "sap/ui/vk/",
  "sap/suite/ui/commons/",
  "sap/suite/ui/microchart/",
  "sap/viz/",
  "sap/gantt/",
  "sap/ndc/",
  "sap/ushell/ui/",
];

/**
 * `sap/ui/core` mixes controls with non-controls (`UIComponent`, `mvc/Controller`, …), so
 * its control and element classes are listed individually.
 */
const CORE_CONTROL_MODULES = new Set([
  "sap/ui/core/Control",
  "sap/ui/core/Element",
  "sap/ui/core/Icon",
  "sap/ui/core/HTML",
  "sap/ui/core/InvisibleText",
  "sap/ui/core/ComponentContainer",
  "sap/ui/core/Item",
  "sap/ui/core/ListItem",
  "sap/ui/core/SeparatorItem",
  "sap/ui/core/Title",
  "sap/ui/core/CustomData",
  "sap/ui/core/LayoutData",
  "sap/ui/core/VariantLayoutData",
  "sap/ui/core/TooltipBase",
  "sap/ui/core/XMLComposite",
  "sap/ui/core/ScrollBar",
  "sap/ui/core/webc/WebComponent",
]);

function scriptKindFor(fileName: string): ts.ScriptKind {
  if (fileName.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (fileName.endsWith(".ts")) return ts.ScriptKind.TS;
  return ts.ScriptKind.JS;
}

function lastSegment(text: string, separator: string): string {
  const parts = text.split(separator);
  return parts[parts.length - 1] ?? text;
}

/** Whether a UI5 module (slash notation) is a control or element class. */
function isUi5ControlModule(moduleName: string): boolean {
  if (CORE_CONTROL_MODULES.has(moduleName)) return true;
  if (!CONTROL_LIBRARY_PREFIXES.some((prefix) => moduleName.startsWith(prefix))) return false;
  // Control libraries also ship a few non-control classes that apps do extend.
  return !moduleName.includes("/routing/") && !moduleName.endsWith("/library");
}

/**
 * Whether a class extension's base is a UI5 control. If the base resolves to a UI5 module,
 * that module decides. Otherwise (no import to go by, e.g. a snippet or a global) the base
 * is judged by its name: `Control` or `Element`.
 */
function extendsUi5Control(extension: ClassExtension): boolean {
  if (extension.baseModule?.startsWith("sap/")) return isUi5ControlModule(extension.baseModule);
  return /\b(Control|Element)\b/.test(extension.baseText) && !/UIComponent/.test(extension.baseText);
}

function isAmdLoaderCall(node: ts.CallExpression, sourceFile: ts.SourceFile): boolean {
  const callee = node.expression.getText(sourceFile);
  return callee === "sap.ui.define" || callee === "sap.ui.require" || callee === "define";
}

/**
 * Maps local identifiers to the module they are loaded from: ES `import` declarations and
 * the dependency array of `sap.ui.define([...], function (...) {})` / `sap.ui.require`.
 */
function collectModuleBindings(sourceFile: ts.SourceFile): Map<string, string> {
  const bindings = new Map<string, string>();

  function visit(node: ts.Node): void {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier) && node.importClause) {
      const moduleName = node.moduleSpecifier.text;
      const clause = node.importClause;
      if (clause.name) bindings.set(clause.name.text, moduleName);
      if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
        for (const element of clause.namedBindings.elements) bindings.set(element.name.text, moduleName);
      }
    }

    if (ts.isCallExpression(node) && isAmdLoaderCall(node, sourceFile)) {
      const dependencies = node.arguments.find(ts.isArrayLiteralExpression);
      const factory = node.arguments.find(
        (arg): arg is ts.FunctionExpression | ts.ArrowFunction => ts.isFunctionExpression(arg) || ts.isArrowFunction(arg),
      );
      if (dependencies && factory) {
        factory.parameters.forEach((parameter, index) => {
          const dependency = dependencies.elements[index];
          if (dependency && ts.isStringLiteralLike(dependency) && ts.isIdentifier(parameter.name)) {
            bindings.set(parameter.name.text, dependency.text);
          }
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return bindings;
}

function resolveBaseModule(baseText: string, bindings: Map<string, string>): string | undefined {
  const bound = bindings.get(baseText);
  if (bound !== undefined) return bound;
  // Global access without an import, e.g. `sap.m.Button.extend(...)`.
  if (/^sap(\.\w+)+$/.test(baseText)) return baseText.split(".").join("/");
  return undefined;
}

/**
 * Analysis results by file name, valid while the content is unchanged. Building the
 * TypeScript AST is the most expensive step of a run, and without this it would be repeated
 * for every output language and by every rule that needs it. Bounded like the XML cache.
 */
const extensionCache = new Map<string, { sourceText: string; extensions: ClassExtension[] }>();
const EXTENSION_CACHE_LIMIT = 5000;

/**
 * Every class with an `extends` clause and every `Base.extend(...)` call in a source file,
 * in source order. Cached per file; the returned array is shared, treat it as read-only.
 */
function findClassExtensions(sourceText: string, fileName: string): ClassExtension[] {
  const cached = extensionCache.get(fileName);
  if (cached && cached.sourceText === sourceText) return cached.extensions;
  const extensions = parseClassExtensions(sourceText, fileName);
  if (extensionCache.size >= EXTENSION_CACHE_LIMIT) extensionCache.clear();
  extensionCache.set(fileName, { sourceText, extensions });
  return extensions;
}

function parseClassExtensions(sourceText: string, fileName: string): ClassExtension[] {
  const sourceFile = ts.createSourceFile(fileName, sourceText, ts.ScriptTarget.Latest, true, scriptKindFor(fileName));
  const bindings = collectModuleBindings(sourceFile);
  const results: ClassExtension[] = [];

  function add(name: string, base: ts.Expression): void {
    const baseText = base.getText(sourceFile);
    results.push({ name, baseText, baseModule: resolveBaseModule(baseText, bindings) });
  }

  function visit(node: ts.Node): void {
    if (ts.isClassLike(node) && node.heritageClauses) {
      for (const clause of node.heritageClauses) {
        if (clause.token !== ts.SyntaxKind.ExtendsKeyword) continue;
        for (const type of clause.types) add(node.name?.getText(sourceFile) ?? ANONYMOUS, type.expression);
      }
    }

    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "extend"
    ) {
      const firstArg = node.arguments[0];
      add(firstArg && ts.isStringLiteralLike(firstArg) ? firstArg.text : ANONYMOUS, node.expression.expression);
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return results;
}

/**
 * Finds classes and legacy `.extend()` calls in one file that extend a UI5 control or
 * element: `sap/ui/core/Control`, `sap/ui/core/Element`, or any class from a UI5 control
 * library (e.g. `sap/m/Button`). Parses the TypeScript AST rather than doing a text search
 * (see CLAUDE.md, "Parser" section). Looks at this file only; see {@link findCustomControls}
 * for classes that extend another custom control of the project.
 *
 * @param sourceText - The source file's contents.
 * @param fileName - Used only to pick the right script kind (`.ts`/`.tsx`/`.js`) for parsing.
 * @returns Every control extension found, in source order.
 */
export function findControlExtensions(sourceText: string, fileName: string): ControlExtension[] {
  return findClassExtensions(sourceText, fileName)
    .filter(extendsUi5Control)
    .map(({ name }) => ({ name }));
}

/**
 * Finds every custom control of a project (used by the `no-custom-controls` catalog rule):
 * classes that extend a UI5 control directly (see {@link findControlExtensions}), plus
 * classes that extend one of those custom controls, at any depth.
 *
 * A base class is matched to a custom control by its simple class name, which is what the
 * importing file's identifier and module name end in (`./BaseControl`, `my/app/control/BaseControl`).
 *
 * @param sources - The project's source files, with their project-relative path.
 * @returns Every custom control, in file order, then source order.
 */
export function findCustomControls(sources: Array<{ path: string; content: string }>): CustomControl[] {
  const candidates = sources.flatMap(({ path, content }) =>
    findClassExtensions(content, path).map((extension) => ({ extension, file: path, isControl: extendsUi5Control(extension) })),
  );

  const controlNames = new Set<string>();
  const remember = (name: string) => {
    if (name !== ANONYMOUS) controlNames.add(lastSegment(name, "."));
  };
  for (const candidate of candidates) {
    if (candidate.isControl) remember(candidate.extension.name);
  }

  // Inheritance chains within the project: repeat until no further class turns out to
  // extend a custom control.
  let changed = true;
  while (changed) {
    changed = false;
    for (const candidate of candidates) {
      if (candidate.isControl) continue;
      const { baseText, baseModule } = candidate.extension;
      // A base class from a UI5 module was already judged; it can't be a project class.
      if (baseModule?.startsWith("sap/")) continue;
      const baseNames = [lastSegment(baseText, "."), ...(baseModule ? [lastSegment(baseModule, "/")] : [])];
      if (baseNames.some((name) => controlNames.has(name))) {
        candidate.isControl = true;
        remember(candidate.extension.name);
        changed = true;
      }
    }
  }

  return candidates.filter((c) => c.isControl).map((c) => ({ name: c.extension.name, file: c.file }));
}

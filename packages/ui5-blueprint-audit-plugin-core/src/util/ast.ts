import ts from "typescript";

export interface ControlExtension {
  name: string;
}

function scriptKindFor(fileName: string): ts.ScriptKind {
  if (fileName.endsWith(".tsx")) return ts.ScriptKind.TSX;
  if (fileName.endsWith(".ts")) return ts.ScriptKind.TS;
  return ts.ScriptKind.JS;
}

function isControlBaseExpression(expr: ts.Expression, sourceFile: ts.SourceFile): boolean {
  const text = expr.getText(sourceFile);
  return /\b(Control|Element)\b/.test(text) && !/UIComponent/.test(text);
}

/**
 * Findet Klassen/Legacy-`.extend()`-Aufrufe, die `sap/ui/core/Control` oder
 * `sap/ui/core/Element` erweitern (siehe Katalog-Regel `no-custom-controls`).
 * Nutzt den TypeScript-AST statt Textsuche (siehe CLAUDE.md, Abschnitt "Parser").
 */
export function findControlExtensions(sourceText: string, fileName: string): ControlExtension[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    scriptKindFor(fileName),
  );
  const results: ControlExtension[] = [];

  function visit(node: ts.Node): void {
    if (ts.isClassDeclaration(node) && node.heritageClauses) {
      for (const clause of node.heritageClauses) {
        if (clause.token !== ts.SyntaxKind.ExtendsKeyword) continue;
        for (const type of clause.types) {
          if (isControlBaseExpression(type.expression, sourceFile)) {
            results.push({ name: node.name?.getText(sourceFile) ?? "<anonymous>" });
          }
        }
      }
    }

    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      node.expression.name.text === "extend" &&
      isControlBaseExpression(node.expression.expression, sourceFile)
    ) {
      const firstArg = node.arguments[0];
      const name = firstArg && ts.isStringLiteral(firstArg) ? firstArg.text : "<anonymous>";
      results.push({ name });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return results;
}

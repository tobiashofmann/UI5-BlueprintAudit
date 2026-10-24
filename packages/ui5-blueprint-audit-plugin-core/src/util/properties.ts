/** Parses a `.properties` file (i18n) into a flat key/value object. */
export function parseProperties(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || line.startsWith("!")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    result[key] = value;
  }
  return result;
}

/**
 * Extracts the i18n key from a placeholder like `"{{appTitle}}"`.
 *
 * @returns The key (e.g. `"appTitle"`), or `undefined` if `value` isn't a string or
 * doesn't match the `{{key}}` placeholder shape.
 */
export function extractI18nKey(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const match = /^\{\{(.+)}}$/.exec(value.trim());
  return match?.[1];
}

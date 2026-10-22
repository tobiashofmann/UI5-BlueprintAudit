/** Parst eine .properties-Datei (i18n) in ein flaches key/value-Objekt. */
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

/** Extrahiert den i18n-Key aus einem Platzhalter wie "{{appTitle}}". */
export function extractI18nKey(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const match = /^\{\{(.+)}}$/.exec(value.trim());
  return match?.[1];
}

import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

export function parseXml(content: string): Record<string, unknown> {
  return parser.parse(content) as Record<string, unknown>;
}

function getRootKeyAndNode(content: string): [string, Record<string, unknown>] | undefined {
  const doc = parseXml(content);
  const key = Object.keys(doc).find((k) => k !== "?xml");
  if (!key) return undefined;
  return [key, doc[key] as Record<string, unknown>];
}

/** Lokaler Name des Wurzelelements, ohne Namespace-Präfix (z. B. "Dialog" aus "mvc:View"). */
export function getRootElementName(content: string): string | undefined {
  const entry = getRootKeyAndNode(content);
  if (!entry) return undefined;
  const parts = entry[0].split(":");
  return parts[parts.length - 1];
}

export function getRootAttribute(content: string, attrName: string): string | undefined {
  const entry = getRootKeyAndNode(content);
  if (!entry) return undefined;
  const value = entry[1][`@_${attrName}`];
  return typeof value === "string" ? value : undefined;
}

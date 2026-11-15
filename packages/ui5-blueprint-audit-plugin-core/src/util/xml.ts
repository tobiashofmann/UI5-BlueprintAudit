import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });

/**
 * Parsed documents by content. Rules run once per output language and several rules look
 * at the same views and fragments, so each document would otherwise be parsed many times.
 * Bounded so a long-lived process (tests, many projects in one run) can't grow it forever.
 */
const parseCache = new Map<string, Record<string, unknown>>();
const PARSE_CACHE_LIMIT = 2000;

/**
 * Parses an XML document (view, fragment, etc.) into a plain object tree. The result is
 * cached and shared between callers: treat it as read-only.
 */
export function parseXml(content: string): Record<string, unknown> {
  const cached = parseCache.get(content);
  if (cached) return cached;
  const parsed = parser.parse(content) as Record<string, unknown>;
  if (parseCache.size >= PARSE_CACHE_LIMIT) parseCache.clear();
  parseCache.set(content, parsed);
  return parsed;
}

function getRootKeyAndNode(content: string): [string, Record<string, unknown>] | undefined {
  const doc = parseXml(content);
  const key = Object.keys(doc).find((k) => k !== "?xml");
  if (!key) return undefined;
  return [key, doc[key] as Record<string, unknown>];
}

/** The root element's local name, without its namespace prefix (e.g. `"Dialog"` from `"mvc:View"`). */
export function getRootElementName(content: string): string | undefined {
  const entry = getRootKeyAndNode(content);
  if (!entry) return undefined;
  return localName(entry[0]);
}

function localName(qualifiedName: string): string {
  const parts = qualifiedName.split(":");
  return parts[parts.length - 1] ?? qualifiedName;
}

/**
 * The element that decides what kind of fragment this is: normally the root element, but
 * for the common `<core:FragmentDefinition>` wrapper around exactly one control, that
 * control (e.g. `"Dialog"`). A `FragmentDefinition` with several children, or none, stays
 * `"FragmentDefinition"`.
 *
 * @returns The local element name, without namespace prefix.
 */
export function getFragmentRootElementName(content: string): string | undefined {
  const entry = getRootKeyAndNode(content);
  if (!entry) return undefined;
  const rootName = localName(entry[0]);
  if (rootName !== "FragmentDefinition") return rootName;

  const node: unknown = entry[1];
  if (typeof node !== "object" || node === null) return rootName;
  const children = Object.entries(node).filter(([key]) => !key.startsWith("@_") && !key.startsWith("#"));
  if (children.length !== 1) return rootName;
  const [childName, childNode] = children[0]!;
  // fast-xml-parser groups repeated sibling elements into an array under one key.
  if (Array.isArray(childNode) && childNode.length !== 1) return rootName;
  return localName(childName);
}

/**
 * Reads one attribute's value from an XML document's root element.
 *
 * @param content - The raw XML content.
 * @param attrName - The attribute's local name, without namespace prefix.
 * @returns The attribute's value, or `undefined` if it isn't set.
 */
export function getRootAttribute(content: string, attrName: string): string | undefined {
  const entry = getRootKeyAndNode(content);
  if (!entry) return undefined;
  const value = entry[1][`@_${attrName}`];
  return typeof value === "string" ? value : undefined;
}

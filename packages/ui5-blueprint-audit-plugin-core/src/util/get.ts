/**
 * Reads a nested property from an unknown value by key path, without throwing if an
 * intermediate value is missing or not an object.
 *
 * @param obj - The value to read from (typically a parsed manifest/YAML document).
 * @param path - The property keys to follow, in order.
 * @returns The value at that path, or `undefined` if any step along the way is missing.
 */
export function get(obj: unknown, ...path: string[]): unknown {
  let cur: unknown = obj;
  for (const key of path) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[key];
  }
  return cur;
}

function parseVersion(version: string): number[] {
  return version.split(".").map((part) => parseInt(part, 10) || 0);
}

/**
 * Compares two dot-separated version strings (e.g. `"1.152.0"`) numerically, part by
 * part, rather than lexicographically — so `"1.9"` correctly compares as less than
 * `"1.10"`. Missing/non-numeric parts are treated as `0`.
 *
 * @returns A negative number if `a` < `b`, positive if `a` > `b`, `0` if equal.
 */
export function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/** Whether version `a` is greater than or equal to version `b`, compared semantically. */
export function gte(a: string, b: string): boolean {
  return compareVersions(a, b) >= 0;
}

/** Compares only major.minor, ignoring the patch level. */
export function sameMajorMinor(a: string, b: string): boolean {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  return (pa[0] ?? 0) === (pb[0] ?? 0) && (pa[1] ?? 0) === (pb[1] ?? 0);
}

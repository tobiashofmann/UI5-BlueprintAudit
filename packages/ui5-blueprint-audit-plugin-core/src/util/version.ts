function parseVersion(version: string): number[] {
  return version.split(".").map((part) => parseInt(part, 10) || 0);
}

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

export function gte(a: string, b: string): boolean {
  return compareVersions(a, b) >= 0;
}

/** Vergleicht nur major.minor, ignoriert den Patch-Level. */
export function sameMajorMinor(a: string, b: string): boolean {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  return (pa[0] ?? 0) === (pb[0] ?? 0) && (pa[1] ?? 0) === (pb[1] ?? 0);
}

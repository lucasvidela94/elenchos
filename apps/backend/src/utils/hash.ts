import CryptoJS from 'crypto-js';

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sortValue(item));
  }

  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
    const sorted: Record<string, unknown> = {};
    for (const [key, nested] of entries) {
      sorted[key] = sortValue(nested);
    }
    return sorted;
  }

  return value;
}

export function generateHash(payload: Record<string, unknown>): string {
  const canonicalJson = JSON.stringify(sortValue(payload));
  return CryptoJS.SHA256(canonicalJson).toString();
}

export function verifyHash(payload: Record<string, unknown>, hash: string): boolean {
  return generateHash(payload) === hash;
}

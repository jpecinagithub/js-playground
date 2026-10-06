const PREFIX = 'jsp:';

export const store = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(PREFIX + key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(PREFIX + key, value);
    } catch {
      /* private mode etc. */
    }
  },
  getJson<T>(key: string, fallback: T): T {
    const raw = store.get(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
};

/* ------------------------- share links ------------------------- */

function bytesToB64Url(bytes: Uint8Array): string {
  let bin = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    bin += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64UrlToBytes(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/**
 * Build a shareable URL encoding the snippet (no backend). Returns null when
 * the resulting URL would be too long for practical use.
 */
export async function buildShareUrl(code: string): Promise<string | null> {
  const raw = new TextEncoder().encode(code);
  let payload: string;
  try {
    if (typeof CompressionStream !== 'undefined') {
      const stream = new Blob([raw as BlobPart]).stream().pipeThrough(new CompressionStream('deflate-raw'));
      const buf = await new Response(stream).arrayBuffer();
      payload = '1' + bytesToB64Url(new Uint8Array(buf));
    } else {
      payload = '0' + bytesToB64Url(raw);
    }
  } catch {
    payload = '0' + bytesToB64Url(raw);
  }
  const url = `${location.origin}${location.pathname}?code=${payload}`;
  return url.length > 2048 ? null : url;
}

/** Decode a `?code=` payload back to source, or null if invalid. */
export async function decodeSharedCode(param: string): Promise<string | null> {
  try {
    const version = param[0];
    const bytes = b64UrlToBytes(param.slice(1));
    if (version === '1' && typeof DecompressionStream !== 'undefined') {
      const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      const buf = await new Response(stream).arrayBuffer();
      return new TextDecoder().decode(buf);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function sharedCodeParam(): string | null {
  try {
    return new URLSearchParams(location.search).get('code');
  } catch {
    return null;
  }
}

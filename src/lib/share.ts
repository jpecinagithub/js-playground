import LZString from 'lz-string';

export function encodeCode(code: string): string {
  return LZString.compressToEncodedURIComponent(code);
}

export function decodeCode(encoded: string): string | null {
  try {
    return LZString.decompressFromEncodedURIComponent(encoded);
  } catch {
    return null;
  }
}

export function getCodeFromUrl(): string | null {
  const hash = window.location.hash;
  if (!hash.startsWith('#code=')) return null;
  
  const encoded = hash.slice(6);
  return decodeCode(encoded);
}

export function setCodeToUrl(code: string): void {
  const encoded = encodeCode(code);
  window.history.replaceState(null, '', `#code=${encoded}`);
}

export function getShareUrl(code: string): string {
  const encoded = encodeCode(code);
  return `${window.location.origin}${window.location.pathname}#code=${encoded}`;
}

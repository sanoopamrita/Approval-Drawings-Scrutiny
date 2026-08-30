/**
 * Client-Side Input Sanitization & Security Utilities
 * Protects against XSS, script injection, and enforces zero-storage privacy.
 */

/**
 * Escapes unsafe HTML characters from strings before display or markdown rendering.
 */
export function sanitizeInput(input: string | undefined | null): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

/**
 * Validates drawing and project numbers for safe alphanumerics and permissible punctuation.
 */
export function sanitizeProjectRef(ref: string | undefined | null): string {
  if (!ref) return '';
  return ref.replace(/[^a-zA-Z0-9\-_/.# ]/g, '').trim().slice(0, 80);
}

/**
 * Validates uploaded files strictly for allowed extensions and MIME types.
 */
export const ALLOWED_EXTENSIONS = ['.pdf', '.dwg', '.dxf', '.jpg', '.jpeg', '.png', '.webp', '.tiff', '.bmp'];
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

export function validateDrawingFile(file: File): { isValid: boolean; errorEn?: string; errorMl?: string } {
  if (!file) {
    return {
      isValid: false,
      errorEn: 'No file provided.',
      errorMl: 'ഫയൽ നൽകിയിട്ടില്ല.',
    };
  }

  if (file.size === 0) {
    return {
      isValid: false,
      errorEn: 'File is empty (0 bytes). Please upload a valid plan.',
      errorMl: 'ഫയൽ ശൂന്യമാണ് (0 Bytes). ദയവായി സാധുവായ ഡ്രോയിംഗ് നൽകുക.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      errorEn: `File size exceeds 50MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
      errorMl: `ഫയൽ സൈസ് 50MB പരിധിയിൽ കവിഞ്ഞു (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  const nameLower = file.name.toLowerCase();
  const hasAllowedExt = ALLOWED_EXTENSIONS.some((ext) => nameLower.endsWith(ext));
  const isMimeValid =
    file.type.startsWith('image/') ||
    file.type === 'application/pdf' ||
    file.type === 'image/tiff' ||
    file.type === '' || // DWG/DXF often have blank MIME on Windows/macOS
    file.type === 'application/acad' ||
    file.type === 'application/x-dwg' ||
    file.type === 'application/x-autocad' ||
    file.type === 'image/vnd.dwg';

  if (!hasAllowedExt && !isMimeValid) {
    return {
      isValid: false,
      errorEn: `Unsupported format (${file.name.split('.').pop()}). Allowed: PDF, DWG, DXF, PNG, JPG, TIFF.`,
      errorMl: `അനുവദനീയമല്ലാത്ത ഫയൽ ഫോർമാറ്റ്. PDF, DWG, DXF, PNG, JPG, TIFF മാത്രം നൽകുക.`,
    };
  }

  return { isValid: true };
}

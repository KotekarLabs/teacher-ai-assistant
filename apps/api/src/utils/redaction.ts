/**
 * Diagnostic log and error redaction utility.
 * Sanitizes credentials, API keys, bearer tokens, connection strings, and stack traces.
 */
const SENSITIVE_PATTERNS = [
  /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
  /sk-[A-Za-z0-9]{20,}/gi,
  /password["']?\s*[:=]\s*["'][^"']+["']/gi,
  /postgres(ql)?:\/\/[^:]+:[^@]+@[^/]+/gi,
];

export function redactSensitiveDiagnostics(text: string): string {
  if (!text) return text;
  let redacted = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    redacted = redacted.replace(pattern, "[REDACTED]");
  }
  return redacted;
}

export function createSafeErrorMessage(err: unknown, defaultMessage = "An unexpected error occurred"): string {
  if (err instanceof Error) {
    // Return sanitized message without stack traces or sensitive details
    return redactSensitiveDiagnostics(err.message);
  }
  if (typeof err === "string") {
    return redactSensitiveDiagnostics(err);
  }
  return defaultMessage;
}

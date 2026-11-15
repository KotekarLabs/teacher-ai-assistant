/**
 * Generic recursive deep-freeze utility.
 * Guarantees that objects, nested sub-objects, and arrays are permanently immutable at runtime.
 */
export function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // Freeze the current object or array
  Object.freeze(obj);

  // Recursively freeze all property values
  for (const key of Object.getOwnPropertyNames(obj)) {
    const value = (obj as Record<string, unknown>)[key];
    if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  }

  return obj as Readonly<T>;
}

export function isDeepFrozen(obj: unknown): boolean {
  if (obj === null || typeof obj !== "object") {
    return true;
  }
  if (!Object.isFrozen(obj)) {
    return false;
  }
  for (const key of Object.getOwnPropertyNames(obj)) {
    const value = (obj as Record<string, unknown>)[key];
    if (value !== null && typeof value === "object") {
      if (!isDeepFrozen(value)) {
        return false;
      }
    }
  }
  return true;
}

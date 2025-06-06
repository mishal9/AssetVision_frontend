/**
 * Case conversion utilities
 * Contains functions for converting between snake_case and camelCase
 */

/**
 * Converts a snake_case string to camelCase
 * @param str The snake_case string to convert
 * @returns The camelCase version of the string
 */
export function snakeToCamel(str: string): string {
  return str.replace(/([-_][a-z])/g, (group) => 
    group.toUpperCase()
      .replace('-', '')
      .replace('_', '')
  );
}

/**
 * Recursively converts object keys from snake_case to camelCase
 * @param obj The object with snake_case keys
 * @returns A new object with all keys converted to camelCase
 */
export function convertSnakeToCamelCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(convertSnakeToCamelCase) as unknown as T;
  }

  return Object.keys(obj).reduce((result, key) => {
    const camelKey = snakeToCamel(key);
    const value = obj[key];
    result[camelKey] = convertSnakeToCamelCase(value);
    return result;
  }, {} as any);
}

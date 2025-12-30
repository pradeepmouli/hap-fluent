/**
 * Type definitions for custom Vitest matchers
 */

export interface MatcherResult {
  pass: boolean;
  message: () => string;
}

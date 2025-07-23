/**
 * Core utility functions for the monorepo
 */

export const greet = (name: string): string => `Hello, ${name}!`;

export const add = (a: number, b: number): number => a + b;

export class Logger {
  private prefix: string;

  constructor(prefix = 'LOG') {
    this.prefix = prefix;
  }

  info(message: string): void {
    // eslint-disable-next-line no-console
    console.log(`[${this.prefix}] ${message}`);
  }

  error(message: string): void {
    // eslint-disable-next-line no-console
    console.error(`[${this.prefix}] ERROR: ${message}`);
  }
}

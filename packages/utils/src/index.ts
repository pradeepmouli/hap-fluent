import { Logger } from '@company/core';

/**
 * Utility functions that build on core functionality
 */

const logger = new Logger('UTILS');

export const formatDate = (date: Date): string => date.toISOString().split('T')[0];

export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const debounce = <T extends (...args: never[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const logAndReturn = <T>(value: T, message?: string): T => {
  logger.info(message ?? `Returning value: ${JSON.stringify(value)}`);
  return value;
};

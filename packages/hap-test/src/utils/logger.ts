/**
 * Debug logger for hap-test
 *
 * Provides detailed logging for troubleshooting and understanding test behavior
 */

export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

export interface LogEntry {
  timestamp: number;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
}

export class Logger {
  private static instance: Logger;
  private enabled: boolean = false;
  private logLevel: LogLevel = LogLevel.DEBUG;
  private logs: LogEntry[] = [];
  private categories: Set<string> = new Set();
  private maxLogs: number = 1000;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Enable debug logging
   */
  enable(level: LogLevel = LogLevel.DEBUG): void {
    this.enabled = true;
    this.logLevel = level;
  }

  /**
   * Disable debug logging
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Check if logging is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Set the minimum log level
   */
  setLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  /**
   * Set maximum number of logs to retain
   */
  setMaxLogs(max: number): void {
    this.maxLogs = max;
    this.trimLogs();
  }

  /**
   * Enable specific categories
   */
  enableCategories(...categories: string[]): void {
    categories.forEach((cat) => this.categories.add(cat));
  }

  /**
   * Disable specific categories
   */
  disableCategories(...categories: string[]): void {
    categories.forEach((cat) => this.categories.delete(cat));
  }

  /**
   * Clear category filters (log all categories)
   */
  clearCategoryFilters(): void {
    this.categories.clear();
  }

  /**
   * Log a debug message
   */
  debug(category: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  /**
   * Log an info message
   */
  info(category: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, category, message, data);
  }

  /**
   * Log a warning message
   */
  warn(category: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, category, message, data);
  }

  /**
   * Log an error message
   */
  error(category: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, category, message, data);
  }

  private log(level: LogLevel, category: string, message: string, data?: any): void {
    if (!this.enabled) return;
    if (!this.shouldLog(level, category)) return;

    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
    };

    this.logs.push(entry);
    this.trimLogs();

    // Output to console if enabled
    this.outputToConsole(entry);
  }

  private shouldLog(level: LogLevel, category: string): boolean {
    // Check log level
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    if (messageLevelIndex < currentLevelIndex) {
      return false;
    }

    // Check category filter
    if (this.categories.size > 0 && !this.categories.has(category)) {
      return false;
    }

    return true;
  }

  private outputToConsole(entry: LogEntry): void {
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}] [${entry.level}] [${entry.category}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.data || "");
        break;
      case LogLevel.INFO:
        console.info(message, entry.data || "");
        break;
      case LogLevel.WARN:
        console.warn(message, entry.data || "");
        break;
      case LogLevel.ERROR:
        console.error(message, entry.data || "");
        break;
    }
  }

  private trimLogs(): void {
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs filtered by category
   */
  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter((log) => log.category === category);
  }

  /**
   * Get logs filtered by level
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  /**
   * Clear all logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Reset logger to default state
   */
  reset(): void {
    this.enabled = false;
    this.logLevel = LogLevel.DEBUG;
    this.logs = [];
    this.categories.clear();
    this.maxLogs = 1000;
  }

  /**
   * Export logs as JSON
   */
  export(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

/**
 * Default logger instance
 */
export const logger = Logger.getInstance();

/**
 * Log categories for different subsystems
 */
export const LogCategory = {
  ACCESSORY: "accessory",
  SERVICE: "service",
  CHARACTERISTIC: "characteristic",
  EVENT: "event",
  NETWORK: "network",
  VALIDATION: "validation",
  HARNESS: "harness",
  TIME: "time",
} as const;

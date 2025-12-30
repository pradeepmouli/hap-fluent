/**
 * NetworkSimulator - Simulates network conditions for testing resilience
 *
 * Provides tools to inject latency, packet loss, and disconnection scenarios
 * into characteristic operations for testing error handling and recovery.
 */

import { NetworkError, NetworkErrorType } from "./errors/NetworkError.js";

export interface NetworkConditions {
  /** Network latency in milliseconds */
  latency: number;

  /** Packet loss rate (0.0 - 1.0) */
  packetLoss: number;

  /** Whether the network is disconnected */
  disconnected: boolean;
}

export class NetworkSimulator {
  private _conditions: NetworkConditions = {
    latency: 0,
    packetLoss: 0,
    disconnected: false,
  };

  /**
   * Set network latency for all operations
   * @param ms - Latency in milliseconds
   */
  setLatency(ms: number): void {
    if (ms < 0) {
      throw new Error("Latency cannot be negative");
    }
    this._conditions.latency = ms;
  }

  /**
   * Set packet loss rate
   * @param rate - Loss rate between 0.0 and 1.0
   */
  setPacketLoss(rate: number): void {
    if (rate < 0 || rate > 1) {
      throw new Error("Packet loss rate must be between 0 and 1");
    }
    this._conditions.packetLoss = rate;
  }

  /**
   * Simulate network disconnection
   */
  disconnect(): void {
    this._conditions.disconnected = true;
  }

  /**
   * Restore network connection
   */
  reconnect(): void {
    this._conditions.disconnected = false;
  }

  /**
   * Reset all network conditions to defaults
   */
  reset(): void {
    this._conditions = {
      latency: 0,
      packetLoss: 0,
      disconnected: false,
    };
  }

  /**
   * Get current network conditions
   */
  getConditions(): Readonly<NetworkConditions> {
    return { ...this._conditions };
  }

  /**
   * Apply network conditions to an operation
   * @throws NetworkError if disconnected or packet loss occurs
   */
  async applyConditions<T>(operation: () => Promise<T>): Promise<T> {
    // Check disconnection first
    if (this._conditions.disconnected) {
      throw new NetworkError(NetworkErrorType.DISCONNECTED, "Network disconnected");
    }

    // Simulate packet loss
    if (this._conditions.packetLoss > 0) {
      const random = Math.random();
      if (random < this._conditions.packetLoss) {
        throw new NetworkError(NetworkErrorType.PACKET_LOSS, "Packet lost");
      }
    }

    // Apply latency
    if (this._conditions.latency > 0) {
      await this.delay(this._conditions.latency);
    }

    // Execute operation
    return await operation();
  }

  /**
   * Delay execution by specified milliseconds
   */
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

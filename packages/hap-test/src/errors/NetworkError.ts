/**
 * Error thrown when network simulation encounters issues
 */
export class NetworkError extends Error {
	public readonly errorType: NetworkErrorType;
	public readonly context?: any;

	constructor(
		errorType: NetworkErrorType,
		message?: string,
		context?: any
	) {
		const suggestions = NetworkError.generateSuggestions(errorType, context);
		const fullMessage = [
			`🌐 Network simulation error: ${errorType}`,
			...(message ? [``, message] : []),
			...(context?.operation ? [`Operation attempted: ${context.operation}`] : []),
			...(context?.latency ? [`Current latency: ${context.latency}ms`] : []),
			...(context?.packetLoss ? [`Current packet loss: ${context.packetLoss * 100}%`] : []),
			...(context?.disconnected !== undefined ? [`Network state: ${context.disconnected ? 'DISCONNECTED' : 'CONNECTED'}`] : []),
			...(suggestions.length > 0 ? [``, `💡 Suggestions:`, ...suggestions.map(s => `  • ${s}`)] : []),
		].join('\n');
		
		super(fullMessage);
		
		this.name = 'NetworkError';
		this.errorType = errorType;
		this.context = context;
		
		// Maintain proper stack trace
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, NetworkError);
		}
	}

	private static generateSuggestions(errorType: NetworkErrorType, _context?: any): string[] {
		const suggestions: string[] = [];

		switch (errorType) {
			case NetworkErrorType.DISCONNECTED:
				suggestions.push('The network is simulating a disconnect condition');
				suggestions.push('Call networkSimulator.reconnect() to restore connectivity');
				suggestions.push('This tests how your plugin handles network outages');
				break;

			case NetworkErrorType.PACKET_LOSS:
				suggestions.push('Packets are being randomly dropped based on configured loss rate');
				suggestions.push('This is expected behavior for resilience testing');
				suggestions.push('Implement retry logic in your plugin to handle packet loss');
				suggestions.push('Call networkSimulator.setPacketLoss(0) to disable packet loss');
				break;

			case NetworkErrorType.TIMEOUT:
				suggestions.push('Operation exceeded network timeout threshold');
				suggestions.push('Check if latency settings are too high for the operation');
				suggestions.push('Consider implementing timeout handling in your plugin');
				break;

			case NetworkErrorType.CONNECTION_REFUSED:
				suggestions.push('Simulating a refused connection (e.g., service not running)');
				suggestions.push('Test your plugin\'s error handling for unreachable devices');
				break;

			case NetworkErrorType.CONNECTION_RESET:
				suggestions.push('Connection was reset during the operation');
				suggestions.push('Implement reconnection logic in your plugin');
				break;

			case NetworkErrorType.NETWORK_UNREACHABLE:
				suggestions.push('Network is unreachable (e.g., no route to host)');
				suggestions.push('Test offline behavior and graceful degradation');
				break;

			default:
				suggestions.push('Check network simulator configuration');
				suggestions.push('Review the NetworkSimulator API documentation');
		}

		suggestions.push('Use networkSimulator.reset() to clear all network conditions');

		return suggestions;
	}
}

/**
 * Types of network errors that can be simulated
 */
export enum NetworkErrorType {
	/** Connection refused */
	CONNECTION_REFUSED = 'connection-refused',
	
	/** Connection timeout */
	TIMEOUT = 'timeout',
	
	/** Connection reset */
	CONNECTION_RESET = 'connection-reset',
	
	/** DNS resolution failure */
	DNS_FAILURE = 'dns-failure',
	
	/** Network unreachable */
	NETWORK_UNREACHABLE = 'network-unreachable',
	
	/** SSL/TLS error */
	SSL_ERROR = 'ssl-error',
	
	/** Network disconnected */
	DISCONNECTED = 'disconnected',
	
	/** Packet loss */
	PACKET_LOSS = 'packet-loss',
}

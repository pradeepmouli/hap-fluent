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
		const fullMessage = message || `Network error: ${errorType}`;
		super(fullMessage);
		
		this.name = 'NetworkError';
		this.errorType = errorType;
		this.context = context;
		
		// Maintain proper stack trace
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, NetworkError);
		}
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
}

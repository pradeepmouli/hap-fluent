/**
 * Error thrown when characteristic validation fails
 */
export class CharacteristicValidationError extends Error {
	public readonly characteristicType: string;
	public readonly value: any;
	public readonly constraint: string;
	public readonly context?: any;

	constructor(
		characteristicType: string,
		value: any,
		constraint: string,
		context?: any
	) {
		const message = `Characteristic validation failed for "${characteristicType}": ${constraint}. Value: ${JSON.stringify(value)}`;
		super(message);
		
		this.name = 'CharacteristicValidationError';
		this.characteristicType = characteristicType;
		this.value = value;
		this.constraint = constraint;
		this.context = context;
		
		// Maintain proper stack trace
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, CharacteristicValidationError);
		}
	}
}

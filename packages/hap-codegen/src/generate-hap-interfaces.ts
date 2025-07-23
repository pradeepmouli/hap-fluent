/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Extracts HAP services from the TypeScript definition file.
 * @param tsFile Path to the TypeScript file containing service definitions.
 * @returns Array of service definitions with required and optional characteristics.
 */

import camelcase from 'camelcase';
import { Characteristic, Formats, Service } from 'hap-nodejs';
import fs from 'node:fs';
import path from 'node:path';
import 'reflect-metadata';
import { Project, SyntaxKind } from 'ts-morph';

const interfacesPath = path.resolve(
	'../hap-fluent/src/types/hap-interfaces.ts'
);
const enumsPath = path.resolve('../hap-fluent/hap-enums.ts');

type ServiceCharacteristics = {
	required: {
		name: string;
		UUID: string;
		className: string;
		label?: string;
		type: string;
	}[];
	optional: {
		name: string;
		UUID: string;
		className: string;
		type: string;
		label?: string;
	}[];
};

/// Extracts static readonly properties from a Characteristic instance
export function extractEnumsFromCharacteristic(char: Characteristic): string[] {
	// Get the constructor function
	const ctor = Object.getPrototypeOf(char).constructor;
	// Get all static properties
	const staticProps = Object.getOwnPropertyNames(ctor).filter(
		(key) =>
			key === key.toUpperCase() &&
			typeof (ctor as any)[key] !== 'function' &&
			key !== 'UUID'
	);
	// Filter for static readonly properties (enums)

	return staticProps.map(
		(key) => `${camelcase(key, { pascalCase: true })} = ${(ctor as any)[key]}`
	);
}

function extractValueTypeFromCharacteristic(char: Characteristic): string {
	// This function can be extended to extract more specific types if needed

	if (char.props?.validValues) {
		return `(${char.props.validValues.join(' | ')})`;
	} else if (char.props.format as Formats) {
		switch (char.props.format) {
			case Formats.BOOL:
				return 'boolean';
			case Formats.UINT8:
				return 'number';
			case Formats.UINT16:
				return 'number';
			case Formats.UINT32:
				return 'number';
			case Formats.INT:
				return 'number';
			case Formats.FLOAT:
				return 'number';
			case Formats.STRING:
				return 'string';
			case Formats.DATA:
				return 'Buffer';
			case Formats.TLV8:
				return 'Buffer';
			case Formats.UINT64:
				return 'number';
		}
	}

	return 'any'; // Fallback type
}

function extractCharacteristicsFromService(
	service: Service
): ServiceCharacteristics {
	const required: {
		UUID: string;
		name: string;
		className: string;
		type: string;
		label?: string;
	}[] = [];
	service.characteristics.forEach((char) => {
		required.push({
			name: char.displayName,
			type: extractValueTypeFromCharacteristic(char),
			className: Object.getPrototypeOf(char).constructor.name,
			label: char.displayName,
			UUID: char.UUID
		});
		console.warn(
			`Required characteristic ${char.displayName} of type ${Object.getPrototypeOf(char).constructor.name} in service ${service.displayName} may not be supported by all platforms.`
		);
	});
	const optional: {
		UUID: string;
		name: string;
		className: string;
		type: string;
		label?: string;
	}[] = [];
	service.optionalCharacteristics.forEach((char) => {
		optional.push({
			name: char.displayName,
			className: Object.getPrototypeOf(char).constructor.name,
			type: extractValueTypeFromCharacteristic(char),
			label: char.displayName,
			UUID: char.UUID
		});
		console.warn(
			`Optional characteristic ${char.displayName} of type ${Object.getPrototypeOf(char).constructor.name} in service ${service.displayName} may not be supported by all platforms.`
		);
	});

	console.log(
		`Extracted ${required.length} required and ${optional.length} optional characteristics from service ${service.displayName}`
	);
	if (required.length === 0 && optional.length === 0) {
		console.warn(
			`Warning: Service ${service.displayName} has no characteristics defined.`
		);
	}
	return { required, optional };
}

function extractServicesFromNamespace() {
	return Object.entries(Service)
		.map(([name, service]) => {
			if (
				typeof service !== 'function' &&
				!(service.prototype instanceof Service)
			) {
				console.warn(
					`Skipping ${name} as it is not a valid Service constructor.`
				);
				return null;
			}
			console.warn(`Extracting service ${name} of type ${service.name}.`);
			const serviceInstance = new service() as Service;

			const { required, optional } =
				extractCharacteristicsFromService(serviceInstance);
			return {
				name,
				required,
				optional,
				UUID: serviceInstance.UUID
			};
		})
		.filter((value) => value !== null) satisfies Array<{
		name: string;
		UUID: string;
		required: { name: string; type: string }[];
		optional: { name: string; type: string }[];
	}>;
}

function extractCharacteristicsFromNamespace() {
	return Object.entries(Characteristic).reduce(
		(p, [name, char]) => {
			if (
				typeof char !== 'function' ||
				!(char.prototype instanceof Characteristic)
			) {
				console.warn(
					`Skipping ${name} as it is not a valid Characteristic instance.`
				);
				return p;
			} else {
				console.warn(
					`Extracting characteristic ${name} of type ${Object.getPrototypeOf(char).constructor.name}.`
				);
				const cha = new char() as Characteristic;
				const e = extractEnumsFromCharacteristic(cha);
				if (e?.length > 0) {
					p[name] = { type: `Enums.${name}`, enums: e };
				} else {
					const t = extractValueTypeFromCharacteristic(cha);
					p[name] = { type: t };
				}
			}

			return p;
		},
		{} as Record<string, { type: string; enums?: string[] }> // Changed to include enums
	);
}

function extractServices(tsFile: string) {
	const project = new Project();
	const sourceFile = project.addSourceFileAtPath(tsFile);
	const services: Array<{
		name: string;
		required: string[];
		optional: string[];
	}> = [];

	sourceFile.getClasses().forEach((cls) => {
		if (cls.getExtends()?.getText() !== 'Service') {
			return;
		}

		const name = cls.getName();
		const required: string[] = [];
		const optional: string[] = [];
		const ctor = cls.getConstructors()[0];
		if (ctor) {
			ctor.getBody()?.forEachDescendant((node) => {
				if (node.getKind() === SyntaxKind.CallExpression) {
					const text = node.getText();
					if (text.includes('this.addCharacteristic(')) {
						const match = text.match(/this\.addCharacteristic\((\w+)/);
						if (match) {
							required.push(match[1]);
						}
					}
					if (text.includes('this.addOptionalCharacteristic(')) {
						const match = text.match(/this\.addOptionalCharacteristic\((\w+)/);
						if (match) {
							optional.push(match[1]);
						}
					}
				}
			});
		}
		services.push({ name: name || '', required, optional });
	});
	console.log(`Found ${services.length} services`);
	return services;
}

function extractCharacteristics(tsFile: string) {
	const project = new Project();
	const sourceFile = project.addSourceFileAtPath(tsFile);
	const characteristics: Record<string, string> = {};
	sourceFile.getClasses().forEach((cls) => {
		if (cls.getExtends()?.getText() !== 'Characteristic') {
			return;
		}
		const name = cls.getName();
		characteristics[name || ''] = 'any'; // TODO: Map to actual type
	});
	return characteristics;
}

function generateEnums(
	characteristics: Record<string, { type: string; enums?: string[] }> = {}
) {
	let output = '// Auto-generated HAP Enums\n\n';
	output += "import { Characteristic } from 'hap-nodejs';\n\n";
	output += 'export namespace Enums {\n';
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for (const [name, { type, enums }] of Object.entries(characteristics)) {
		if (enums && enums.length > 0) {
			output += `export const enum ${name} {\n`;
			if (enums) {
				for (const enumValue of enums) {
					output += `\t${enumValue},\n`;
				}
			}
			output += '}\n\n';
		}
	}
	output += '}\n\n'; // Close the Enums namespace
	// Add a note about auto-generation

	return output;
}

function generateInterfaces(
	services: Array<{
		name: string;
		UUID: string;
		required: {
			name: string;
			className: string;
			type: string;
			label?: string;
		}[];
		optional: {
			name: string;
			className: string;
			type: string;
			label?: string;
		}[];
	}>,
	characteristics: Record<string, { type: string; enums?: string[] }> = {}
) {
	let output = '// Auto-generated HAP Service Interfaces\n\n';
	output += "import { Characteristic } from 'hap-nodejs';\n\n";
	output += "import { Enums } from './hap-enums.js';\n\n";
	for (const service of services) {
		output += `export interface ${service.name} {\n`;
		for (const char of service.required) {
			output += `  ${camelcase(char.name)}: ${characteristics[char.className]?.type ?? 'any'};\n`;
		}
		for (const char of service.optional) {
			output += `  ${camelcase(char.name)}?: ${characteristics[char.className]?.type ?? 'any'};\n`;
		}
		output += '}\n\n';
	}
	output += 'export type InterfaceMap = {\n';
	for (const service of services) {
		output += `  ${service.name}: ${service.name};\n`;
	} // Close the ServiceMap interface
	output += '}\n\n';
	output += 'export type ServiceMap = {\n';
	for (const service of services) {
		output += `  ${service.name}: typeof Service.${service.name};\n`;
	} // Close the ServiceMap interface
	output += '}\n\n';
	output +=
		"declare module 'hap-nodejs/dist/lib/definitions/ServiceDefinitions' {";
	// Add module augmentations
	for (const service of services) {
		output += `\n namespace ${service.name} { export const interface: InterfaceMap['${service.name}']; }`;
	}
	// Close the module augmentation
	output += '\n}';

	return output;
}

const services = extractServicesFromNamespace();
const characteristics = extractCharacteristicsFromNamespace();
const tsEnums = generateEnums(characteristics);
fs.writeFileSync(enumsPath, tsEnums);
console.log('Generated hap-enums.ts');
const tsInterfaces = generateInterfaces(services, characteristics);
fs.writeFileSync(interfacesPath, tsInterfaces);
console.log('Generated hap-interfaces.ts');

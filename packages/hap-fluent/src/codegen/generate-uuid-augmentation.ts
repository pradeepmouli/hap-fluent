// Code generator to create UUID module augmentation with actual UUID values from HAP-NodeJS
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface ServiceInfo {
  name: string;
  uuid: string;
}

/**
 * Extract UUID values from HAP-NodeJS ServiceDefinitions.js
 */
function extractServiceUUIDs(): ServiceInfo[] {
  try {
    // Read the HAP-NodeJS ServiceDefinitions.js file
    const serviceDefPath = join(process.cwd(), 'node_modules/hap-nodejs/dist/lib/definitions/ServiceDefinitions.js');
    const content = readFileSync(serviceDefPath, 'utf-8');
    
    const services: ServiceInfo[] = [];
    
    // Extract UUID assignments using regex
    // Pattern: ServiceName.UUID = "UUID-VALUE";
    const uuidPattern = /(\w+)\.UUID\s*=\s*"([A-F0-9-]+)"/gi;
    let match;
    
    while ((match = uuidPattern.exec(content)) !== null) {
      const [, serviceName, uuid] = match;
      services.push({ name: serviceName, uuid });
    }
    
    return services.filter(service => {
      // Only include services we support in our mapping
      const supportedServices = [
        'AccessoryInformation',
        'AirPurifier', 
        'AirQualitySensor',
        'TemperatureSensor',
        'HumiditySensor',
        'FilterMaintenance',
        'Fan',
        'Switch'
      ];
      return supportedServices.includes(service.name);
    });
  } catch (error) {
    console.error('Failed to extract UUIDs from HAP-NodeJS:', error);
    return [];
  }
}

/**
 * Generate TypeScript module augmentation with literal UUID types
 */
function generateUUIDAugmentation(services: ServiceInfo[]): string {
  const serviceInterfaces = services.map(service => 
    `    interface ${service.name} {\n      static readonly UUID: '${service.uuid}';\n    }`
  ).join('\n\n');

  const conditionalUUIDs = services.map((service, index) => {
    const condition = `this extends Service.${service.name} ? '${service.uuid}'`;
    return index === 0 ? condition : `      : ${condition}`;
  }).join('\n');

  return `// Module augmentation to provide string literal UUID types for HAP-NodeJS services
// This enhances type safety by changing UUID from generic string to specific literals
// Auto-generated from HAP-NodeJS ServiceDefinitions.js

declare module 'hap-nodejs' {
  namespace Service {
    // Augment each service class to have literal UUID types
${serviceInterfaces}
  }

  // Augment the base Service class to use literal UUID types when known
  interface Service {
    readonly UUID: ${conditionalUUIDs}
      : string;
  }

  // Enhance WithUUID type to preserve literal UUID types
  type WithUUID<T> = T extends { UUID: infer U extends string }
    ? T & { UUID: U }
    : T & { UUID: string };
}

// Export utility types for working with literal UUIDs
export type ServiceUUIDs = {
${services.map(s => `  ${s.name}: '${s.uuid}';`).join('\n')}
};

export type UUIDFor<T extends keyof ServiceUUIDs> = ServiceUUIDs[T];

// Type guard to check if a UUID matches a specific service
export function isUUIDForService<T extends keyof ServiceUUIDs>(
  uuid: string,
  serviceName: T
): uuid is ServiceUUIDs[T] {
  const serviceUUIDs: ServiceUUIDs = {
${services.map(s => `    ${s.name}: '${s.uuid}',`).join('\n')}
  };
  return uuid === serviceUUIDs[serviceName];
}
`;
}

/**
 * Main function to generate and write the UUID augmentation file
 */
function main() {
  console.log('Extracting UUID values from HAP-NodeJS...');
  const services = extractServiceUUIDs();
  
  if (services.length === 0) {
    console.error('No service UUIDs found. Check HAP-NodeJS installation.');
    process.exit(1);
  }
  
  console.log(`Found ${services.length} service UUIDs:`, services.map(s => s.name));
  
  const augmentation = generateUUIDAugmentation(services);
  const outputPath = join(__dirname, '../types/uuid-module-augmentation.ts');
  
  writeFileSync(outputPath, augmentation);
  console.log(`Generated UUID module augmentation: ${outputPath}`);
}

if (require.main === module) {
  main();
}
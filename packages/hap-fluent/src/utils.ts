import camelcase from "camelcase";

export function camelCase(str: string): string {
  return camelcase(str, { pascalCase: false });
}

export function PascalCase(str: string): string {
  return camelcase(str, { pascalCase: true });
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

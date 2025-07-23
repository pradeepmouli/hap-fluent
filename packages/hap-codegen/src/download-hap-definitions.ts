import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';

const files = [
	{
		url: 'https://raw.githubusercontent.com/homebridge/HAP-NodeJS/latest/src/lib/definitions/ServiceDefinitions.ts',
		dest: path.resolve(__dirname, '../ServiceDefinitions.ts')
	},
	{
		url: 'https://raw.githubusercontent.com/homebridge/HAP-NodeJS/latest/src/lib/definitions/CharacteristicDefinitions.ts',
		dest: path.resolve(__dirname, '../CharacteristicDefinitions.ts')
	}
];

function downloadFile(url: string, dest: string): Promise<void> {
	return new Promise((resolve, reject) => {
		https
			.get(url, (res) => {
				if (res.statusCode !== 200) {
					reject(new Error(`Failed to get '${url}' (${res.statusCode})`));
					return;
				}
				const fileStream = fs.createWriteStream(dest);
				res.pipe(fileStream);
				fileStream.on('finish', () => {
					fileStream.close();
					resolve();
				});
			})
			.on('error', (err) => {
				reject(err);
			});
	});
}

async function main() {
	for (const file of files) {
		console.log(`Downloading ${file.url} ...`);
		await downloadFile(file.url, file.dest);
		console.log(`Saved to ${file.dest}`);
	}
	console.log('All files downloaded.');
}

main().catch((err) => {
	console.error('Download failed:', err);
	process.exit(1);
});

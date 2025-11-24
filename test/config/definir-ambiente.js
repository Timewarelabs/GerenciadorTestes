import fs from 'fs';
import path from 'path';

const ENV_FILE = path.join(process.cwd(), 'test', 'config', 'ambiente-escolhido.json');

const envName = process.argv[2] || 'prod';
const config = { env: envName.toLowerCase() };
fs.writeFileSync(ENV_FILE, JSON.stringify(config, null, 2));
console.log(`Ambiente configurado para: ${envName}`);

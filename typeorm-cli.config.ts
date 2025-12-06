import { DataSource } from 'typeorm';
import { readFileSync } from 'fs';

import * as fs from 'fs';

// Only load .env if the file actually exists (Development mode)
if (fs.existsSync('.env')) {
  process.loadEnvFile();
}

export default new DataSource({
  type: 'mysql',
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT
    ? parseInt(process.env.TYPEORM_PORT, 10)
    : 3306,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  entities: [],
  migrations: [],
  ssl: process.env.SSL_CA_CERT_PATH
    ? {
        ca: readFileSync(process.env.SSL_CA_CERT_PATH),
      }
    : undefined,
});

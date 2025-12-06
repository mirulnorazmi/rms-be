import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConsoleLogger, Logger, ValidationPipe } from '@nestjs/common';
import { configureSwaggerDocs } from './helpers/configure-swagger-docs.helper';
import { configureAuthSwaggerDocs } from './helpers/configure-auth-swagger-docs.helper';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { registerFastifyPlugins } from './common/plugins/register-fastify.plugins.js';
import { validateSchemaEnv } from './helpers/validation-schema-env';
import { DataSource } from 'typeorm';

import fs from 'fs';

// Only load .env if the file actually exists (Development mode)
if (fs.existsSync('.env')) {
  process.loadEnvFile();
}

validateSchemaEnv(process.env);

async function bootstrap() {
  const fastifyAdapter = new FastifyAdapter();
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    fastifyAdapter,
    {
      logger: new ConsoleLogger({
        json: true,
        colors: true,
      }),
    },
  );

  // Plugins for Fastify
  await registerFastifyPlugins(app);

  // Check MySQL connection
  try {
    const dataSource = app.get(DataSource);
    if (dataSource.isInitialized) {
      Logger.log('MySQL successfully connected', 'Database');
    }
  } catch (error) {
    Logger.error('MySQL connection failed', error, 'Database');
  }

  // Swagger Configurations
  configureAuthSwaggerDocs(app);
  configureSwaggerDocs(app);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // app.enableCors();
  
  // Azure uses 'PORT'. We must check that first.
const port = process.env.PORT || process.env.SERVER_PORT || 3000;

// Log the port so we can verify it in Azure Log Stream
Logger.log(`Application listening on port: ${port}`, 'Bootstrap');

await app.listen(port, '0.0.0.0');

  if (process.env.NODE_ENV !== 'production') {
    Logger.debug(
      `${await app.getUrl()} - Environment: ${process.env.NODE_ENV}`,
      'Environment',
    );

    Logger.debug(`Url for OpenApi: ${await app.getUrl()}/docs`, 'Swagger');
  }
}
bootstrap();

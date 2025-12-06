import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PropertiesModule } from './properties/properties.module';
import { UnitsModule } from './units/units.module';
import { ContractsModule } from './contracts/contracts.module';
import { PaymentsModule } from './payments/payments.module';
import { DocumentsModule } from './documents/documents.module';
import { MaintenanceIssuesModule } from './maintenance-issues/maintenance-issues.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { IamModule } from './iam/iam.module';
import { readFileSync } from 'fs';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.TYPEORM_HOST,
        port: process.env.TYPEORM_PORT ? parseInt(process.env.TYPEORM_PORT, 10) : 3306,
        username: process.env.TYPEORM_USERNAME,
        password: process.env.TYPEORM_PASSWORD,
        database: process.env.TYPEORM_DATABASE,
        // Turn off synchronize to avoid automatic schema changes
        synchronize: false,
        entities: [__dirname + '/**/*.{model,entity}.{ts,js}'],
        migrations: ['dist/migrations/**/*.js'],
        subscribers: ['dist/subscriber/**/*.js'],
        cli: {
          migrationsDir: process.env.TYPEORM_MIGRATIONS_DIR,
          subscribersDir: process.env.TYPEORM_SUBSCRIBERS_DIR,
        },
        ssl: process.env.SSL_CA_CERT_PATH
          ? {
              ca: readFileSync(process.env.SSL_CA_CERT_PATH),
            }
          : undefined,
      }),
    }),
    IamModule,
    UsersModule,
    RolesModule,
    NotificationsModule,
    PropertiesModule,
    UnitsModule,
    ContractsModule,
    PaymentsModule,
    DocumentsModule,
    MaintenanceIssuesModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}

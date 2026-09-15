import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { UsersModule } from './users/users.module.js';
import { FilesModule } from './files/files.module.js';
import { JobsModule } from './jobs/jobs.module.js';
import { EventsModule } from './events/events.module.js';
import { User } from './users/entities/user.entity.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbHost = configService.get<string>('DB_HOST', 'localhost');
        const isRemoteDb =
          dbHost &&
          !dbHost.includes('localhost') &&
          !dbHost.includes('127.0.0.1');

        return {
          type: 'postgres',
          host: dbHost,
          port: configService.get<number>('DB_PORT', 5432),
          username:
            configService.get<string>('DB_USER') ||
            configService.get<string>('DB_USERNAME') ||
            'postgres',
          password: configService.get<string>('DB_PASSWORD', 'postgres'),
          database: configService.get<string>('DB_NAME', 'aws_example'),
          entities: [User],
          synchronize: true,
          ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
        };
      },
    }),
    UsersModule,
    FilesModule,
    JobsModule,
    EventsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

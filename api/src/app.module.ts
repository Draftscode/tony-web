import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './features/auth/auth.module';
import { BlaudirektModule } from './features/blaudirekt/blaudirekt.module';
import { FilesModule } from './features/files/files.module';
import { LinksModule } from './features/links/links.module';
import { RolesModule } from './features/roles/roles.module';
import { UserModule } from './features/users/users.module';
import { BrokerModule } from './features/broker/broker.module';
import { NotesModule } from './features/notes/notes.module';

@Module({
  imports: [
    RolesModule,
    AuthModule,
    LinksModule,
    BrokerModule,
    NotesModule,
    UserModule,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
      ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        synchronize: true,
        retryAttempts: 10,
        retryDelay: 3000,
        migrationsRun: true,
      }),
      inject: [ConfigService],
    }),
    FilesModule,
    BlaudirektModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

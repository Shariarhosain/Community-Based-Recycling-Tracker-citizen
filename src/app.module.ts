import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CitizenModule } from './citizen/citizen.module';

@Module({
  imports: [ TypeOrmModule.forRoot({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'root',
    database: 'project',
    entities: [__dirname + '/**/*.entity{.ts,.js}'],
    synchronize: true,
  }),CitizenModule],
  controllers: [],
  providers: [],
})
export class AppModule {}

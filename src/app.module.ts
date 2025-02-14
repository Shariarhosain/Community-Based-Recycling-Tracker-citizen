import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CitizenModule } from './citizen/citizen.module';
import { AuthModule } from './auth/auth.module';
import { MailerService } from './mailer/mailer.service';
import { JwtStrategy } from './jwt.strategy/jwt.strategy';
import { CorsMiddleware } from './cors.middleware';  // Import the middleware
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'project',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    CitizenModule,
    AuthModule,
    ServeStaticModule.forRoot({
      rootPath: join('E:', 'Js', 'project5.0', 'uploads'),  // Path to your images
      serveRoot: '/uploads',  // This is the base URL for images
    }),
   
  ],
  controllers: [],
  providers: [MailerService, JwtStrategy],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply the middleware only for the /uploads path
    consumer.apply(CorsMiddleware).forRoutes('/uploads/*');
  }
}

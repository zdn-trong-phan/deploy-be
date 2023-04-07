import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();
// Import firebase-admin
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { ServiceAccount } from 'firebase-admin';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService: ConfigService = app.get(ConfigService);
  // Set config options
  const adminConfig: ServiceAccount = {
    projectId: configService.get('FIREBASE_PROJECT_ID'),
    privateKey: configService.get('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    clientEmail: configService.get('FIREBASE_CLIENT_EMAIL'),
  };
  //Initialize the firebase admin app
  admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    databaseURL: 'https://dinder-36863.firebaseio.com',
  });

  const config = new DocumentBuilder()
    .setTitle('Zodinet Dating App API')
    .setDescription('All APIs in Zodinet Dating App')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();
  SwaggerModule.setup('api', app, document);
  await app.listen(`${process.env.PORT}` || 8080);
}
bootstrap();

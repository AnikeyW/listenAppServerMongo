import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config();

const httpsOptions = {
  // key: fs.readFileSync('./secrets/cert.key'),
  key: fs.readFileSync('./secrets/localhost-key.pem'),
  cert: fs.readFileSync('./secrets/localhost.pem'),
  // cert: fs.readFileSync('./secrets/cert.crt'),
};

async function bootstrap() {
  let app;
  if (process.env.NODE_ENV === 'development') {
    app = await NestFactory.create(AppModule, { httpsOptions });
  } else {
    app = await NestFactory.create(AppModule);
  }
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.CLIENT_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    credentials: true,
    optionsSuccessStatus: 200,
  });
  await app.listen(5000);
}
bootstrap();

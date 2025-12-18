import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { urlencoded } from 'express';
import ms from 'ms';
import { join } from 'path';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Wedding CRM')
    .setDescription('Wedding CRM')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        in: 'header',
      },
      'jwt',
    )
    .addServer('api/v1')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: false,
      tryItOutEnabled: true,
      cache: false,
      url: `/api-docs-json?v=${Date.now()}`,
    },
  });

  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.enableCors({
    origin: [
      'https://crm.team69vn.com',
      'https://disavow.team69vn.com',
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useStaticAssets(join(__dirname, '..', 'public/images'), {
    prefix: '/images',
  });
  app.setGlobalPrefix('api/v1');
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector));
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 4002;
  app.getHttpServer().setTimeout(ms('2.5 hrs'));

  // 👉 Bull-board integration is disabled in current refactor

  await app.listen(port, '0.0.0.0');

  console.log(`Server is running on port http://localhost:${port}`);
  console.log(`Swagger is running on http://localhost:${port}/api-docs`);
  console.log(`Bull Board is running on http://localhost:${port}/admin/queues`);
}
bootstrap();

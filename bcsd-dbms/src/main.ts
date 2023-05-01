import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Request, Response, NextFunction } from 'express';

import { AppModule } from './app.module';

async function bootstrap() {
  // Nest Application with Express Platform.
  const app: NestExpressApplication
    = await NestFactory.create<NestExpressApplication>(AppModule);

  // What we should listen on.
  const host = process.env.HOST || '127.0.0.1';
  const port = process.env.PORT || 80;

  // Assign global url path prefix to all endpoints.
  // So then otherwise-unqalified "employees" is under /api/employees and so on.
  app.setGlobalPrefix('/api');

  // Widening the allowed origins from the default is required in order for
  // our client BCSD-WEBAPP on port 8080 to not be denied access with
  // "...is not allowed by access-control-allow-origin. status code 200".
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
  });
  app.enableCors({
    origin: ['http://'+host+':'+port],
  });

  // Generate Swagger docs from the implementing code.
  // This produces multiple endpoints, each with a different format of the docs:
  //    /api/api-docs
  //    /api/api-docs-json
  //    /api/api-docs-yaml
  const config = new DocumentBuilder()
    .setTitle('bcsd-dbms')
    .setVersion('0.0.1')
    .setDescription('Province of British Columbia - Staff Directory (BCSD) - DBMS')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/api-docs', app, document);

  // Listen on specified host and port.
  await app.listen(port, host, () => console.log('Listening on '+host+':'+port));
}

bootstrap();

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import { Logger, LoggerErrorInterceptor } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);

  app.useLogger(app.get(Logger));
  app.useGlobalInterceptors(new LoggerErrorInterceptor());

  app.setGlobalPrefix(config.get<string>('apiPrefix'));
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());
  app.use(cookieParser());
  app.use(mongoSanitize({ replaceWith: '_' }));

  const origins = config.get<string[]>('corsOrigins');
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || origins.includes(origin)) return callback(null, true);
      // Allow Netlify deploy previews for the public + admin sites.
      if (/^https:\/\/[a-z0-9-]+--somoyon(du)?(-admin)?\.netlify\.app$/.test(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} is not allowed by CORS`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  });

  if (config.get('env') !== 'production' || config.get('swagger.password')) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('সময়ন CMS API')
      .setDescription('Content API for the Somoyon organisation website')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('public', 'Anonymous read endpoints consumed by the public site')
      .addTag('auth', 'Admin authentication')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  app.enableShutdownHooks();

  const port = config.get<number>('port');
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`Somoyon API running on :${port}/${config.get('apiPrefix')}`);
}

bootstrap();

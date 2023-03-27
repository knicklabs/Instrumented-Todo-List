import './telemetry/tracing';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  // Express middleware that runs on every request. If the request is a DELETE
  // request we will set the telemetry sampling priority to 1. This will
  // make sure we trace 100% of delete requests even if we are only capturing
  // a percentage of traces.
  app.use((req, res, next) => {
    if (req.method.toLowerCase() === 'delete') {
      req.sampler.setAttributes({
        samplingPriority: 1,
      });
    }
    next();
  });
  // Express middleware that runs on error and sets the telemetry
  // samling priority to 1. If we are only capturing a percentage of traces,
  // this will ensure that we always capture 100% of traces on error.
  // Based off of https://blog.shalvah.me/posts/a-practical-tracing-journey-with-opentelemetry-on-node-js
  app.use((err, req, res, next) => {
    req.sampler.setAttributes({
      samplingPriority: 1,
    });
    next(err);
  });
  await app.listen(3000);
}
bootstrap();

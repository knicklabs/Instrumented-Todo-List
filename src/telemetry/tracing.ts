// Adapted from https://github.com/open-telemetry/opentelemetry-js/tree/main/examples/otlp-exporter-node

import {
  NodeTracerProvider,
  SimpleSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-node';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';
import { registerInstrumentations } from '@opentelemetry/instrumentation';

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const exporter = new OTLPTraceExporter({
  url: 'http://collector:4318/v1/traces',
});

const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'todo-list',
  }),
});

registerInstrumentations({
  tracerProvider: provider,
  instrumentations: [
    new PgInstrumentation(),
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new NestInstrumentation(),
  ],
});

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
provider.register();

const metricExporter = new OTLPMetricExporter({
  url: 'http://collector:4318/v1/metrics',
});

const meterProvider = new MeterProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'todo-list',
  }),
});

meterProvider.addMetricReader(
  new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 1000,
  }),
);

const meter = meterProvider.getMeter('todo-list-collector');

const requestCounter = meter.createCounter('request_counter', {
  description: 'Request Counter',
});

const upDownCounter = meter.createUpDownCounter('up_down_counter', {
  description: 'Up/Down Counter',
});

const histogram = meter.createHistogram('histogram', {
  description: 'Histogram',
});

const attributes = { pid: process.pid, environment: 'development' };

setInterval(() => {
  requestCounter.add(1, attributes);
  upDownCounter.add(Math.random() > 0.5 ? 1 : -1, attributes);
  histogram.record(Math.random(), attributes);
}, 1000);

/**

// Adapted from https://developers.redhat.com/articles/2022/08/23/how-use-opentelemetry-trace-nodejs-applications
//         and  https://www.npmjs.com/package/@opentelemetry/exporter-trace-otlp-http

// SDK

import { NodeSDK } from '@opentelemetry/sdk-node';

// Express, postgres, and http instrumentation
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PgInstrumentation } from '@opentelemetry/instrumentation-pg';

// Collector trace exporter
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import {
  BatchSpanProcessor,
  WebTracerProvider,
} from '@opentelemetry/sdk-trace-web';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

export async function initTracing() {
  // Tracer provider
  const provider = new WebTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'todo-list ',
    }),
  });

  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation(),
      new ExpressInstrumentation(), // NestJS is built on top of Express
      new NestInstrumentation(),
      new PgInstrumentation(),
    ],
  });

  // Trace exporter
  const traceExporter = new OTLPTraceExporter();
  provider.addSpanProcessor(new BatchSpanProcessor(traceExporter));
  provider.register();

  // SDK configuration and startup
  const sdk = new NodeSDK({ traceExporter });

  try {
    await sdk.start();
    console.log('Tracing initialized');
  } catch (error) {
    console.error('Error initializing tracing', error);
  }

  process.on('SIGINT', async () => {
    try {
      await sdk.shutdown();
      console.log('Tracing terminated');
    } catch (error) {
      console.error('Error terminating tracing', error);
    } finally {
      process.exit(0);
    }
  });
}
*/
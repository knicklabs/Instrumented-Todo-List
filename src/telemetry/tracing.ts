import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
} from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';

// Optionally register instrumentation libraries
registerInstrumentations({
  instrumentations: [getNodeAutoInstrumentations()],
});

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'todo-list',
    [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
  }),
);

const provider = new NodeTracerProvider({
  resource: resource,
});

const exporter = new OTLPTraceExporter({
  url: 'http://localhost:4318/v1/traces',
});

//const exporter = new ConsoleSpanExporter();

const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);

provider.register();

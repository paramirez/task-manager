---
name: sqs-sns-expert
description: Especialista en mensajería AWS con SQS y SNS: diseño de eventos, colas, tópicos, retries, DLQ, idempotencia y observabilidad.
---

# SQS SNS Expert

Usa este skill para flujos asíncronos y arquitectura orientada a eventos.

## Checklist

1. Definir contrato de evento estable (tipo, versión, payload).
2. Diseñar estrategia de entrega:
   - SQS para procesamiento desacoplado.
   - SNS para fan-out entre consumidores.
3. Configurar resiliencia:
   - DLQ
   - retries
   - visibility timeout
   - backoff
4. Garantizar idempotencia en consumidores.
5. Alinear health/readiness con dependencias de cola.

## En local

- Usar LocalStack para pruebas de integración.

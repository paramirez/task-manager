# Task Manager API

API de gestión de tareas con arquitectura modular (dominio/aplicación/infra), CQRS y Result pattern.

Incluye:
- CRUD de tareas.
- Programación de recordatorios asíncronos.
- Publicación de eventos de dominio a SQS (outbox).
- Procesamiento asíncrono en un proceso separado (`worker`) para aproximación de microservicios.

## Arquitectura de ejecución (estilo microservicios)

- `api`: expone endpoints HTTP.
- `worker`: procesa cola asíncrona en segundo plano.
- `mongo`: persistencia principal.
- `localstack`: emulación local de SQS.

`api` y `worker` comparten código (monorepo/monolito modular), pero corren como servicios separados.

## Requisitos

- Node.js 22+
- npm 10+
- Docker + Docker Compose v2

## Instalación local (sin Docker)

```bash
npm install
cp .env.example .env
npm run build
npm run start:prod
```

## Variables de entorno

Ejemplo base en `.env.example`.

- `PORT`: puerto HTTP de la app.
- `WORKER_ENABLED`: `true` activa el worker asíncrono en el proceso.
- `MONGO_URI`, `MONGO_DB`, `MONGO_SERVER_SELECTION_TIMEOUT_MS`: conexión MongoDB.
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: credenciales SQS.
- `SQS_ENDPOINT`: endpoint SQS (LocalStack local: `http://localhost:4566`).
- `SQS_QUEUE_NAME`: cola para eventos de tareas (`task-events`).
- `ASYNC_JOBS_SQS_QUEUE_NAME`: cola de trabajos asíncronos (`async-jobs`).
- `ASYNC_JOBS_POLL_INTERVAL_MS`: intervalo de polling del worker.
- `ASYNC_JOBS_BATCH_SIZE`: tamaño de lote por ciclo.

## Docker

### Construir imagen

```bash
docker build -t task-manager:latest .
```

### Ejecutar stack completo

```bash
docker compose -f compose.yaml up -d --build
```

Servicios:
- API: `http://localhost:3000`
- MongoDB: `localhost:27017`
- LocalStack (SQS): `http://localhost:4566`

### Logs

```bash
docker compose -f compose.yaml logs -f api worker
```

### Apagar stack

```bash
docker compose -f compose.yaml down
```

## API

### Tasks

- `POST /tasks`
  - Crea tarea.
  - Body:
```json
{
  "title": "Preparar release",
  "description": "Checklist final",
  "status": "pending",
  "assignedTo": "rohan",
  "dueDate": "2026-02-25T15:00:00.000Z"
}
```

- `GET /tasks`
  - Lista todas las tareas.

- `GET /tasks/{id}`
  - Obtiene una tarea por ID.

- `PUT /tasks/{id}`
  - Reemplazo completo de tarea.
  - Requiere `title` y `status`.

- `PATCH /tasks/{id}`
  - Actualización parcial.

- `DELETE /tasks/{id}`
  - Elimina tarea por ID.

- `GET /tasks/status/{status}`
  - Lista por estado (`pending`, `in_progress`, `completed`).

- `POST /tasks/{id}/schedule`
  - Programa trabajo asíncrono de recordatorio según `dueDate`.
  - Body opcional:
```json
{
  "minutesBeforeDueDate": 30
}
```

### Jobs (operación interna / soporte)

- `POST /jobs/task-reminders/{taskId}`
  - Alternativa de scheduling directo.

- `POST /jobs/reports/completed-tasks`
  - Encola generación de reporte.

- `POST /jobs/process`
  - Fuerza procesamiento manual de cola (útil para pruebas).

## Validación

Se usa `ValidationPipe` global con:
- `whitelist`
- `forbidNonWhitelisted`
- `transform`

Los payloads inválidos retornan error 4xx.

## Salud del sistema

- `GET /health/live`
- `GET /health/ready` (verifica MongoDB y colas SQS requeridas)

## Pruebas

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
```

Para `test:e2e`, necesitas MongoDB y LocalStack activos.

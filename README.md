# Task Manager API

API de gestión de tareas con arquitectura modular (dominio/aplicación/infra), CQRS y Result pattern.

Incluye:
- CRUD de tareas.
- Programación de recordatorios asíncronos.
- Procesamiento asíncrono en un proceso separado (`worker`) usando SQS.

## Arquitectura de ejecución (estilo microservicios)

- `api`: expone endpoints HTTP.
- `worker`: procesa cola asíncrona en segundo plano.
- `mongo`: persistencia principal.
- `localstack`: emulación local de SQS.

`api` y `worker` comparten código (monorepo/monolito modular), pero corren como servicios separados.

## Arquitectura y patrones de diseño

La solución implementa una arquitectura claramente definida y patrones explícitos:

- Arquitectura en capas:
  - `domain`: reglas de negocio y entidades.
  - `application`: casos de uso (commands/queries/handlers).
  - `infrastructure`: adaptadores HTTP, MongoDB y SQS.
- CQRS in-process:
  - Separación de comandos (mutaciones) y queries (lecturas) mediante `CommandBus` y `QueryBus`.
- Repository Pattern:
  - Persistencia desacoplada por puertos (`TaskRepository`, `TaskReportRepository`) e implementaciones (`TaskMongoAdapter`, `TaskReportMongoAdapter`).
- Adapter Pattern:
  - Integraciones externas encapsuladas en adaptadores (`SqsAsyncJobQueue`, adaptadores Mongo).
- Result Pattern:
  - Manejo explícito de éxito/error sin excepciones como control de flujo en la capa de aplicación.
- Worker Pattern:
  - Procesamiento asíncrono desacoplado en `worker`, con polling de cola SQS y ejecución de jobs.
- Dependency Injection (NestJS):
  - Wiring por tokens/proveedores para mantener bajo acoplamiento entre capas.

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
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: credenciales para SQS.
- `SQS_ENDPOINT`: endpoint SQS (LocalStack local: `http://localhost:4566`).
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

### Swagger

- UI: `GET /docs`
- OpenAPI JSON: `GET /docs/json`

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
- `GET /health/ready` (verifica MongoDB y cola SQS requerida)

## Diagramas UML y C4

Los diagramas de arquitectura y flujos están en `uml/`:

- Secuencia:
  - `uml/secuencia-01-crear-tarea.puml`
  - `uml/secuencia-02-programar-recordatorio.puml`
  - `uml/secuencia-03-encolar-reporte.puml`
  - `uml/secuencia-04-worker-procesar-jobs.puml`
- Componentes:
  - `uml/componentes.puml`
- C4:
  - Nivel 1 (Contexto): `uml/c4-nivel1-contexto.puml`
  - Nivel 2 (Contenedores): `uml/c4-nivel2-contenedores.puml`
  - Nivel 3 (Componentes API): `uml/c4-nivel3-api-componentes.puml`
  - Nivel 3 (Componentes Worker): `uml/c4-nivel3-worker-componentes.puml`

## Pruebas

```bash
npm run lint
npm run build
npm run test
npm run test:e2e
```

Para `test:e2e`, necesitas MongoDB y LocalStack activos.

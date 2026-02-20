# AGENTS

## Contexto del Proyecto

- Stack: NestJS 11, TypeScript, CQRS in-process, Result pattern.
- Persistencia: MongoDB (driver oficial `mongodb`, sin mongoose).
- Mensajería: SQS (LocalStack en local), outbox para eventos.
- Ejecución: estilo microservicios sobre monolito modular.
  - `api`: HTTP + casos de uso.
  - `worker`: procesamiento asíncrono.
- Principio no negociable: `domain` y `application` sin dependencias de infraestructura.

## Registro de Agentes

- `task-orchestrator` (`skills/task-orchestrator/SKILL.md`):
  - Recibe requerimientos, define plan, asigna subagentes y orden de ejecución.
- `arquitecto-software` (`skills/arquitecto-software/SKILL.md`):
  - Diseño de módulos, límites de capas, decisiones de arquitectura.
- `lint-expert` (`skills/lint-expert/SKILL.md`):
  - Cero warnings/errores de lint, coherencia de estilo y calidad estática.
- `test-expert` (`skills/test-expert/SKILL.md`):
  - Cobertura de pruebas unitarias/e2e y prevención de regresiones.
- `mongo-expert` (`skills/mongo-expert/SKILL.md`):
  - Modelado de colecciones, índices, queries y performance MongoDB.
- `nestjs-expert` (`skills/nestjs-expert/SKILL.md`):
  - Módulos, DI, pipes, filters, providers y wiring de NestJS.
- `sqs-sns-expert` (`skills/sqs-sns-expert/SKILL.md`):
  - Patrones de mensajería AWS, colas, tópicos, DLQ, idempotencia y reintentos.
- `code-review-expert` (`skills/code-review-expert/SKILL.md`):
  - Revisión técnica orientada a bugs, regresiones, riesgos y cobertura.
- `conventional-commit-writer` (`skills/conventional-commit-writer/SKILL.md`):
  - Preparación de commits con formato Conventional Commits.

## Reglas de Orquestación

1. Todo requerimiento inicia en `task-orchestrator`.
2. `task-orchestrator` clasifica el trabajo y delega por especialidad:
   - Arquitectura/capas: `arquitecto-software`
   - Wiring framework/API: `nestjs-expert`
   - Base de datos/modelado: `mongo-expert`
   - Mensajería/eventos: `sqs-sns-expert`
   - Calidad estática: `lint-expert`
   - Validación funcional/regresión: `test-expert`
3. Si el cambio impacta más de un dominio, se ejecuta en este orden:
   1. `arquitecto-software`
   2. especialista técnico (`nestjs` / `mongo` / `sqs-sns`)
   3. `lint-expert`
   4. `test-expert`
   5. `code-review-expert`
   6. `conventional-commit-writer`
4. Criterio de cierre obligatorio:
   - `npm run lint`
   - `npm run build`
   - `npm run test`
   - `npm run test:e2e` cuando infraestructura esté disponible.

## Matriz de Asignación Rápida

- "Refactor de módulos" -> `arquitecto-software` + `nestjs-expert`
- "Errores de lint" -> `lint-expert`
- "Agregar endpoint/handler" -> `nestjs-expert` + `test-expert`
- "Optimizar queries/indexes" -> `mongo-expert` + `test-expert`
- "Eventos asincrónicos, DLQ, retries" -> `sqs-sns-expert` + `test-expert`
- "Cambio grande transversal" -> `task-orchestrator` + todos los necesarios
- "Revisión antes de merge" -> `code-review-expert`
- "Preparar commit final" -> `conventional-commit-writer`

## Definición de Hecho

- Sin acoplamiento de infra en `domain`/`application`.
- Contratos HTTP y validación de payload consistentes.
- Errores mapeados a Result pattern y códigos HTTP correctos.
- Lint/build/tests en verde.

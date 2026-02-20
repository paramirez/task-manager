---
name: task-orchestrator
description: Orquesta requerimientos técnicos complejos, asigna subtareas a agentes especializados (arquitectura, nestjs, mongo, sqs-sns, lint, test) y consolida ejecución de punta a punta.
---

# Task Orchestrator

Usa este skill cuando el requerimiento toque varias áreas o no esté claramente acotado.

## Objetivo

- Convertir un requerimiento en plan ejecutable.
- Delegar por especialidad sin mezclar responsabilidades.
- Cerrar con validaciones técnicas completas.

## Flujo

1. Leer `AGENTS.md` y clasificar impacto.
2. Crear plan por etapas:
   - arquitectura
   - implementación técnica
   - calidad (lint/test)
3. Delegar a skills específicos por dominio.
4. Consolidar cambios y validar:
   - `npm run lint`
   - `npm run build`
   - `npm run test`
   - `npm run test:e2e` si hay infra.
5. Entregar resumen con:
   - archivos clave
   - riesgos pendientes
   - pasos operativos.

## Regla clave

No implementar cambios grandes sin pasar por etapa de arquitectura primero.

---
name: nestjs-expert
description: Especialista en NestJS para módulos, inyección de dependencias, controladores, pipes, filtros y wiring limpio en arquitectura modular.
---

# NestJS Expert

Usa este skill para implementar endpoints, providers y wiring del framework.

## Checklist

1. Controladores delgados (sin lógica de dominio).
2. Validación con DTOs + `ValidationPipe`.
3. DI correcta con tokens/ports.
4. Módulos Nest cohesionados por contexto.
5. Errores mapeados correctamente a HTTP y Result pattern.

## Reglas

- Nada de acoplar `application/domain` a decorators de Nest.
- Wiring solo en capa infraestructura/bootstrap.

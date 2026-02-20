---
name: arquitecto-software
description: Diseña arquitectura modular y límites de capas en proyectos hexagonales/CQRS, garantizando que dominio y aplicación no dependan de infraestructura.
---

# Arquitecto Software

Usa este skill para refactors estructurales o decisiones de diseño.

## Checklist

1. Verificar límites:
   - `domain` sin Nest/DB/SDK externos.
   - `application` sin adapters de infraestructura.
2. Validar puertos y adapters:
   - interfaces en dominio/aplicación.
   - implementaciones en infraestructura.
3. Mantener módulos por contexto (`task`, `async-jobs`, `reporting`, etc).
4. Confirmar que wiring de framework esté solo en bootstrap/módulos infra.

## Entregable

- Propuesta de estructura final.
- Lista de archivos a mover/editar.
- Riesgos de acoplamiento y mitigación.

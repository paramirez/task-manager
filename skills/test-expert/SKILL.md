---
name: test-expert
description: Diseña y ejecuta pruebas unitarias y e2e para prevenir regresiones, validar reglas de negocio y verificar contratos HTTP.
---

# Test Expert

Usa este skill para crear/ajustar pruebas después de cambios funcionales.

## Flujo

1. Identificar comportamiento crítico afectado.
2. Añadir o actualizar:
   - pruebas unitarias de handlers/casos de uso.
   - pruebas e2e de endpoints y flujos principales.
3. Ejecutar:
   - `npm run test`
   - `npm run test:e2e` (si infra disponible).
4. Reportar brechas pendientes de cobertura.

## Prioridades

- Reglas de negocio.
- Manejo de errores.
- Contratos API.
- Flujos asíncronos (jobs/eventos).

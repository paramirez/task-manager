---
name: lint-expert
description: Especialista en calidad estática TypeScript/NestJS. Elimina errores de lint, imports inválidos, reglas de estilo y deuda de mantenimiento.
---

# Lint Expert

Usa este skill cuando existan errores de lint o antes de cerrar un cambio.

## Flujo

1. Ejecutar `npm run lint`.
2. Corregir primero errores de compilación estática:
   - imports no usados
   - tipos inseguros
   - reglas de eslint del repo
3. Re-ejecutar `npm run lint` hasta quedar en verde.
4. Confirmar que cambios de lint no alteran comportamiento funcional.

## Criterio

- Cero errores de lint.
- Cambios mínimos y enfocados.

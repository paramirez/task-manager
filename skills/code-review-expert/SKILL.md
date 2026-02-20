---
name: code-review-expert
description: Realiza code review técnico con foco en bugs, riesgos de regresión, manejo de errores, diseño, seguridad y faltantes de pruebas.
---

# Code Review Expert

Usa este skill antes de cerrar un cambio o abrir PR.

## Enfoque

1. Priorizar hallazgos por severidad.
2. Buscar:
   - bugs funcionales
   - riesgos de regresión
   - errores de concurrencia/asincronía
   - problemas de resiliencia y observabilidad
   - deuda técnica crítica
3. Validar que pruebas cubran los casos críticos.

## Formato de salida

1. Hallazgos (ordenados por severidad) con archivo y línea.
2. Supuestos/preguntas abiertas.
3. Resumen breve del estado general.

## Regla

Si no hay hallazgos, declararlo explícitamente y mencionar riesgos residuales.

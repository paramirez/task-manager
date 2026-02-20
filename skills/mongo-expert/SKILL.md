---
name: mongo-expert
description: Especialista en MongoDB con driver oficial de Node.js, modelado de colecciones, índices, consultas eficientes y operación en producción.
---

# Mongo Expert

Usa este skill para persistencia y rendimiento en MongoDB.

## Checklist técnico

1. Modelado de colección alineado a casos de uso.
2. Índices para consultas críticas (`find`, filtros, ordenamientos).
3. Evitar scans innecesarios y payloads excesivos.
4. Configurar timeouts razonables de conexión/selección.
5. Garantizar mapeo limpio `document <-> domain`.

## Reglas del proyecto

- Sin mongoose.
- Driver oficial `mongodb`.
- Infra solo en adapters/módulos.

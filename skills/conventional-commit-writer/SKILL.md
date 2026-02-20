---
name: conventional-commit-writer
description: Prepara commits con Conventional Commits, agrupando cambios coherentes y redactando mensajes claros para historial y release notes.
---

# Conventional Commit Writer

Usa este skill al final de una tarea implementada y validada.

## Convención

Formato:

`type(scope): short summary`

Tipos comunes:
- `feat`
- `fix`
- `refactor`
- `test`
- `docs`
- `chore`

## Flujo

1. Revisar `git diff --name-only` y agrupar cambios por intención.
2. Proponer mensaje de commit por grupo lógico.
3. Incluir cuerpo cuando aporte contexto:
   - qué cambió
   - por qué
   - impacto
4. Añadir `BREAKING CHANGE:` cuando corresponda.

## Regla

No mezclar cambios no relacionados en un mismo commit.

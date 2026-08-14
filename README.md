# Mental Health Progress Tracker

Aplicación full-stack para que una persona registre aspectos de su bienestar diario y observe tendencias semanales o mensuales. El lenguaje y la interfaz buscan ser tranquilos, privados y no evaluativos.

## Stack

- Backend: Node.js, TypeScript, Express, PostgreSQL, TypeORM y Socket.IO.
- Frontend: React, Vite, TypeScript, Tailwind CSS y Recharts.
- Infraestructura: Docker y Docker Compose.

## Inicio rápido

1. Copia `.env.example` a `.env` y completa `JWT_SECRET`, `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.
2. En Google Cloud Console crea un cliente OAuth web y registra exactamente `http://localhost:3000/api/auth/google/callback` como URI de callback para desarrollo.
3. Ejecuta:

```bash
docker compose up --build
```

El frontend estará en `http://localhost:5173` y el backend en `http://localhost:3000`.

## Migraciones

TypeORM se configura con `synchronize: false`. Al iniciar el contenedor backend se ejecutan las migraciones ya versionadas; no se genera el esquema automáticamente.

Para desarrollo local, desde `backend/`:

```bash
npm run migration:run
npm run migration:generate -- src/migrations/descriptive-name
npm run migration:revert
```

La primera migración crea `users`, `daily_logs`, restricciones de escala y el índice único `(user_id, log_date)`.

## Seguridad y privacidad

- OAuth 2.0 de Google para identificación; los tokens de Google no se persisten.
- El parámetro OAuth `state` se protege con una cookie temporal `httpOnly` antes de aceptar el callback.
- JWT de siete días únicamente en cookie `httpOnly`; no se usa `localStorage`.
- CORS restringido al `FRONTEND_URL` y Socket.IO verifica la misma cookie antes de conectar.
- Los eventos `daily-log:created` se envían solo a la room privada de cada usuario.

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/health` | Healthcheck del servicio |
| GET | `/api/auth/google` | Inicia OAuth con Google |
| GET | `/api/auth/google/callback` | Callback OAuth |
| GET | `/api/auth/me` | Usuario de la sesión |
| POST | `/api/auth/logout` | Cierra la sesión |
| POST | `/api/logs` | Crea un registro diario |
| GET | `/api/logs?from=YYYY-MM-DD&to=YYYY-MM-DD` | Lista registros del usuario |

## Evento en tiempo real

Tras persistir un registro, el backend emite `daily-log:created` por Socket.IO a `user:<id>`. El cliente actualiza la gráfica sin recargar la página.

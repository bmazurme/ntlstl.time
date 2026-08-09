# reports

Веб-приложение для учёта рабочего времени: календарь с праздниками и отгулами, помесячная статистика рабочих дней/часов, отчёт по задачам GitLab с экспортом в CSV.

* **Репозиторий:** [github.com/bmazurme/ntlstl.time](https://github.com/bmazurme/ntlstl.time)

## Tech Stack

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-0.3-E83524?logo=typeorm&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-compose-2496ED?logo=docker&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-4-6E9F18?logo=vitest&logoColor=white)
![Cypress](https://img.shields.io/badge/Cypress-15-17202C?logo=cypress&logoColor=white)

## Возможности

* Годовой календарь с праздниками, короткими днями, выходными и дополнительными отгулами
* Добавление отгулов диапазоном дат и удаление с подтверждением прямо из интерфейса
* Помесячная статистика рабочих дней и часов с прогресс-баром до нормы
* Отчёт по задачам GitLab для выбранного пользователя: сортируемая таблица, конвертация оценок времени в часы, ежемесячный экспорт в CSV
* Настройки: адрес GitLab, приватный токен, ID пользователя, сотрудник и компания
* Справочник кодов проектов для меток отчёта — добавление через диалог, удаление с подтверждением

## Архитектура

Монорепозиторий на npm workspaces из трёх пакетов: `client` (React + Vite SPA), `server` (NestJS API поверх PostgreSQL через TypeORM) и `shared` (общие TypeScript-типы для контракта API).

* `packages/client/src/pages` — страницы приложения
* `packages/client/src/components` — функциональные компоненты (календарь, детали, отчёт, настройки)
* `packages/client/src/store` — Redux-стор
* `packages/client/src/hocs`, `hooks`, `utils` — общие хуки, HOC-и и утилиты
* `packages/server/src/counts` — модуль расчёта календарной статистики по году (`CountsController`/`CountsService`, таблица `year_config`)
* `packages/server/src/reports` — интеграция с GitLab API, экспорт CSV и справочник кодов проектов (таблица `project_dict`)
* `packages/server/src/settings` — модуль хранения конфигурации (таблица `settings`)
* `packages/server/src/database` — TypeORM-сущности, `data-source.ts` и миграции
* `packages/server/src/legacy-data` — снимок старых JSON-файлов (до перехода на Postgres), используется только для одноразового импорта
* `packages/shared/src/types.ts` — общий контракт API (`StreamEvent`, `DateType`, `ReportType` и т.д.)

Клиент и сервер обмениваются данными через newline-delimited JSON (`StreamEvent`): `GET /api/counts/:year` отдаёт календарную статистику, `GET /api/reports` — список задач GitLab.

## Запуск проекта

Требуется Node.js 24+ и запущенный PostgreSQL (проще всего — через `docker compose up postgres`, см. [Docker](#docker)).

```bash
npm install
npm run build --workspace=packages/shared
cp packages/server/.env.example packages/server/.env   # и подставить свои значения
npm run migration:run --workspace=packages/server       # создать схему БД
npm run dev
```

Сервер поднимется на `http://localhost:3000`, клиент — на адресе, который выведет Vite.

Пакет `shared` резолвится через `dist/`, поэтому его нужно собрать (`build`) или держать в режиме `dev` (watch), иначе клиент и сервер не увидят типы `@reports/shared`.

### Скрипты

| Команда | Описание |
|---------|---------|
| `npm run dev` | сервер и клиент параллельно |
| `npm run dev:server` | только сервер (`nest start --watch`) |
| `npm run dev:client` | только клиент (Vite) |
| `npm run build --workspace=packages/shared` | сборка общих типов |
| `npm run dev --workspace=packages/shared` | сборка общих типов в watch-режиме |
| `npm run build --workspace=packages/server` | продакшен-сборка сервера (Nest/tsc) |
| `npm run build --workspace=packages/client` | продакшен-сборка клиента |
| `npm run lint --workspace=packages/client` | ESLint по клиенту |
| `npm test --workspace=packages/client` | юнит-тесты (Vitest) |
| `npm run e2e --workspace=packages/client` | Cypress headless |
| `npm test --workspace=packages/server` | юнит-тесты сервера (Vitest) |
| `npm run migration:run --workspace=packages/server` | применить миграции TypeORM к БД |
| `npm run migration:generate --workspace=packages/server` | сгенерировать новую миграцию по изменениям в сущностях |
| `npm run migration:revert --workspace=packages/server` | откатить последнюю миграцию |
| `npm run import:json --workspace=packages/server` | одноразовый импорт данных из `src/legacy-data/*.json` в Postgres (после `build` и `migration:run`) |

### Переменные окружения

Файл `.env` в `packages/server` (не коммитится, шаблон — `packages/server/.env.example`):

* `GITLAB_URL` — адрес GitLab-инстанса
* `PRIVATE_TOKEN` — приватный токен для GitLab API
* `USER_ID` — ID пользователя, по которому строится отчёт
* `PORT` — порт сервера (опционально, по умолчанию `3000`)
* `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` — подключение к PostgreSQL

## Миграция на Postgres

До этого изменения сервер хранил календарные данные, настройки и справочник проектов в JSON-файлах (`packages/server/src/legacy-data/*.json` — исторический снимок этих файлов). Теперь всё это — таблицы Postgres (`year_config`, `settings`, `project_dict`), управляемые через TypeORM.

Порядок разового переезда на уже поднятую БД:

```bash
npm run build --workspace=packages/shared
npm run build --workspace=packages/server
npm run migration:run --workspace=packages/server   # создать таблицы
npm run import:json --workspace=packages/server     # перенести данные из legacy JSON
```

Импорт идемпотентен (upsert по первичному ключу), его можно запускать повторно.

## Docker

`docker-compose.yml` в корне поднимает PostgreSQL и сервер (миграции применяются автоматически при старте контейнера сервера):

```bash
docker compose up --build
```

Сервер будет доступен на `http://localhost:3000`. Клиент в Docker не упакован — запускайте его локально через `npm run dev:client`, он обращается к серверу по `http://localhost:3000/api` независимо от того, где сервер запущен (локально или в контейнере).

Перенести данные из старых JSON-файлов в контейнеризованную БД:

```bash
docker compose exec server npm run import:json
```

Переменные `GITLAB_URL`/`PRIVATE_TOKEN`/`USER_ID` и `DB_USERNAME`/`DB_PASSWORD`/`DB_NAME` можно переопределить через `.env` в корне репозитория (см. `packages/server/.env.example` для полного списка) — `docker-compose.yml` подставляет их со значениями по умолчанию, если не заданы.

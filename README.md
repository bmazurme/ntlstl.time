# reports

Веб-приложение для учёта рабочего времени: календарь с праздниками и отгулами, помесячная статистика рабочих дней/часов, отчёт по задачам GitLab с экспортом в CSV.

* **Репозиторий:** [github.com/bmazurme/ntlstl.time](https://github.com/bmazurme/ntlstl.time)

## Tech Stack

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2-764ABC?logo=redux&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
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

Монорепозиторий на npm workspaces из трёх пакетов: `client` (React + Vite SPA), `server` (Express API) и `shared` (общие TypeScript-типы для контракта API).

* `packages/client/src/pages` — страницы приложения
* `packages/client/src/components` — функциональные компоненты (календарь, детали, отчёт, настройки)
* `packages/client/src/store` — Redux-стор
* `packages/client/src/hocs`, `hooks`, `utils` — общие хуки, HOC-и и утилиты
* `packages/server/src/counts` — расчёт календарной статистики по году
* `packages/server/src/reports` — интеграция с GitLab API и экспорт CSV
* `packages/server/src/settings` — хранение конфигурации и справочника проектов в JSON
* `packages/shared/src/types.ts` — общий контракт API (`StreamEvent`, `DateType`, `ReportType` и т.д.)

Клиент и сервер обмениваются данными через newline-delimited JSON (`StreamEvent`): `GET /api/counts/:year` отдаёт календарную статистику, `GET /api/reports` — список задач GitLab.

## Запуск проекта

Требуется Node.js 24+.

```bash
npm install
npm run build --workspace=packages/shared
npm run dev
```

Сервер поднимется на `http://localhost:3000`, клиент — на адресе, который выведет Vite.

Пакет `shared` резолвится через `dist/`, поэтому его нужно собрать (`build`) или держать в режиме `dev` (watch), иначе клиент и сервер не увидят типы `@reports/shared`.

### Скрипты

| Команда | Описание |
|---------|---------|
| `npm run dev` | сервер и клиент параллельно |
| `npm run dev:server` | только сервер (`tsx --watch`) |
| `npm run dev:client` | только клиент (Vite) |
| `npm run build --workspace=packages/shared` | сборка общих типов |
| `npm run dev --workspace=packages/shared` | сборка общих типов в watch-режиме |
| `npm run build --workspace=packages/client` | продакшен-сборка клиента |
| `npm run lint --workspace=packages/client` | ESLint по клиенту |
| `npm test --workspace=packages/client` | юнит-тесты (Vitest) |
| `npm run e2e --workspace=packages/client` | Cypress headless |
| `npm test --workspace=packages/server` | юнит-тесты сервера (Vitest) |

### Переменные окружения

Файл `.env` в `packages/server` (не коммитится):

* `GITLAB_URL` — адрес GitLab-инстанса
* `PRIVATE_TOKEN` — приватный токен для GitLab API
* `USER_ID` — ID пользователя, по которому строится отчёт
* `PORT` — порт сервера (опционально, по умолчанию `3000`)

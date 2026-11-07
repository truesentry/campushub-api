# Практична робота 4 - результати перевірок API

Усі команди запускалися після `npm run dev`. У кожній відповіді був заголовок `X-Request-Id` з новим UUID. Нижче `requestId` скорочено до `<uuid>`, бо його значення генерується для кожного запиту.

| № | Перевірка | Статус | Content-Type | Фрагмент JSON-відповіді |
| --- | --- | --- | --- | --- |
| 1 | Правильний POST | 201 | `application/json; charset=utf-8` | `{"id":2,"title":"Node.js Workshop","isOnline":true}` |
| 2 | Назва закоротка | 400 | `application/problem+json; charset=utf-8` | `{"code":"VALIDATION_ERROR","errors":[{"field":"title"}]}` |
| 3 | Некоректна дата | 400 | `application/problem+json; charset=utf-8` | `{"code":"VALIDATION_ERROR","errors":[{"field":"date"}]}` |
| 4 | Невідоме поле `price` | 400 | `application/problem+json; charset=utf-8` | `{"code":"VALIDATION_ERROR","errors":[{"field":"body"}]}` |
| 5 | `isOnline` має неправильний тип | 400 | `application/problem+json; charset=utf-8` | `{"code":"VALIDATION_ERROR","errors":[{"field":"isOnline"}]}` |
| 6 | Порожній PATCH | 400 | `application/problem+json; charset=utf-8` | `{"code":"VALIDATION_ERROR","errors":[{"field":"body"}]}` |
| 7 | `id=abc` | 400 | `application/problem+json; charset=utf-8` | `{"code":"VALIDATION_ERROR","errors":[{"field":"id"}]}` |
| 8 | Подію `9999` не знайдено | 404 | `application/problem+json; charset=utf-8` | `{"code":"EVENT_NOT_FOUND","requestId":"<uuid>"}` |
| 9 | Дублікат події | 409 | `application/problem+json; charset=utf-8` | `{"code":"EVENT_ALREADY_EXISTS","requestId":"<uuid>"}` |
| 10 | Невідомий маршрут | 404 | `application/problem+json; charset=utf-8` | `{"code":"ROUTE_NOT_FOUND","requestId":"<uuid>"}` |
| 11 | Тестова внутрішня помилка | 500 | `application/problem+json; charset=utf-8` | `{"code":"INTERNAL_SERVER_ERROR","detail":"An unexpected server error occurred"}` |

## Команди

```bash
curl -i -X POST http://localhost:3000/api/events -H "Content-Type: application/json" -d '{"title":"Node.js Workshop","date":"2026-11-15","isOnline":true}'
curl -i -X POST http://localhost:3000/api/events -H "Content-Type: application/json" -d '{"title":"JS","date":"2026-11-15"}'
curl -i -X POST http://localhost:3000/api/events -H "Content-Type: application/json" -d '{"title":"Node.js Workshop","date":"15.11.2026"}'
curl -i -X POST http://localhost:3000/api/events -H "Content-Type: application/json" -d '{"title":"Node.js Workshop","date":"2026-11-15","price":500}'
curl -i -X POST http://localhost:3000/api/events -H "Content-Type: application/json" -d '{"title":"Node.js Workshop","date":"2026-11-15","isOnline":"yes"}'
curl -i -X PATCH http://localhost:3000/api/events/1 -H "Content-Type: application/json" -d '{}'
curl -i http://localhost:3000/api/events/abc
curl -i http://localhost:3000/api/events/9999
curl -i -X POST http://localhost:3000/api/events -H "Content-Type: application/json" -d '{"title":"Node.js Workshop","date":"2026-11-15","isOnline":true}'
curl -i http://localhost:3000/api/unknown
curl -i http://localhost:3000/api/events/error/test
```

## Приклади відповідей

Успіх (`201`):

```json
{"id":2,"title":"Node.js Workshop","date":"2026-11-15","isOnline":true}
```

Помилка валідації (`400`):

```json
{"type":"https://example.com/problems/validation-error","title":"Request validation failed","status":400,"code":"VALIDATION_ERROR","requestId":"<uuid>","errors":[{"field":"title","message":"Title must contain at least 3 characters"}]}
```

Помилка відсутньої події (`404`):

```json
{"type":"https://example.com/problems/event-not-found","title":"Event not found","status":404,"code":"EVENT_NOT_FOUND","requestId":"<uuid>"}
```

Помилка дублювання (`409`):

```json
{"type":"https://example.com/problems/event-already-exists","title":"Event already exists","status":409,"code":"EVENT_ALREADY_EXISTS","requestId":"<uuid>"}
```

Внутрішня помилка (`500`):

```json
{"type":"https://example.com/problems/internal-server-error","title":"Internal server error","status":500,"detail":"An unexpected server error occurred","code":"INTERNAL_SERVER_ERROR","requestId":"<uuid>"}
```

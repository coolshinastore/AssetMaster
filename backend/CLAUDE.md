# AssetMaster — Backend Context

> Деталізований контекст для `backend/`. Загальний огляд проекту, API та DB схема — у кореневому `CLAUDE.md`.

---

## Правила

- Весь код — виключно у `backend/src/`
- Міграції БД — у `backend/src/main/resources/db/migration/`
- Запуск: `cd backend && ./mvnw spring-boot:run`
- Перевірка backend: запускати в IntelliJ IDEA, не через mvn у терміналі

---

## Demo акаунти (DataInitializer seed)

| Роль | Email | Пароль |
|------|-------|--------|
| ROLE_AUTHOR | demo@assetmaster.com | Demo@1234 |
| ROLE_ADMIN | admin@assetmaster.com | Admin@1234 |

Seed-дані: 7 категорій, 12 активів (статус `PUBLISHED`), 3 payouts для demo author, 6 blog posts. Seed-користувачі мають `emailVerified = true`.

---

## 11. Тестування

### Backend

```
Unit тести:     JUnit 5 + Mockito (сервісний шар, мінімум 80% coverage)
Integration:    TestContainers + реальний PostgreSQL у Docker
API тести:      MockMvc для REST ендпоінтів
```

### Структура тестів

- `AbstractIntegrationTest` — базовий клас: `@SpringBootTest(RANDOM_PORT)` + `@Testcontainers` + `PostgreSQLContainer` + `@DynamicPropertySource`
- `ApiApplicationTests` — розширює `AbstractIntegrationTest`
- `ReviewServiceTest` (4 Mockito unit): 404 asset not found, 403 без покупки, 409 duplicate, success
- `AdminServiceTest` (6 Mockito unit): approve/reject flow, `requirePending()` кидає 409, stats, users
- `AuthServiceTest` (3 Mockito unit): register success, duplicate email → 409, login
- `AuthIntegrationTest` (4 MockMvc integration): register, duplicate register, login, login wrong password

### Frontend

```
Unit/Component: Vitest + React Testing Library (деталі у frontend/CLAUDE.md)
```

---

## 13. Конвенції коду (Java / Spring Boot / SQL)

### Java / Spring Boot

```java
// Пакетна структура
com.assetmaster.api
  ├── controller       // REST controllers (@RestController)
  ├── service          // бізнес-логіка (@Service)
  ├── repository       // JPA repositories
  ├── entity           // JPA entities (@Entity)
  ├── dto              // request/response DTOs (record або class)
  ├── mapper           // MapStruct mappers
  ├── security         // JWT, SecurityConfig
  ├── exception        // GlobalExceptionHandler
  └── config           // AppConfig, OpenApiConfig

// Іменування
- Entities:     PascalCase, однина (Asset, User, Order)
- DTOs:         AssetResponseDto, CreateAssetRequestDto
- Endpoints:    /api/v1/<resource> (plural, kebab-case)
- Javadoc:      обов'язково для public методів сервісів
```

### SQL

```sql
-- Іменування
- Таблиці:   snake_case, множина (users, assets, order_items)
- Колонки:   snake_case (created_at, author_id)
- Індекси:   idx_<table>_<column> (idx_assets_category_id)
- FK:        fk_<table>_<ref_table> (fk_assets_users)
- Міграції:  V{version}__{description}.sql (V1__create_users_table.sql)
```

---

## Критичні технічні рішення (backend)

### Hibernate 6 / Spring Data JPA

- JSONB поле: `@JdbcTypeCode(SqlTypes.JSON)` + `@Column(columnDefinition = "jsonb")`
- PostgreSQL `text[]`: `@Column(columnDefinition = "text[]")` + `String[]` у Java
- `@EntityGraph` на всіх `findBy` методах де потрібні зв'язки — уникає N+1
- Derived delete (`deleteByXxx`) вимагає `@Modifying @Transactional`

### Flyway — checksum protection

- Не можна редагувати вже застосовані міграції — Flyway падає з checksum mismatch
- Виправлення схеми завжди через нову версію (V8 SMALLINT → V9 `ALTER COLUMN ... TYPE INTEGER`)
- Нова міграція для будь-якої зміни схеми, без виключень

### CORS

- `application.yml` дозволяє `localhost:5173` І `localhost:5174` — Vite може зайняти будь-який порт

### SecurityConfig

- Порядок правил має значення: специфічні (`authenticated()`) ставити **перед** `permitAll` wildcards
- Приклад: `GET/PATCH /auth/me` → `authenticated()` → потім `auth/**` → `permitAll()`
- `POST /api/v1/stripe/webhooks` → `permitAll()` (верифікація через Webhook signature)
- `POST /api/v1/auth/me/avatar` → `authenticated()`
- `GET /api/v1/blog/**` → `permitAll()`

### AuthenticationEntryPoint + AccessDeniedHandler

- `SecurityConfig` отримав `ObjectMapper` через `@RequiredArgsConstructor`
- `handleUnauthorized` / `handleForbidden` пишуть JSON `ProblemDetail` напряму у `HttpServletResponse`
- Без цього JWT-помилки (401) поверталися без body

### GlobalExceptionHandler

- `handleValidation` обробляє і `getGlobalErrors()` (class-level constraints), і `getFieldErrors()`; merge через `putIfAbsent` на `LinkedHashMap`
- `handleGeneral` логує через SLF4J (`log.error("Unhandled exception", ex)`) — без цього 500-помилки були «тихими»
- `handleAuth(AuthenticationException)` ловить лише виключення з контролерів; помилки з JWT-фільтра → `AuthenticationEntryPoint`

### AdminController — @PreAuthorize на рівні класу

- `@PreAuthorize("hasRole('ROLE_ADMIN')")` на класі → всі методи захищені автоматично
- `CategoryService` + `AdminService` ін'єктуються обидва через Lombok `@RequiredArgsConstructor`; category CRUD в тому самому контролері

### Аналітика — нативні SQL-запити

- `OrderItemRepository.findMonthlySalesByAuthorId` і `findTopAssetsByAuthorId` — native `@Query` (не JPQL) через PostgreSQL `TO_CHAR`
- `AnalyticsService` маппить `Object[]` вручну: `((Number) row[N]).longValue()` і `new BigDecimal(row[N].toString())` — PostgreSQL-драйвер повертає `BigInteger` або `Long` залежно від типу
- `AdminService.getPlatformAnalytics()` мержить `userRepository.findMonthlyRegistrations()` і `orderItemRepository.findPlatformMonthlyRevenue()` через `LinkedHashMap<String, long[]>` де `long[2]` зберігає revenue × 100 (без втрати дробової частини)
- `OrderItemRepository.sumPlatformTotalRevenue()` / `sumPlatformMonthRevenue()` — JPQL та native для platform-wide агрегатів

### JwtService — 2FA flow

- `generatePartialToken()` — 5 хв TTL, claim `2fa_pending: true`
- `isPartialToken()` і `isTokenValid()` — `isTokenValid()` відхиляє partial tokens
- `AuthResponseDto`: factory methods `success()` / `pending2fa()`

### EmailService

- Gmail SMTP через `MimeMessage` + HTML-шаблони
- `@Async` — потребує `@EnableAsync` на `ApiApplication`
- fallback: якщо `MAIL_USERNAME` порожній — warn-лог з повним посиланням замість відправки
- `app.base-url` в `application.yml` — базовий URL для посилань у листах

### TotpService

- HMAC-SHA1 TOTP без зовнішніх залежностей — власний Base32 encode/decode, ±1 window для clock skew

### StorageService — аватар upload

- `StorageService.uploadAvatarFile(MultipartFile)` — завантажує у префікс `avatars/`, повертає ключ
- `AuthController.resolveAvatar(dto)` — якщо `avatarUrl` починається з `"avatars/"`, генерує свіжий presigned URL
- `GET /auth/me` та `PATCH /auth/me` обгорнуті в `resolveAvatar()` — завжди свіжий URL
- Якщо MinIO не налаштований: `generatePresignedUrl()` повертає `picsum.photos` placeholder

### StripeService

- `isEnabled()` — fallback якщо `STRIPE_SECRET_KEY` порожній
- `createTransfer()` — amountCents → "usd"
- `PayoutService.executePayout(id)` — валідує (не PAID, stripeAccountId не null, onboarding complete) → Transfer → зберігає `stripeTransferId`, `status=PAID`; при StripeException → `status=FAILED`

### Reviews — бізнес-правила

- UNIQUE (asset_id, author_id) на рівні БД + `existsByAssetIdAndAuthorId` в сервісі → 409 Conflict
- `OrderItemRepository.existsByBuyerIdAndAssetId` — перевірка покупки перед дозволом відгуку → 403 Forbidden
- `ReviewRepository`: `@EntityGraph({"author"})` на findBy методах — уникає N+1

### AuthServiceTest — специфіка

- `RegisterRequestDto` конструктор: `(email, displayName, password)` — НЕ `(email, password, displayName)`
- `jwtService.generateAccessToken(user)` — правильна назва методу (не `generateToken`)
- `ReflectionTestUtils.setField(authService, "refreshExpirySec", 3600L)` в `@BeforeEach` для інжекції `@Value` поля

### Payout entity

- `PayoutStatus` — PostgreSQL enum (`payout_status`); V14 міграція
- `DashboardController`: GET `/dashboard/payouts` — `hasRole AUTHOR or ADMIN`
- Seed: 3 payouts для demo author (2 PAID квітень/березень, 1 PENDING травень)

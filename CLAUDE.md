# AssetMaster — Project Context for Claude Code

> Цей файл — огляд продукту, архітектури та API.
> Деталі реалізації: `frontend/CLAUDE.md` та `backend/CLAUDE.md`.
> Оновлюй після кожної значної зміни в архітектурі або вимогах.

---

## 0. Структура репозиторію

```
assetmaster/                 ← корінь проекту
├── CLAUDE.md                ← цей файл (огляд)
├── frontend/                ← React + TypeScript (Vite)
│   ├── CLAUDE.md            ← frontend-специфічний контекст
│   ├── src/                 ← весь код фронтенду (FSD структура)
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── backend/                 ← Spring Boot (Java 21)
│   ├── CLAUDE.md            ← backend-специфічний контекст
│   ├── src/
│   │   └── main/
│   │       ├── java/com/assetmaster/api/
│   │       └── resources/
│   │           ├── application.yml
│   │           └── db/migration/           ← Flyway SQL-міграції
│   └── pom.xml
├── docker-compose.yml       ← підіймає backend + frontend + postgres локально
└── .env.example             ← змінні середовища (DB, JWT secret, MinIO credentials)
```

### Правила для Claude Code

- Весь фронтенд-код створювати **виключно** у `frontend/src/`
- Весь бекенд-код створювати **виключно** у `backend/src/`
- Міграції БД — у `backend/src/main/resources/db/migration/`
- Конфігурація Docker — у корені репозиторію
- Ніколи не змішувати frontend і backend залежності

### Команди запуску

```bash
# Backend
cd backend && ./mvnw spring-boot:run

# Frontend
cd frontend && npm run dev

# Обидва + PostgreSQL через Docker Compose
docker-compose up
```

---

## 1. Продукт

| Поле | Значення |
|------|----------|
| Назва | AssetMaster |
| Тип | Двосторонній marketplace цифрових активів (two-sided marketplace) |
| Аудиторія | Покупці (дизайнери, розробники, геймдизайнери) та Автори (продавці активів) |
| Мови інтерфейсу | Українська (основна), Англійська |
| Асортимент | 3D-моделі, UI Kit, шаблони, шрифти, ілюстрації, фото, відео, аудіо, game assets |
| Комісія платформи | 15–25 % від продажу (знижується з ростом обсягу продажів автора) |

### Ключові конкуренти (для аналітики)
- Creative Market — комісія 30–40 %, тільки англійська
- Envato Elements — модель підписки, роялті непрозорі
- Gumroad — немає органічного трафіку, 10 % комісія

---

## 2. Технологічний стек

### Backend
```
Мова:        Java 21
Framework:   Spring Boot 3.3.5
Security:    Spring Security + JWT (JJWT 0.12.x)
ORM:         Spring Data JPA / Hibernate 6
БД:          PostgreSQL 15
Міграції:    Flyway
Збірка:      Maven (Maven Wrapper ./mvnw)
Тести:       JUnit 5 + Mockito + TestContainers
Документація API: OpenAPI 3 / Swagger UI
Файлове сховище: MinIO SDK 8.5.11 (S3-сумісне)
Stripe:      stripe-java 25.3.0
```

### Frontend
```
Мова:        TypeScript 6.0
UI-бібліотека: React 19
Компоненти:  Material UI (MUI) v9 з кастомною темою
Стан сервера: TanStack Query v5
Форми:       React Hook Form + Zod
Маршрутизація: React Router v7
HTTP-клієнт: Axios з interceptors
Графіки:     Recharts
3D-перегляд: Three.js (для активів типу 3D-model)
Збірка:      Vite 7
Тести:       Vitest + React Testing Library
```

### Infrastructure
```
Контейнеризація: Docker + Docker Compose
Файлове сховище: MinIO (локально) / S3-сумісне (prod), TTL 15 хв
```

---

## 3. Архітектура системи

### Принципи
- **Stateless API** — сесія зберігається на клієнті у вигляді JWT (localStorage)
- **Role-based access** — три ролі: `ROLE_USER` (покупець), `ROLE_AUTHOR` (продавець), `ROLE_ADMIN`
- **Signed URLs** — файли активів ніколи не віддаються напряму; сервер генерує тимчасове підписане посилання (TTL 15 хв) після перевірки прав на покупку
- **OpenAPI-first** — бекенд генерує OpenAPI spec, фронтенд автоматично отримує типи через кодогенератор

### Архітектурні рішення
- Cart — клієнтський (localStorage), не потребує авторизації
- Wishlist — серверний (PostgreSQL), вимагає авторизації
- Замовлення в demo-режимі одразу зі статусом `PAID` (без платіжного шлюзу)
- `StorageService` — не ламає запуск якщо `MINIO_ENDPOINT` не заданий (fallback URL)
- `DataInitializer implements ApplicationRunner` — seed-дані виконуються після старту Spring context (правильне BCrypt-кодування пароля)
- Відгуки: UNIQUE (asset_id, author_id) на рівні БД + перевірка `existsByAssetIdAndAuthorId` в сервісі (409 Conflict); відгук без покупки → 403 Forbidden
- Комерційна ліцензія: окремого поля `commercialPrice` в БД немає — фронтенд обчислює `price * 2`; у кошик потрапляє вже перерахована ціна

---

## 4. Структура вебплатформи (Sitemap)

### 4.1 Публічна зона (без авторизації)
```
/                        — Головна сторінка
/catalog                 — Каталог активів (фільтри, пошук, сітка)
/catalog/:categorySlug   — Сторінка категорії
/assets/:id              — Сторінка продукту (прев'ю, ліцензія, відгуки)
/search?q=...            — Результати пошуку
/blog                    — Блог
/blog/:slug              — Стаття блогу
/about                   — Про нас
/licenses                — Умови ліцензування
/contact                 — Контакти
/faq                     — FAQ
/auth/register           — Реєстрація
/auth/login              — Вхід (з підтримкою 2FA)
/auth/forgot-password    — Відновлення пароля
/auth/reset-password     — Скидання пароля (з токеном)
/auth/verify-email       — Верифікація email
```

### 4.2 Особистий кабінет покупця (ROLE_USER)
```
/dashboard/purchases     — Мої покупки + завантаження файлів
/dashboard/wishlist      — Вішліст
/cart                    — Кошик
/checkout                — Оформлення замовлення + оплата
/checkout/success        — Успішна оплата
```

### 4.3 Кабінет автора (ROLE_AUTHOR)
```
/dashboard/assets        — Портфоліо (управління активами)
/dashboard/assets/new    — Форма завантаження нового активу
/dashboard/assets/:id/edit — Редагування активу
/dashboard/analytics     — Аналітика продажів і виплат
```

### 4.4 Спільні налаштування (обидві ролі)
```
/dashboard/profile       — Редагування профілю + аватар upload
/dashboard/notifications — Сповіщення
/dashboard/payments      — Платіжні реквізити + Stripe Connect (автор)
/dashboard/security      — Безпека (2FA TOTP setup, зміна пароля)
```

### 4.5 Адміністративна панель (ROLE_ADMIN)
```
/admin                   — Dashboard (KPI, графіки)
/admin/users             — Управління користувачами (ролі, верифікація)
/admin/moderation        — Модерація активів перед публікацією
/admin/finance           — Транзакції та виплати авторам (Stripe Transfer)
/admin/analytics         — Звіти, трафік
/admin/categories        — Управління категоріями та тегами
/admin/blog              — CRUD статей блогу
```

### 4.6 Системні сторінки
```
/404                     — Сторінка не знайдена
/500                     — Серверна помилка
/maintenance             — Технічне обслуговування
```

---

## 5. Схема бази даних (основні сутності)

```sql
users            — id, email, password_hash, role, display_name, avatar_url, bio,
                   is_verified, email_verified, totp_secret, totp_enabled,
                   stripe_account_id, stripe_onboarding_complete, created_at

assets           — id, author_id (FK users), title, description,
                   category_id (FK categories), price, license_type,
                   status (DRAFT | PENDING | PUBLISHED | REJECTED),
                   rejection_reason, file_key (S3), preview_urls (jsonb),
                   tags (text[]), downloads_count, views_count, created_at

categories       — id, name, slug, parent_id (self-ref), icon_url

orders           — id, buyer_id (FK users), total_amount,
                   status (PENDING | PAID | REFUNDED), created_at

order_items      — id, order_id (FK orders), asset_id (FK assets),
                   price_at_purchase, license_type

reviews          — id, asset_id (FK assets), author_id (FK users),
                   rating INTEGER (1-5), comment, created_at
                   UNIQUE (asset_id, author_id)

wishlist_items   — id, user_id (FK users), asset_id (FK assets)
                   UNIQUE (user_id, asset_id)

payouts          — id, author_id (FK users), amount, payout_status (enum),
                   period_start, period_end, processed_at, stripe_transfer_id

notifications    — id, user_id (FK users), type, title, body, link, is_read, created_at

blog_posts       — id, slug (UNIQUE), tag, title, excerpt, content, published,
                   read_time, author_id (FK users), created_at

password_reset_tokens      — id, user_id, token (UNIQUE), expires_at, used
email_verification_tokens  — id, user_id, token (UNIQUE), expires_at, used
```

---

## 6. REST API — ключові ендпоінти

```
# Публічні
GET  /api/v1/assets              — каталог (query: category, price, license, sort, page)
GET  /api/v1/assets/trending     — trending (sales*0.7 + rating*0.3 за 7 днів)
GET  /api/v1/assets/new          — нові (sorted by created_at DESC)
GET  /api/v1/assets/:id          — деталі активу
GET  /api/v1/assets/search?q=    — пошук
GET  /api/v1/assets/:id/reviews  — відгуки активу
GET  /api/v1/assets/:id/reviews/stats — avg_rating + count
GET  /api/v1/categories          — дерево категорій
GET  /api/v1/blog                — список статей блогу
GET  /api/v1/blog/:slug          — стаття блогу

# Авторизація
POST /api/v1/auth/register
POST /api/v1/auth/login          — повертає { accessToken, user } або { requires2fa, partialToken }
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
PATCH /api/v1/auth/me            — updateProfile (displayName, bio)
POST /api/v1/auth/me/avatar      — upload avatar (multipart, image/*, ≤2 МБ)
POST /api/v1/auth/2fa/verify
GET  /api/v1/auth/2fa/setup      — TOTP QR uri + secret
POST /api/v1/auth/2fa/enable
POST /api/v1/auth/2fa/disable
GET  /api/v1/auth/verify-email
POST /api/v1/auth/verify-email/resend
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password

# Покупець (ROLE_USER)
GET  /api/v1/orders              — мої замовлення
POST /api/v1/orders              — створити замовлення
GET  /api/v1/orders/:id/download/:assetId — отримати підписаний URL файлу
GET  /api/v1/wishlist
POST /api/v1/wishlist/:assetId
DEL  /api/v1/wishlist/:assetId
GET  /api/v1/notifications
POST /api/v1/notifications/:id/read
POST /api/v1/notifications/read-all

# Автор (ROLE_AUTHOR)
GET  /api/v1/assets/mine         — мої активи
POST /api/v1/assets              — створити актив
PUT  /api/v1/assets/:id          — оновити актив
DEL  /api/v1/assets/:id
GET  /api/v1/dashboard/analytics — статистика продажів
GET  /api/v1/dashboard/payouts   — мої виплати

# Stripe Connect
POST /api/v1/stripe/connect/onboard  — отримати onboarding URL (ROLE_AUTHOR)
GET  /api/v1/stripe/connect/status   — статус підключення (ROLE_AUTHOR|ADMIN)
POST /api/v1/stripe/webhooks         — webhook (public, signature-verified)

# Адмін (ROLE_ADMIN)
GET  /api/v1/admin/stats
GET  /api/v1/admin/assets/pending
PUT  /api/v1/admin/assets/:id/approve
PUT  /api/v1/admin/assets/:id/reject
GET  /api/v1/admin/users
PUT  /api/v1/admin/users/:id/role
PUT  /api/v1/admin/users/:id/verify
GET  /api/v1/admin/categories
POST /api/v1/admin/categories
PUT  /api/v1/admin/categories/:id
DEL  /api/v1/admin/categories/:id
GET  /api/v1/admin/finance/summary
GET  /api/v1/admin/finance/payouts
POST /api/v1/admin/finance/payouts
PUT  /api/v1/admin/finance/payouts/:id/status
POST /api/v1/admin/finance/payouts/:id/transfer  — Stripe Transfer
GET  /api/v1/admin/analytics
GET  /api/v1/admin/blog
POST /api/v1/admin/blog
PUT  /api/v1/admin/blog/:id
DEL  /api/v1/admin/blog/:id
```

---

## 9. Безпека

| Механізм | Реалізація |
|----------|-----------|
| Авторизація | JWT accessToken (15 хв) + refreshToken (30 днів) у httpOnly cookie |
| 2FA | TOTP HMAC-SHA1 (власна реалізація, ±1 window); partial token (5 хв, `2fa_pending: true`) |
| Захист маршрутів | `ProtectedRoute` — перевірка токена + ролі на клієнті; Spring Security на сервері |
| Завантаження файлів | Підписані S3/MinIO URL з TTL 15 хв, генеруються тільки після перевірки purchase |
| Валідація | Zod (клієнт) + Spring Validation (сервер) на всіх вхідних даних |
| CORS | `application.yml` дозволяє `localhost:5173` і `localhost:5174` (Vite може зайняти будь-який порт) |
| SQL ін'єкції | Захист через JPA/Hibernate параметризовані запити |
| Помилки авторизації | `AuthenticationEntryPoint` + `AccessDeniedHandler` пишуть JSON `ProblemDetail` у response |
| Stripe webhooks | Signature verification через `StripeService.constructWebhookEvent()` |

---

## 10. Продуктивність

| Метрика | Ціль |
|---------|------|
| LCP (головна сторінка) | < 2.5 с на 10 Мбіт/с |
| API відповідь (каталог) | < 500 мс при 100 concurrent requests |
| Підтвердження замовлення | < 5 с після оплати |
| Одночасних користувачів | до 500 |

### Стратегії оптимізації
- React Query кешування з інвалідацією по query key factories
- Lazy loading сторінок через `React.lazy` + `Suspense`
- Мініатюри активів — WebP формат, lazy load через `loading="lazy"`
- Infinite scroll замість пагінації в каталозі
- PostgreSQL індекси на: `assets.status`, `assets.category_id`, `assets.price`, `order_items.asset_id`, повнотекстовий індекс на `assets.title + assets.description` (tsvector)
- `avg_rating` обчислюється на льоту через `AVG` SQL-запит (для масштабу варто денормалізувати)

---

## 12. Наступні кроки розробки

```

---

## 15. Стан реалізації

> Читай перед початком будь-якої нової фази.

### 15.1 Реальні версії

| Компонент | Заплановано | Реально |
|-----------|-------------|---------|
| React | 18 | **19** |
| TypeScript | 5.x | **6.0** |
| MUI | v5 | **v9** |
| React Router | v6 | **v7** |
| Vite | — | **7** |
| TanStack Query | v5 | v5 ✓ |
| Spring Boot | 3.x | **3.3.5** |
| MinIO SDK | — | **8.5.11** |

### 15.2 Flyway міграції

| Версія | Файл | Вміст |
|--------|------|-------|
| V1 | `V1__create_users_table.sql` | Таблиця `users` |
| V2 | `V2__create_categories_table.sql` | Таблиця `categories` (self-ref parent_id) |
| V3 | `V3__create_assets_table.sql` | Таблиця `assets` (JSONB preview_urls, text[] tags, GIN FTS index) |
| V4 | `V4__create_wishlist_items_table.sql` | Таблиця `wishlist_items` (UNIQUE user_id+asset_id) |
| V5 | `V5__create_orders_table.sql` | Таблиця `orders` |
| V6 | `V6__create_order_items_table.sql` | Таблиця `order_items` |
| V7 | `V7__add_rejection_reason_to_assets.sql` | Колонка `rejection_reason TEXT` в `assets` |
| V8 | `V8__create_reviews_table.sql` | Таблиця `reviews` (UNIQUE asset_id+author_id, GIN index) |
| V9 | `V9__fix_reviews_rating_type.sql` | `ALTER TABLE reviews ALTER COLUMN rating TYPE INTEGER` |
| V10 | `V10__create_password_reset_tokens.sql` | Таблиця `password_reset_tokens` |
| V11 | `V11__add_email_verification.sql` | `email_verified` в `users` + таблиця `email_verification_tokens` |
| V12 | `V12__add_totp.sql` | `totp_secret`, `totp_enabled` в `users` |
| V13 | `V13__create_notifications_table.sql` | Таблиця `notifications` |
| V14 | `V14__create_payouts_table.sql` | Таблиця `payouts` (`payout_status` PostgreSQL enum) |
| V15 | `V15__create_blog_posts_table.sql` | Таблиця `blog_posts` |
| V16 | `V16__add_stripe_fields.sql` | `stripe_account_id`, `stripe_onboarding_complete` в `users`; `stripe_transfer_id` в `payouts` |

### 15.3 Реалізовані фази

**Фаза 0 — Інфраструктура ✅** — pom.xml, application.yml, docker-compose, SecurityConfig, OpenApiConfig; frontend scaffold (Vite, MUI theme, router stubs, Axios + JWT interceptors, AuthContext, ProtectedRoute)

**Фаза 1 — Автентифікація ✅** — User entity + JwtService (JJWT 0.12.x) + AuthService + AuthController; LoginPage + RegisterPage (RHF + Zod)

**Фаза 2 — Каталог ✅** — Category + Asset entities; AssetSpecification (dynamic JPA filters); DataInitializer (7 категорій + demo author + 12 seed активів); AssetCard + SearchBar + Navbar + AssetGrid + HomePage + CatalogPage (infinite scroll) + AssetPage

**Фаза 3 — Wishlist + Cart ✅** — WishlistItem entity + WishlistController; features/wishlist (optimistic toggle) + features/cart (localStorage); CartPage + WishlistPage; Navbar badges

**Фаза 4 — Checkout + Покупки ✅** — Order + OrderItem entities; StorageService (MinIO + fallback); OrderController; CheckoutPage + CheckoutSuccessPage + PurchasesPage

**Фаза 5 — Кабінет автора ✅** — StorageService.uploadFile; AssetService CRUD (PENDING status); AssetsPage + AssetUploadPage + AssetEditPage; Navbar user dropdown (role-based)

**Фаза 6 — Адмін / Модерація ✅** — AdminService + AdminController (@PreAuthorize на класі); rejection_reason field; AdminDashboardPage + ModerationPage + UsersPage

**Фаза 7 — Відгуки + Аналітика ✅** — Review entity (UNIQUE asset+author); ReviewService (перевірка покупки → 403); native SQL analytics; AssetPage відгуки + AnalyticsPage (Recharts)

**Фаза 8 — Тестування ✅** — TestContainers + AbstractIntegrationTest; unit тести (ReviewService, AdminService, AuthService); integration тести (AuthIntegrationTest); Vitest + RTL; AssetCard.test + LoginPage.test

**Фаза 9 — Email + 2FA ✅** — EmailService (Gmail SMTP + @Async); TotpService (HMAC-SHA1, власний Base32); partial JWT flow; password reset + email verification; ForgotPasswordPage + ResetPasswordPage + EmailVerificationPage + SecurityPage (TOTP QR via qrcode.react)

**Після Фази 9 — всі борги закриті ✅**
- AuthenticationEntryPoint + AccessDeniedHandler (JSON ProblemDetail у response)
- Verified author badge (AdminService.verifyUser + UsersPage toggle)
- ProfilePage (avatar upload via POST /auth/me/avatar multipart)
- Real avg_rating (ReviewStatsDto + GET /reviews/stats)
- Router bug fix (ProtectedRoute + lazy, React Router v7)
- DashboardLayout (sticky sidebar 240px, NavLink active state)
- PublicLayout (Navbar + Outlet + Footer, всі публічні сторінки)
- Всі сторінки sitemap: NotificationsPage, PaymentsPage, CategoriesPage, AdminFinancePage (Tabs + payouts), AdminAnalyticsPage, AboutPage, FaqPage, LicensesPage, ContactPage, ErrorPage, MaintenancePage, NotFoundPage
- Payout entity + PayoutService + PayoutsHistory компонент
- Blog API (V15 migration, BlogPostService, BlogPostController, AdminBlogPage; BlogPage/BlogPostPage через API)
- Stripe Connect (V16, StripeService + StripeController; PaymentsPage StripeConnectSection; AdminFinancePage Stripe Transfer кнопка)

### 15.5 Відомі обмеження (demo-режим)

- **Платіжний шлюз**: відсутній — замовлення підтверджуються миттєво зі статусом `PAID`
- **Download URL**: seed-активи не мають `fileKey` → повертається `previewUrls[0]`
- **Email SMTP**: `MAIL_USERNAME` + `MAIL_PASSWORD` у `.env`; якщо не заповнено — warn-лог з посиланням
- **Аватар**: якщо MinIO не налаштований — `generatePresignedUrl()` повертає `picsum.photos` placeholder
- **Stripe**: якщо `STRIPE_SECRET_KEY` порожній — `StripeService.isEnabled()` = false, UI показує disabled стан

### 15.6 Відкриті борги

Усі технічні борги закриті. Нових відкритих боргів немає.

# AssetMaster — Project Context for Claude Code

> Цей файл є єдиним джерелом правди про проект для Claude Code.
> Оновлюй його після кожної значної зміни в архітектурі або вимогах.

---

## 0. Структура репозиторію

```
assetmaster/                 ← корінь проекту
├── CLAUDE.md                ← цей файл
├── frontend/                ← React + TypeScript (Vite)
│   ├── src/                 ← весь код фронтенду (FSD структура, див. розділ 7)
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── backend/                 ← Spring Boot (Java 21)
│   ├── src/
│   │   └── main/
│   │       ├── java/com/assetmaster/api/   ← пакетна структура (див. розділ 13)
│   │       └── resources/
│   │           ├── application.yml
│   │           └── db/migration/           ← Flyway SQL-міграції
│   └── pom.xml
├── docker-compose.yml       ← підіймає backend + frontend + postgres локально
└── .env.example             ← змінні середовища (DB, JWT secret, S3 credentials)
```

### Правила для Claude Code

- Весь фронтенд-код створювати **виключно** у `frontend/src/`
- Весь бекенд-код створювати **виключно** у `backend/src/`
- Міграції БД — у `backend/src/main/resources/db/migration/`
- Конфігурація Docker — у корені репозиторію
- Ніколи не змішувати frontend і backend залежності

### Команди запуску

```bash
# Backend (з кореня або з backend/)
cd backend && ./mvnw spring-boot:run

# Frontend (з кореня або з frontend/)
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
Framework:   Spring Boot 3.x
Security:    Spring Security + JWT (JSON Web Token)
ORM:         Spring Data JPA / Hibernate
БД:          PostgreSQL 15
Міграції:    Flyway
Збірка:      Maven (pom.xml, Maven Wrapper ./mvnw)
Тести:       JUnit 5 + Mockito + TestContainers
Документація API: OpenAPI 3 / Swagger UI
```

### Frontend
```
Мова:        TypeScript 5.x
UI-бібліотека: React 18
Компоненти:  Material UI (MUI) v5 з кастомною темою
Стан сервера: React Query (TanStack Query v5)
Форми:       React Hook Form + Zod (валідація)
Маршрутизація: React Router v6
HTTP-клієнт: Axios з interceptors
Графіки:     Recharts
3D-перегляд: Three.js (для активів типу 3D-model)
Генерація типів: openapi-typescript-codegen (з OpenAPI spec бекенду)
Збірка:      Vite
```

### Infrastructure
```
Контейнеризація: Docker + Docker Compose
ОС сервера:  Ubuntu 22.04 LTS
Файлове сховище: хмарне (S3-сумісне), підписані тимчасові URL (TTL 15 хв)
CI/CD:       (заплановано)
```

---

## 3. Архітектура системи


### Принципи
- **Stateless API** — сесія зберігається на клієнті у вигляді JWT (localStorage)
- **Role-based access** — три ролі: `ROLE_USER` (покупець), `ROLE_AUTHOR` (продавець), `ROLE_ADMIN`
- **Signed URLs** — файли активів ніколи не віддаються напряму; сервер генерує тимчасове підписане посилання (TTL 15 хв) після перевірки прав на покупку
- **OpenAPI-first** — бекенд генерує OpenAPI spec, фронтенд автоматично отримує типи через кодогенератор

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
/auth/register           — Реєстрація (email + OAuth)
/auth/login              — Вхід (з підтримкою 2FA)
/auth/reset-password     — Відновлення пароля
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
/dashboard/profile       — Редагування профілю
/dashboard/notifications — Сповіщення
/dashboard/payments      — Платіжні реквізити
/dashboard/security      — Безпека (2FA, зміна пароля)
```

### 4.5 Адміністративна панель (ROLE_ADMIN)
```
/admin                   — Dashboard (KPI, графіки)
/admin/users             — Управління користувачами (ролі, блокування)
/admin/moderation        — Модерація активів перед публікацією
/admin/finance           — Транзакції та виплати авторам
/admin/analytics         — Звіти, трафік
/admin/categories        — Управління категоріями та тегами
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
users            — id, email, password_hash, role, display_name,
                   avatar_url, bio, is_verified, created_at

assets           — id, author_id (FK users), title, description,
                   category_id (FK categories), price, license_type,
                   status (DRAFT | PENDING | PUBLISHED | REJECTED),
                   file_key (S3), preview_urls (jsonb), tags (text[]),
                   downloads_count, views_count, created_at

categories       — id, name, slug, parent_id (self-ref), icon_url

orders           — id, buyer_id (FK users), total_amount,
                   status (PENDING | PAID | REFUNDED), created_at

order_items      — id, order_id (FK orders), asset_id (FK assets),
                   price_at_purchase, license_type

reviews          — id, asset_id (FK assets), author_id (FK users),
                   rating (1-5), comment, created_at

wishlist_items   — id, user_id (FK users), asset_id (FK assets)

payouts          — id, author_id (FK users), amount, status,
                   period_start, period_end, processed_at
```

---

## 6. REST API — ключові ендпоінти

```
# Публічні
GET  /api/v1/assets              — каталог (query: category, price, license, sort, page)
GET  /api/v1/assets/:id          — деталі активу
GET  /api/v1/assets/search?q=    — пошук
GET  /api/v1/categories          — дерево категорій
GET  /api/v1/authors/:id         — профіль автора

# Авторизація
POST /api/v1/auth/register
POST /api/v1/auth/login          — повертає { accessToken, refreshToken }
POST /api/v1/auth/refresh
POST /api/v1/auth/logout

# Покупець (ROLE_USER)
GET  /api/v1/orders              — мої замовлення
POST /api/v1/orders              — створити замовлення
GET  /api/v1/orders/:id/download/:assetId — отримати підписаний URL файлу
GET  /api/v1/wishlist
POST /api/v1/wishlist/:assetId
DEL  /api/v1/wishlist/:assetId

# Автор (ROLE_AUTHOR)
POST /api/v1/assets              — створити актив
PUT  /api/v1/assets/:id          — оновити актив
DEL  /api/v1/assets/:id
GET  /api/v1/dashboard/analytics — статистика продажів

# Адмін (ROLE_ADMIN)
GET  /api/v1/admin/assets/pending — черга модерації
PUT  /api/v1/admin/assets/:id/approve
PUT  /api/v1/admin/assets/:id/reject
GET  /api/v1/admin/users
PUT  /api/v1/admin/users/:id/role
```

---

## 7. Структура фронтенду (Feature-Sliced Design)

```
src/
├── app/
│   ├── main.tsx             — точка входу
│   ├── App.tsx              — провайдери + маршрутизація
│   ├── router.tsx           — React Router v6 routes
│   └── theme.ts             — MUI кастомна тема (дизайн-токени)
│
├── pages/
│   ├── HomePage/
│   ├── CatalogPage/
│   ├── AssetPage/
│   ├── CheckoutPage/
│   ├── DashboardPage/
│   └── AdminPage/
│
├── widgets/
│   ├── Navbar/              — глобальний navbar (sticky, search, cart)
│   ├── Footer/
│   ├── AssetGrid/           — сітка карток з infinite scroll
│   ├── Sidebar/             — фільтри каталогу
│   └── DashboardLayout/     — layout для всіх /dashboard та /admin сторінок (Navbar + sticky sidebar + Outlet)
│
├── features/
│   ├── auth/                — login, register, JWT refresh logic
│   ├── search/              — SearchBar з debounce + autocomplete
│   ├── cart/                — кошик (Context + localStorage)
│   ├── wishlist/
│   ├── asset-upload/        — форма завантаження активу автором
│   └── checkout/            — оформлення замовлення + платіжний шлюз
│
├── entities/
│   ├── asset/               — типи, API-хуки, AssetCard компонент
│   ├── user/                — типи, хуки профілю
│   ├── order/               — типи, хуки замовлень
│   └── review/
│
└── shared/
    ├── api/
    │   ├── client.ts        — Axios instance + interceptors (JWT, refresh, 401)
    │   └── generated/       — типи з openapi-typescript-codegen
    ├── hooks/               — useDebounce, useIntersectionObserver тощо
    ├── ui/                  — базові UI-примітиви (Button, Modal, Badge…)
    └── utils/
```

---

## 8. Дизайн-система

> **Стиль:** Clean Light SaaS — білий фон, deep navy + electric blue акценти.
> Dark mode існує тільки як набір токенів (swatches у документації), окремого екрана немає.

### Колірна палітра (CSS токени)
```css
/* Brand */
--navy-900: #1A1F3C;   /* заголовки, primary text, seller banner bg */
--navy-800: #232a4d;
--blue-700: #1f5bd1;   /* active стани */
--blue-600: #2f6fe0;   /* hover стани */
--blue-500: #3B82F6;   /* primary CTA, акцент */
--blue-100: #d7e4fd;
--blue-50:  #eef4ff;   /* subtle blue backgrounds */

/* Neutrals (cool-white) */
--white:    #ffffff;   /* основний фон сторінки */
--surface:  #f8f9fc;   /* footer, doc-секція */
--surface-2:#f1f3f9;   /* hover стани, ghost кнопки */
--border:   #e5e8f0;   /* роздільники */
--border-2: #d7dce8;   /* акцентні рамки */

/* Text */
--ink-900: #1A1F3C;    /* primary text */
--ink-700: #3a4163;    /* body text */
--ink-600: #5b6280;    /* secondary text */
--ink-500: #767d97;    /* placeholder, meta */
--ink-400: #9aa0b6;    /* disabled */

/* Semantic */
--green:    #1aa06a;   /* verified author badge, success */
--green-bg: #e6f6ef;
--amber:    #f5a623;   /* рейтинг, зірки */
--rose:     #f2547d;   /* wishlist active, помилки */
--rose-bg:  #fdecf1;
```

#### Dark mode токени (тільки для документації / свотчів)
```css
[data-theme="dark"] {
  --bg-page: #0e1120;
  --surface: #161a2e;
  --surface-2:#1d2238;
  --border:  #272d46;
  --ink-900: #f3f5fb;
  --ink-700: #c7cce0;
  --ink-600: #9aa0bd;
  --blue-500:#5b9bff;
}
```

### Типографіка
```
Заголовки:  Inter (геометричний гротеск)
Тіло:       DM Sans, 16px / line-height 1.6
Код:        JetBrains Mono
```

### Breakpoints
```
Mobile:  < 768px   — 4 колонки, 16px gutter
Tablet:  768–1439px — 8 колонок, 20px gutter
Desktop: ≥ 1440px  — 12 колонок, 24px gutter
```

### Ключові компоненти та їх стани
```
AssetCard:
  - default: thumbnail 16:10, назва, автор, badge категорії, ціна
  - hover:   overlay 40% opacity + кнопка "Переглянути" + wishlist icon
  - loading: MUI Skeleton placeholder

SearchBar:
  - idle:    placeholder "Пошук активів, авторів..."
  - typing:  debounce 300ms → autocomplete dropdown (8 результатів,
             групованих: активи / автори / категорії)
  - focus:   recent searches

AssetCard grid:
  - desktop: 4 col
  - tablet:  3 col
  - mobile:  2 col
  - infinite scroll через Intersection Observer + useInfiniteQuery
```

---

## 9. Безпека

| Механізм | Реалізація |
|----------|-----------|
| Авторизація | JWT accessToken (15 хв) + refreshToken (30 днів) у httpOnly cookie |
| Захист маршрутів | `ProtectedRoute` — перевірка токена + ролі на клієнті; Spring Security на сервері |
| Завантаження файлів | Підписані S3 URL з TTL 15 хв, генеруються тільки після перевірки purchase |
| Валідація | Zod (клієнт) + Spring Validation (сервер) на всіх вхідних даних |
| CORS | Налаштований у Spring Security для дозволених origins |
| SQL ін'єкції | Захист через JPA/Hibernate параметризовані запити |

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
- PostgreSQL індекси на: `assets.status`, `assets.category_id`,
  `assets.price`, `order_items.asset_id`, повнотекстовий індекс на
  `assets.title + assets.description` (tsvector)

---

## 11. Тестування

### Backend
```
Unit тести:     JUnit 5 + Mockito  (сервісний шар, мінімум 80% coverage)
Integration:    TestContainers + реальний PostgreSQL у Docker
API тести:      MockMvc для REST ендпоінтів
```

### Frontend
```
Unit/Component: Vitest + React Testing Library
```

---

## 12. Наступні кроки розробки

```


---

## 13. Конвенції коду

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

### TypeScript / React
```typescript
// Іменування
- Компоненти:   PascalCase (AssetCard.tsx)
- Хуки:         camelCase з префіксом use (useAssets.ts)
- Типи/Інтерфейси: PascalCase з суфіксом (AssetDto, UserProfile)
- Константи:    SCREAMING_SNAKE_CASE
- CSS-токени:   --color-*, --spacing-*, --radius-*

// Стиль
- Тільки функціональні компоненти + хуки
- Пропси завжди типізовані (interface Props)
- Уникати any, використовувати unknown де потрібно
- JSDoc для публічних компонентів та хуків
```


### SQL
```sql
-- Іменування
- Таблиці:     snake_case, множина (users, assets, order_items)
- Колонки:     snake_case (created_at, author_id)
- Індекси:     idx_<table>_<column> (idx_assets_category_id)
- FK:          fk_<table>_<ref_table> (fk_assets_users)
- Міграції:    V{version}__{description}.sql (V1__create_users_table.sql)
```

---

## 14. Дизайн-референси (Claude Design)

> **Workflow:** Claude Design (статичний hi-fi + токени) → зберегти як референс → Claude Code
>
> Інтерактивний прототип не створювався — усі інтеракції реалізуються
> безпосередньо в коді. Макети використовуються виключно як візуальний
> референс для верстки компонентів.

### Що отримано з Claude Design

| Артефакт | Де використовувати |
|----------|--------------------|
| Hi-fi макет головної сторінки (desktop 1440px) | Референс для `HomePage` та компонента `Navbar` |
| Wireframe структури всіх сторінок | Референс для `pages/` та `widgets/` |
| Design tokens (кольори, типографіка, відступи) | `src/app/theme.ts` — MUI ThemeProvider |
| Специфікація компонентів зі станами | `entities/asset/ui/AssetCard` та інші компоненти |
| Annotated UX-рішення | Коментарі у компонентах, де поведінка нетривіальна |

### Структура головної сторінки (з макету)

Реалізувати у `pages/HomePage` у такому порядку секцій:

```
1. <Navbar />               — widgets/Navbar (sticky + blur, пошук, wishlist, cart, аватар)
2. <HeroSection />          — заголовок з градієнтним акцентом, великий search-CTA,
                              popular-теги, 4 trust-метрики (180K+ активів, 12K+ авторів,
                              4.9★, 8.2M завантажень)
3. <CategoryGrid />         — 7 тайлів категорій у рядок: іконка, назва, лічильник активів
4. <AssetGrid label="Trending" />      — 8 карток, алгоритм: продажі + рейтинг за 7 днів
5. <AssetGrid label="Нові надходження" /> — 8 карток, сортування за created_at DESC
6. <SellerCtaBanner />      — темно-синій (--navy-900) banner з роялті/виплати + upload CTA
                              (показувати тільки гостям та ROLE_USER)
7. <Footer />               — widgets/Footer
```

### Специфікація компонента AssetCard (з макету)

```typescript
// Стани та поведінка — точно за макетом
interface AssetCardProps {
  id: string;
  thumbnailUrl: string;   // aspect-ratio: 16/10
  title: string;
  author: { id: string; name: string; avatarUrl: string };
  category: string;       // відображається як MUI Chip (badge)
  price: number;          // у USD
  isInWishlist?: boolean;
  isFeatured?: boolean;   // синя рамка 2px + badge "Вибір редакції"
}

// Hover-стан (200ms ease-in-out):
// - thumbnail overlay: rgba(0,0,0,0.4)
// - з'являється кнопка "Переглянути" по центру оверлею
// - wishlist icon стає visible (opacity 0 → 1)
// - card box-shadow підсилюється

// Loading-стан:
// - MUI Skeleton для thumbnail, title, author, price
```

### Специфікація Navbar (з макету)

```
Ліво:   Логотип (28×28px + назва "AssetMaster")
Центр:  SearchBar (~40% ширини navbar)
           — placeholder: "Пошук активів, авторів, категорій..."
           — debounce: 300ms
           — autocomplete: до 8 результатів, згруповані за типом
           — recent searches при пустому полі
Право:  Icon wishlist → Icon cart (з badge кількості) → Avatar (авторизований)
                                                      → "Увійти" + "Реєстрація" (гість)

Поведінка:
- position: sticky, top: 0, z-index: 1100 (вище MUI Modal = 1300, нижче)
- На mobile (< 768px): логотип + бургер-меню → MUI Drawer
```

### Специфікація сторінки продукту (з макету)

```
Ліва колонка (60%):
  - ImageSlider: до 5 прев'ю (стрілки + dot-індикатор)
  - Для type === '3D_MODEL': Three.js WebGL viewer замість слайдера
  - Вкладки (MUI Tabs): Опис | Характеристики | Відгуки (N)

Права колонка (40%, sticky top: navbar_height + 16px):
  - Назва активу (H1)
  - Author chip (аватар + нікнейм + посилання на профіль)
  - Ціна (велика, акцентний колір)
  - LicenseToggle: Стандартна | Комерційна (MUI ToggleButtonGroup)
  - Button primary:   "Додати до кошика"
  - Button secondary: "Купити зараз" → одразу /checkout
  - Trust bar: рейтинг ★ | кількість продажів | badge "Verified Author"
```

### Дизайн-токени для MUI ThemeProvider

Скопіювати у `src/app/theme.ts` як базу кастомної теми:

```typescript
// Палітра — точно з макету Claude Design (clean light SaaS)
palette: {
  mode: 'light',
  background: {
    default: '#ffffff',   // основний фон сторінки
    paper:   '#f8f9fc',   // картки, панелі (--surface)
  },
  primary:   { main: '#3B82F6', dark: '#1f5bd1', light: '#eef4ff' },  // electric blue
  secondary: { main: '#1A1F3C' },  // deep navy
  warning:   { main: '#f5a623' },  // amber, рейтинг
  error:     { main: '#f2547d' },  // rose
  success:   { main: '#1aa06a' },  // verified green
  text: {
    primary:   '#1A1F3C',  // --ink-900
    secondary: '#5b6280',  // --ink-600
    disabled:  '#9aa0b6',  // --ink-400
  },
  divider: '#e5e8f0',  // --border
},

// Типографіка
typography: {
  fontFamily: '"Inter", "DM Sans", sans-serif',
  h1: { fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.035em' },
  h2: { fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em' },
  body1: { fontSize: '1rem', lineHeight: 1.6 },
  body2: { fontSize: '0.875rem', lineHeight: 1.5 },
},

// Форма компонентів
shape: { borderRadius: 8 },

// Кастомні breakpoints
breakpoints: {
  values: { xs: 0, sm: 560, md: 860, lg: 1080, xl: 1440 },
},

// Spacing базовий = 4px (theme.spacing(1) === '4px')
spacing: 4,
```

### Налаштування MUI компонентів (overrides)

```typescript
// У components секції ThemeProvider:
MuiCard:          { styleOverrides: { root: { background: '#ffffff',
                    border: '1px solid #e5e8f0', borderRadius: 16,
                    transition: 'transform .18s ease, box-shadow .18s ease' } } },
MuiButton:        { styleOverrides: { root: { borderRadius: 12,
                    textTransform: 'none', fontWeight: 600 } } },
MuiChip:          { styleOverrides: { root: { borderRadius: 999 } } },
MuiAppBar:        { styleOverrides: { root: {
                    background: 'rgba(255,255,255,0.86)',
                    backdropFilter: 'blur(12px)',
                    borderBottom: '1px solid #e5e8f0', boxShadow: 'none' } } },
MuiTextField:     { defaultProps: { variant: 'outlined', size: 'small' } },
```

### Важливі UX-рішення з макету (зберегти у коді)

```
// Navbar — position: sticky, top: 0, backdrop-filter: blur(12px)
// background: rgba(255,255,255,0.86) — ефект «матового скла»
// z-index: 50 (вище контенту, нижче MUI Drawer = 1200)

// Navbar — логотип: 34×34px rounded gradient (--blue-500 → --navy-900)
// + текст "AssetMaster" 20px, font-weight 700, letter-spacing -0.03em

// AssetGrid (Trending) — алгоритм ранжування на бекенді:
// ORDER BY (sales_last_7d * 0.7 + avg_rating * 0.3) DESC

// AssetCard hover (200ms ease):
// - translateY(-5px) + box-shadow підсилюється (sh-lg)
// - border-color: transparent
// - thumb-overlay: rgba(0,0,0,0.4) opacity 0 → 1
// - preview-btn: translateY(8px) → translateY(0)
// - wish icon: opacity 0 → 1, translateY(-4px) → translateY(0)

// SellerCtaBanner — фон --navy-900, radial-gradient акцент (--blue-500 40%)
// Показувати тільки гостям та ROLE_USER; приховувати для ROLE_AUTHOR / ROLE_ADMIN

// Checkout → /checkout/success — після успішної оплати
// інвалідувати React Query ключі: ['orders', 'assets']

// Footer — фон --surface (#f8f9fc), border-top: 1px solid --border
// Мінімальний: юридичні посилання + copyright + соц-іконки
// НЕ дублювати навігацію з navbar
```

---

## 15. Стан реалізації (оновлюється після кожної фази)

> Цей розділ фіксує що вже реалізовано, реальні версії бібліотек,
> критичні технічні рішення та відхилення від початкового плану.
> Читай перед початком будь-якої нової фази.

### 15.1 Реальні версії (відрізняються від розділу 2)

| Компонент | Заплановано | Реально |
|-----------|-------------|---------|
| React | 18 | **19** |
| TypeScript | 5.x | **6.0** |
| MUI | v5 | **v9** |
| React Router | v6 | **v7** |
| Vite | — | **7** |
| TanStack Query | v5 | v5 ✓ |
| Spring Boot | 3.x | **3.3.5** |
| MinIO SDK | — | **8.5.11** (додано у Фазі 4) |

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
| V9 | `V9__fix_reviews_rating_type.sql` | `ALTER TABLE reviews ALTER COLUMN rating TYPE INTEGER` — фікс Hibernate validation (SMALLINT vs INTEGER) |
| V10 | `V10__create_password_reset_tokens.sql` | Таблиця `password_reset_tokens` (token UNIQUE, expires_at, used) |
| V11 | `V11__add_email_verification.sql` | Колонка `email_verified` в `users` + таблиця `email_verification_tokens` |
| V12 | `V12__add_totp.sql` | Колонки `totp_secret`, `totp_enabled` в `users` |
| V13 | `V13__create_notifications_table.sql` | Таблиця `notifications` (type, title, body, link, is_read) |
| V14 | `V14__create_payouts_table.sql` | Таблиця `payouts` (author_id FK, amount, payout_status enum, period_start/end, processed_at) |

### 15.3 Реалізовані фази

**Фаза 0 — Інфраструктура ✅**
- `pom.xml`, `application.yml`, `docker-compose.yml`, `SecurityConfig`, `OpenApiConfig`
- Frontend scaffold: Vite, MUI theme, React Router routes (всі сторінки як стаби), Axios client з JWT interceptors, AuthContext, ProtectedRoute

**Фаза 1 — Автентифікація ✅**
- Backend: `User` entity + `UserDetails`, `JwtService` (JJWT 0.12.x), `AuthService`, `AuthController`
- POST `/auth/register`, `/auth/login` (JWT), `/auth/refresh`, `/auth/logout`, GET `/auth/me`
- Frontend: `AuthContext` + `useAuth`, `LoginPage`, `RegisterPage` (React Hook Form + Zod)

**Фаза 2 — Каталог (перегляд) ✅**
- Backend: `Category`, `Asset` entities; `AssetSpecification` (dynamic JPA filters); `DataInitializer` (7 категорій + demo автор `demo@assetmaster.com`/`Demo@1234` + 12 seed активів)
- Public GET endpoints: `/assets`, `/assets/trending`, `/assets/new`, `/assets/search`, `/assets/{id}`, `/categories`
- Frontend: `AssetCard` (hover overlay, skeleton), `SearchBar` (debounce 300ms, custom dropdown), `Navbar`, `AssetGrid`, `HomePage`, `CatalogPage` (infinite scroll), `AssetPage` (ImageSlider, MUI Tabs, license toggle)

**Фаза 3 — Wishlist + Cart ✅**
- Backend: `WishlistItem` entity, V4 migration, `WishlistService` (ідемпотентний add), `WishlistController`
- Frontend: `features/wishlist` (React Query, toggle optimistic), `features/cart` (Context + localStorage), `CartPage`, `WishlistPage`
- `AssetCard` розбито на `AssetCard` + `AssetCardContent` (hooks не можна викликати після early return)
- `Navbar`: wishlist badge (auth only) + cart badge (всі користувачі)

**Фаза 4 — Checkout + Покупки ✅**
- Backend: `Order`, `OrderItem` entities; `StorageService` (MinIO з fallback); `OrderService` (createOrder → статус PAID одразу); `OrderController`
- GET `/orders/{orderId}/download/{assetId}` → fallback на `previewUrls[0]` якщо `fileKey` null (для seed-даних)
- Frontend: `CheckoutPage` (demo Alert, POST /orders → clearCart → navigate state), `CheckoutSuccessPage` (clearCart on mount, download buttons), `PurchasesPage`

**Фаза 5 — Кабінет автора ✅**
- Backend: `StorageService.uploadFile(MultipartFile)` (upload до MinIO або fallback-key); `AuthorAssetDto` (з полем `status`); `AssetRepository.findByAuthorIdOrderByCreatedAtDesc`; `AssetService` — 4 нових методи (getMyAssets, createAsset, updateAsset, deleteAsset); `AssetController` — 4 нових ендпоінти (GET `/mine`, POST/PUT/DELETE) з `@PreAuthorize("hasRole('AUTHOR')")`; `SecurityConfig` — `/assets/mine` requires auth (до wildcardPermitAll); `DataInitializer` — додано admin акаунт `admin@assetmaster.com`/`Admin@1234` (ROLE_ADMIN)
- Frontend: `entities/asset/types.ts` + `AuthorAssetDto`; `features/author-assets/authorAssetApi.ts` + `useAuthorAssets.ts`; `AssetsPage` (таблиця активів з Status chip, edit/delete, confirm dialog); `AssetUploadPage` (RHF + Zod, multipart upload, file drag-zone, preview URLs textarea); `AssetEditPage` (pre-filled via reset(), Controller для categoryId select); `Navbar` → user dropdown menu з MUI Menu (роль-залежні пункти: Мої активи для AUTHOR, Адмін панель для ADMIN)
- Важливо: нові активи мають статус `PENDING`; seed-активи залишаються `PUBLISHED`

**Фаза 6 — Адмін / Модерація ✅**
- Backend: `AdminService` + `AdminController` (`@PreAuthorize` на рівні класу); ендпоінти: `GET /admin/stats`, `GET /admin/assets/pending`, `PUT /admin/assets/{id}/approve`, `PUT /admin/assets/{id}/reject`, `GET /admin/users`, `PUT /admin/users/{id}/role`
- Entity: додано поле `rejectionReason TEXT` до `Asset` (V7 міграція) — зберігається при відхиленні, обнуляється при схваленні
- DTO: `AdminAssetDto`, `AdminUserDto`, `AdminStatsDto`, `RejectAssetRequestDto`, `UpdateUserRoleRequestDto`
- Frontend: `AdminDashboardPage` (4 stat cards з навігацією), `ModerationPage` (таблиця pending-активів, іконки approve/reject, dialog із TextField для причини), `UsersPage` (таблиця, inline `Select` для ролі з `Chip` renderValue)
- Frontend: `features/admin-panel/adminApi.ts` + `useAdmin.ts` (6 функцій, queryKeys для інвалідації)
- Типи `AdminAssetDto`, `AdminUserDto`, `AdminStatsDto` додані до `entities/asset/types.ts`

**Фаза 7 — Відгуки + Аналітика ✅**
- Backend entity: `Review` (asset_id FK, author_id FK, rating SMALLINT, comment TEXT); UNIQUE (asset_id, author_id)
- Backend: `ReviewRepository` (`@EntityGraph({"author"})`, `existsByAssetIdAndAuthorId`, `findAverageRatingByAssetId`); `ReviewService` (перевірка покупки через `OrderItemRepository.existsByBuyerIdAndAssetId` перед створенням); `ReviewController` (`GET/POST /api/v1/assets/{assetId}/reviews`)
- Backend: `AnalyticsService` + `DashboardController` (`GET /dashboard/analytics`, доступ ROLE_AUTHOR або ROLE_ADMIN); нативні SQL-запити через `OrderItemRepository` — `findMonthlySalesByAuthorId` (PostgreSQL `TO_CHAR`, GROUP BY місяць) та `findTopAssetsByAuthorId`
- DTO: `ReviewDto`, `CreateReviewRequestDto` (`@Min(1)/@Max(5)`), `AnalyticsSummaryDto` з nested records `MonthlySalesDto` і `AssetSalesDto`
- Frontend `AssetPage`: вкладка "Відгуки (N)" з реальним лічильником; star picker (1–5), форма (лише авторизованим), список відгуків з аватарами та зірками, пагінація; помилки API (403, 409) відображаються через `Alert`
- Frontend: `AnalyticsPage` — cards (дохід/продажі), `Recharts AreaChart` з градієнтом по місяцях, таблиця топ-10 активів
- features: `reviews/reviewApi.ts`, `reviews/useReviews.ts`, `analytics/analyticsApi.ts`, `analytics/useAnalytics.ts`
- Типи `ReviewDto`, `AnalyticsSummaryDto` додані до `entities/asset/types.ts`

**Фаза 8 — Тестування + Polish ✅**
- Backend: TestContainers додано до `pom.xml` (`spring-boot-testcontainers`, `testcontainers:junit-jupiter`, `testcontainers:postgresql`)
- `AbstractIntegrationTest` — базовий клас для IT-тестів: `@SpringBootTest(RANDOM_PORT)` + `@Testcontainers` + `PostgreSQLContainer` + `@DynamicPropertySource`
- `ApiApplicationTests` — оновлено для розширення `AbstractIntegrationTest`
- `ReviewServiceTest` (4 Mockito unit-тести): 404 asset not found, 403 без покупки, 409 duplicate, success
- `AdminServiceTest` (6 Mockito unit-тестів): approve/reject flow, `requirePending()` кидає 409, stats, users
- `AuthServiceTest` (3 Mockito unit-тести): register success, duplicate email → 409, login; `ReflectionTestUtils.setField` для `@Value refreshExpirySec`
- `AuthIntegrationTest` (4 MockMvc integration-тести): register, duplicate register, login, login wrong password
- Frontend: встановлено `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `@vitest/coverage-v8`, `jsdom`
- `vitest.config.ts` — `globals: true`, `environment: jsdom`, `setupFiles: ['./src/test/setup.ts']`, `server.deps.inline` для MUI
- `src/test/AssetCard.test.tsx` (5 тестів): skeleton, title/price, category chip, author name, link href
- `src/test/LoginPage.test.tsx` (3 тести): field presence, empty submit → обидві Zod-помилки, невалідний email

### 15.4 Критичні технічні рішення

**MUI v9 breaking changes** (викликали помилки компіляції у Фазі 2):
- `<Typography fontWeight={600}>` → `<Typography sx={{ fontWeight: 600 }}>` — system props видалено
- `<Box display="flex">` → `<Box sx={{ display: 'flex' }}>` — те саме для всіх Box props
- Завжди використовувати `sx={{}}` для будь-яких стилів

**TanStack Query v5**:
- `useInfiniteQuery` вимагає `initialPageParam: 0` (обов'язковий параметр)
- `placeholderData: (prev) => prev` — правильний синтаксис (не `keepPreviousData`)
- `isPending` замість `isLoading` для mutations

**Hibernate 6 / Spring Data JPA**:
- JSONB поле: `@JdbcTypeCode(SqlTypes.JSON)` + `@Column(columnDefinition = "jsonb")`
- PostgreSQL `text[]`: `@Column(columnDefinition = "text[]")` + `String[]` у Java
- `@EntityGraph` на всіх `findBy` методах де потрібні зв'язки — уникає N+1
- Derived delete (`deleteByXxx`) вимагає `@Modifying @Transactional`

**Архітектурні рішення**:
- Cart — клієнтський (localStorage), не потребує авторизації
- Wishlist — серверний (PostgreSQL), вимагає авторизації
- Замовлення в demo-режимі одразу зі статусом `PAID` (без платіжного шлюзу)
- `StorageService` — не ламає запуск якщо `MINIO_ENDPOINT` не заданий (fallback URL)
- `DataInitializer implements ApplicationRunner` — seed-дані виконуються після старту Spring context (правильне BCrypt-кодування пароля)

**CORS**: `application.yml` дозволяє `localhost:5173` І `localhost:5174` (Vite може зайняти будь-який порт)

**`GlobalExceptionHandler` — виправлення (між Фазами 5 і 6)**:
- `handleValidation` тепер обробляє і `getGlobalErrors()` (class-level constraints), не лише `getFieldErrors()`; merge через `putIfAbsent` на `LinkedHashMap` замість `Collectors.toMap`
- `handleGeneral` логує виключення через SLF4J (`log.error("Unhandled exception", ex)`) — без цього 500-помилки були «тихими»
- `handleAuth(AuthenticationException)` — ловить лише виключення з контролерів; помилки з JWT-фільтра потребують `AuthenticationEntryPoint` у `SecurityConfig` (не реалізовано, відкладено)

**Адмін — `@PreAuthorize` на рівні класу**:
- `AdminController` має `@PreAuthorize("hasRole('ROLE_ADMIN')")` на класі → всі методи захищені автоматично, не треба повторювати на кожному

**Аналітика — нативні SQL-запити**:
- `OrderItemRepository.findMonthlySalesByAuthorId` і `findTopAssetsByAuthorId` — native `@Query` (не JPQL) через PostgreSQL-специфічні функції (`TO_CHAR`)
- `AnalyticsService` маппить `Object[]` вручну через `((Number) row[N]).longValue()` і `new BigDecimal(row[N].toString())` — важливо для сумісності з різними PostgreSQL-драйверами (повертають `BigInteger` або `Long` залежно від типу)

**MUI v9 — іконки**:
- `@mui/icons-material/PersonOutline` не існує як файл у v9 — використовувати `PersonOutlined` (є відповідний `.js` файл); помилка виникає лише в Vite dev-режимі при прямому імпорті

**Відгуки — бізнес-правила**:
- UNIQUE (asset_id, author_id) на рівні БД + перевірка `existsByAssetIdAndAuthorId` в сервісі (409 Conflict)
- `OrderItemRepository.existsByBuyerIdAndAssetId` вже існував з Фази 4 — переиспользано без змін
- Відгук без покупки → 403 Forbidden (повідомлення видно у `Alert` на фронтенді)

**Flyway — checksum protection**:
- Не можна редагувати вже застосовані міграції — Flyway падає з checksum mismatch
- Виправлення схеми завжди через нову версію (V8 з SMALLINT → V9 виправляє через `ALTER COLUMN ... TYPE INTEGER`)

**Vitest 4.x + MUI v9 — `server.deps.inline`**:
- `@mui/material/internal/Transition.mjs` імпортує `react-transition-group/TransitionGroupContext` як directory import
- Node.js ESM не підтримує directory imports → помилка при запуску тестів
- Фікс: `test.server.deps.inline: ['react-transition-group', '@mui/material', '@mui/icons-material']` у `vitest.config.ts` — змушує Vitest обробляти ці пакети через Vite bundler (з ESM/CJS interop)
- `resolve.alias` та `deps.optimizer.web.include` для цього не підходять — вони не поширюються на транзитивні імпорти всередині `node_modules`

**AuthServiceTest — специфіка**:
- `RegisterRequestDto` конструктор: `(email, displayName, password)` — НЕ `(email, password, displayName)`
- `jwtService.generateAccessToken(user)` — правильна назва методу (не `generateToken`)
- `ReflectionTestUtils.setField(authService, "refreshExpirySec", 3600L)` в `@BeforeEach` для інжекції `@Value` поля

**Фаза 9 — Email + 2FA ✅**
- Migrations: V10 (password_reset_tokens), V11 (email_verified + email_verification_tokens), V12 (totp_secret + totp_enabled)
- Backend entities: `PasswordResetToken`, `EmailVerificationToken` + відповідні repositories
- `EmailService`: Gmail SMTP через `MimeMessage` + HTML-шаблони; `@Async` (потребує `@EnableAsync` на `ApiApplication`); fallback warn-лог якщо `MAIL_USERNAME` порожній; `app.base-url` у `application.yml`
- `TotpService`: HMAC-SHA1 TOTP без зовнішніх залежностей — власний Base32 encode/decode, ±1 window для clock skew
- `JwtService`: `generatePartialToken()` (5 хв, `2fa_pending: true` claim) + `isPartialToken()` + `isTokenValid()` відхиляє partial tokens
- `AuthResponseDto`: discriminated union `{ requires2fa, partialToken, accessToken, user }` + factory methods `success()` / `pending2fa()`
- `UserResponseDto`: додано `emailVerified`, `totpEnabled`
- `AuthService`: 8 нових методів (register/login з email+2FA, verify2fa, verifyEmail, resendVerification, forgotPassword, resetPassword, setupTotp, enableTotp, disableTotp)
- `AuthController`: 8 нових ендпоінтів (GET `/verify-email`, POST `/verify-email/resend`, `/forgot-password`, `/reset-password`, `/2fa/verify`, GET `/2fa/setup`, POST `/2fa/enable`, `/2fa/disable`)
- `DataInitializer`: seed-користувачі мають `emailVerified(true)`
- Frontend `features/auth/types.ts`: `AuthResponse` discriminated union, `UserDto` з `emailVerified`+`totpEnabled`, `LoginResult` type
- Frontend `features/auth/authApi.ts`: 9 API-функцій для нових ендпоінтів
- Frontend `AuthContext`: `login()` повертає `LoginResult`; додано `verify2fa()`, `refreshUser()`
- Frontend: `LoginPage` — 2-кроковий flow (credentials → TOTP step state machine)
- Frontend: `RegisterPage` — після успіху показує "Перевірте пошту" замість redirect
- Frontend нові сторінки: `ForgotPasswordPage`, `ResetPasswordPage` (замінює stub), `EmailVerificationPage` (auto-verify on mount), `SecurityPage` (TOTP setup + enable/disable)
- Router: нові маршрути `/auth/forgot-password`, `/auth/verify-email`, `/dashboard/security`
- Navbar: "Безпека" MenuItem у dropdown → `/dashboard/security`
- `LoginPage.test.tsx`: mock `login` повертає `{ requires2fa: false }`, додано mock `verify2fa`

### 15.5 Відомі обмеження (demo-режим)

- **Платіжний шлюз**: відсутній — замовлення підтверджуються миттєво зі статусом `PAID`
- **Download URL**: seed-активи не мають `fileKey` → повертається `previewUrls[0]`; реальні файли в MinIO потребують окремого upload
- **Email SMTP**: налаштовується через `MAIL_USERNAME` + `MAIL_PASSWORD` (Gmail App Password) у `.env`; якщо не заповнено — warn у лог з повним посиланням замість відправки
- **avg_rating**: обчислюється на льоту через `AVG` SQL-запит, не кешується — для масштабу варто денормалізувати у `assets.avg_rating`

### 15.6 Відкриті борги

Усі технічні борги закриті. Залишаються тільки demo-обмеження:

| Тема | Статус |
|------|--------|
| Платіжний шлюз | Demo-режим — форма є, реальний шлюз не підключений |
| Blog | Статичний контент у `shared/data/blogPosts.ts`, без CMS |
| Payouts | Повний CRUD реалізовано; реальна виплата — лише через адмін-інтерфейс |

### 15.7 Реалізовано після Фази 9 (борги 15.6)

**`AuthenticationEntryPoint` + `AccessDeniedHandler` у `SecurityConfig`**
- `SecurityConfig` отримав `ObjectMapper` через `@RequiredArgsConstructor`
- `handleUnauthorized` / `handleForbidden` пишуть JSON `ProblemDetail` напряму у `HttpServletResponse`

**Верифікований автор badge**
- `AssetDetailDto` і `AssetSummaryDto` — нове поле `authorVerified: boolean`
- `AdminService.verifyUser()` + `PUT /admin/users/{id}/verify?verified=true/false`
- `AssetPage`: "Verified Author" chip; `AssetCard`: зелена іконка поруч з іменем
- `UsersPage`: клікабельний chip → toggle через `useVerifyUser` mutation

**ProfilePage**
- Картка акаунту (аватар-прев'ю, роль, email, verified badge) + форма редагування (displayName, avatarUrl, bio)
- Backend: `UpdateProfileRequestDto`, `PATCH /api/v1/auth/me`, `AuthService.updateProfile()`
- `UserResponseDto` + `UserDto` (frontend) отримали поле `bio`
- `SecurityConfig`: явні `authenticated()` правила для `GET/PATCH /auth/me` перед `permitAll` на `auth/**`

**Реальний avg_rating на AssetPage**
- `GET /assets/{assetId}/reviews/stats` → `ReviewStatsDto(avgRating, count)`
- `AssetPage` trust bar: реальний рейтинг + лічильник; ховається якщо відгуків 0
- `useCreateReview.onSuccess` інвалідує `['reviews', assetId]` — накриває і stats, і list

**Router — виправлено баг ProtectedRoute + lazy**
- React Router v7: статичний `element` перемагає `Component` з `lazy` — сторінка не рендерилась
- `ProtectedRoute` рендерить `<Outlet />` коли `children` відсутні
- `router.tsx`: layout-routes `ProtectedRoute → DashboardLayout → page`

**QR-код у SecurityPage → `qrcode.react`**
- `qrcode.react@4.2.0`; `QRCodeSVG` замінює `<img src="api.qrserver.com/...">`
- Генерація локальна, без зовнішніх запитів, працює offline

**DashboardLayout**
- `widgets/DashboardLayout/DashboardLayout.tsx`: Navbar + sticky sidebar (240px, desktop) + `<Outlet />`
- Sidebar секції: Загальне (всі ролі) / Автор (ROLE_AUTHOR) / Адміністрування (ROLE_ADMIN)
- `NavLink` + `&.active` MUI sx — підсвічування без зайвого state
- Checkout (`/checkout`, `/checkout/success`) навмисно поза DashboardLayout
- Видалено `<Navbar />` + `<Footer />` + outer wrapper з 5 сторінок: PurchasesPage, WishlistPage, AssetsPage, AssetUploadPage, AssetEditPage

**`.env.example` — виправлено імена змінних MinIO**
- `S3_*` → `MINIO_*` щоб відповідати `application.yml` (`MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`)

**Реалізація боргів 15.6 (всі сторінки sitemap)**
- `/dashboard/notifications`: `Notification` entity/repo/service/controller (V13 migration, seed-нотифікації); `features/notifications/notificationApi.ts` + `useNotifications.ts`; `NotificationsPage` (список з chip-типами, кнопка "Читати всі", per-item mark-read); sidebar badge з лічильником непрочитаних (refetch кожну хвилину)
- `/dashboard/payments`: `PaymentsPage` — форма реквізитів для виплат + saved payment methods (demo-режим, всі поля disabled)
- `/admin/categories`: `UpsertCategoryRequestDto`; `CategoryService` CRUD (create/update/delete з перевіркою slug uniqueness); ендпоінти в `AdminController`; `CategoriesPage` (таблиця + dialog create/edit + confirm delete)
- `/admin/finance`: `AdminFinanceSummaryDto`; нативні SQL-запити в `OrderItemRepository` (platform monthly revenue, top authors); `AdminService.getFinanceSummary()`; `AdminFinancePage` (stat cards + AreaChart + топ авторів)
- `/admin/analytics`: `AdminPlatformAnalyticsDto`; merge monthly users (`UserRepository`) + revenue (`OrderItemRepository`) + top categories (`AssetRepository`); `AdminService.getPlatformAnalytics()`; `AdminAnalyticsPage` (KPI cards + dual-axis AreaChart + horizontal BarChart категорій)
- `/500`: `ErrorPage` з кнопкою "Оновити сторінку" та "На головну"
- `/maintenance`: `MaintenancePage` з іконкою та повідомленням
- `/about`: `AboutPage` (stats, місія, команда)
- `/faq`: `FaqPage` (7 Q&A через MUI Accordion)
- `/licenses`: `LicensesPage` (порівняльна таблиця Standard vs Commercial)
- `/contact`: `ContactPage` (форма з name/email/subject/message, demo submit)
- `/blog`: `BlogPage` (6 static posts у card grid)
- `DashboardLayout` — sidebar: додано Сповіщення/Платіжні реквізити (commonItems) та Фінанси/Аналітика/Категорії (adminItems); `useCommonItems` хук замість константи (для badge)
- `NotFoundPage` — повноцінна сторінка з великим "404" і кнопками

**Реалізація технічних боргів**
- `Payout` entity + `PayoutStatus` enum + V14 міграція (`payout_status` PostgreSQL enum); `PayoutRepository`; `PayoutService` (getAuthorPayouts, getAllPayouts, triggerPayout, updateStatus); `PayoutDto`, `TriggerPayoutRequestDto`
- `DashboardController`: GET `/dashboard/payouts` (`hasRole AUTHOR or ADMIN`) — автор бачить свої виплати
- `AdminController`: GET `/admin/finance/payouts`, POST `/admin/finance/payouts`, PUT `/admin/finance/payouts/{id}/status`
- Seed: 3 payouts для demo author (2 PAID квітень/березень, 1 PENDING травень)
- `PaymentsPage`: для ROLE_AUTHOR показує `PayoutsHistory` компонент (summary cards + таблиця виплат) + форма реквізитів; для ROLE_USER — тільки форма
- `AdminFinancePage`: отримав вкладки (Tabs) "Огляд" та "Виплати авторам"; вкладка payouts — таблиця з inline Select для зміни статусу + dialog для нової виплати
- `features/analytics/payoutsApi.ts` + `usePayouts.ts` — авторський хук
- `adminApi.ts` + `useAdmin.ts`: `fetchAdminPayouts`, `triggerPayout`, `updatePayoutStatus`, `useAdminPayouts`, `useTriggerPayout`, `useUpdatePayoutStatus`
- Blog: `shared/data/blogPosts.ts` — масив з 6 постами (slug, tag, title, excerpt, date, readTime, content у markdown-like форматі); `BlogPostPage.tsx` (рендерить контент, знаходить пост за slug, fallback 404); `BlogPage` тепер імпортує з `blogPosts.ts`; роутер `/blog/:slug` → `BlogPostPage`

**Критичні технічні рішення (finance/analytics native queries)**:
- `OrderItemRepository.sumPlatformTotalRevenue()` / `sumPlatformMonthRevenue()` — JPQL та native для platform-wide агрегатів
- `AdminService.getPlatformAnalytics()` мержить `userRepository.findMonthlyRegistrations()` (users по місяцях) і `orderItemRepository.findPlatformMonthlyRevenue()` через `LinkedHashMap<String, long[]>` де `long[2]` зберігає revenue × 100 (щоб не втрачати дробову частину при merge)
- `AdminController` — `CategoryService` + `AdminService` ін'єктуються обидва (Lombok `@RequiredArgsConstructor`); category CRUD в тому самому контролері під `@PreAuthorize("hasRole('ROLE_ADMIN')")` на класі

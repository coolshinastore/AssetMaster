# AssetMaster — Frontend Context

> Деталізований контекст для `frontend/`. Загальний огляд проекту, API та DB схема — у кореневому `CLAUDE.md`.

---

## Правила

- Весь код — виключно у `frontend/src/`
- Не змішувати frontend і backend залежності
- Запуск: `cd frontend && npm run dev`

---

## 7. Структура фронтенду (Feature-Sliced Design)

```
src/
├── app/
│   ├── main.tsx             — точка входу
│   ├── App.tsx              — провайдери + маршрутизація
│   ├── router.tsx           — React Router v7 routes
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
│   ├── Navbar/              — глобальний navbar (sticky, search, cart, user dropdown)
│   ├── Footer/
│   ├── AssetGrid/           — сітка карток з infinite scroll
│   ├── Sidebar/             — фільтри каталогу
│   ├── DashboardLayout/     — layout /dashboard та /admin (Navbar + sticky sidebar 240px + Outlet)
│   └── PublicLayout/        — layout публічних сторінок (Navbar + Outlet + Footer, minHeight 100vh)
│
├── features/
│   ├── auth/                — login, register, JWT refresh, 2FA, email verification
│   ├── search/              — SearchBar з debounce + autocomplete
│   ├── cart/                — кошик (Context + localStorage)
│   ├── wishlist/
│   ├── asset-upload/        — форма завантаження активу автором
│   ├── checkout/            — оформлення замовлення
│   ├── reviews/             — відгуки (reviewApi + useReviews)
│   ├── analytics/           — аналітика автора (analyticsApi + useAnalytics + payoutsApi)
│   ├── notifications/       — сповіщення (notificationApi + useNotifications)
│   ├── blog/                — публічний блог (blogApi + useBlog)
│   ├── stripe/              — Stripe Connect (stripeApi + useStripe)
│   └── admin-panel/         — adminApi + useAdmin (модерація, юзери, фінанси, блог, категорії)
│
├── entities/
│   ├── asset/               — типи (AssetSummaryDto, AssetDetailDto, AuthorAssetDto,
│   │                          AdminAssetDto, AdminUserDto, AdminStatsDto,
│   │                          ReviewDto, AnalyticsSummaryDto), API-хуки, AssetCard
│   ├── user/                — типи (UserDto з emailVerified, totpEnabled, stripeConnected,
│   │                          stripeOnboardingComplete, bio), хуки профілю
│   ├── order/               — типи, хуки замовлень
│   └── review/
│
└── shared/
    ├── api/
    │   ├── client.ts        — Axios instance + interceptors (JWT, refresh, 401)
    │   └── generated/       — типи з openapi-typescript-codegen
    ├── data/
    │   └── blogPosts.ts     — static blog posts (залишено як референс, не використовується в UI)
    ├── hooks/               — useDebounce, useIntersectionObserver тощо
    ├── ui/                  — базові UI-примітиви (Button, Modal, Badge…)
    └── utils/
```

### Layout-роути в router.tsx

```
PublicLayout → всі публічні сторінки (/, /catalog, /assets/:id, /blog, /about, /faq, /licenses, /contact)
ProtectedRoute → DashboardLayout → всі /dashboard/* та /admin/* сторінки
Поза layout: /checkout, /checkout/success (власний Navbar+Footer), /500, /maintenance
```

### DashboardLayout sidebar секції

```
Загальне (всі ролі):   Профіль, Сповіщення (badge непрочитаних), Платіжні реквізити, Безпека
Автор (ROLE_AUTHOR):   Мої активи, Аналітика
Адміністрування (ROLE_ADMIN): Огляд, Модерація, Користувачі, Фінанси, Аналітика, Категорії, Блог
```

---

## 8. Дизайн-система

> **Стиль:** Clean Light SaaS — білий фон, deep navy + electric blue акценти.
> Dark mode — тільки набір токенів (swatches у документації), окремого екрана немає.

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
Mobile:  < 768px    — 4 колонки, 16px gutter
Tablet:  768–1439px — 8 колонок, 20px gutter
Desktop: ≥ 1440px   — 12 колонок, 24px gutter
```

### Ключові компоненти та їх стани

```
AssetCard:
  - default: thumbnail 16:10, назва, автор (+ зелена іконка якщо verified), badge категорії, ціна
  - hover:   overlay 40% opacity + кнопка "Переглянути" + wishlist icon (200ms ease-in-out)
  - loading: MUI Skeleton placeholder

SearchBar:
  - idle:    placeholder "Пошук активів, авторів..."
  - typing:  debounce 300ms → autocomplete dropdown (8 результатів, grouped: активи/автори/категорії)
  - focus:   recent searches

AssetCard grid:
  - desktop: 4 col, tablet: 3 col, mobile: 2 col
  - infinite scroll через Intersection Observer + useInfiniteQuery
```

### Дизайн-токени для MUI ThemeProvider (`src/app/theme.ts`)

```typescript
palette: {
  mode: 'light',
  background: { default: '#ffffff', paper: '#f8f9fc' },
  primary:   { main: '#3B82F6', dark: '#1f5bd1', light: '#eef4ff' },
  secondary: { main: '#1A1F3C' },
  warning:   { main: '#f5a623' },
  error:     { main: '#f2547d' },
  success:   { main: '#1aa06a' },
  text: { primary: '#1A1F3C', secondary: '#5b6280', disabled: '#9aa0b6' },
  divider: '#e5e8f0',
},
typography: {
  fontFamily: '"Inter", "DM Sans", sans-serif',
  h1: { fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.035em' },
  h2: { fontFamily: '"DM Sans", sans-serif', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.03em' },
  body1: { fontSize: '1rem', lineHeight: 1.6 },
  body2: { fontSize: '0.875rem', lineHeight: 1.5 },
},
shape: { borderRadius: 8 },
breakpoints: { values: { xs: 0, sm: 560, md: 860, lg: 1080, xl: 1440 } },
spacing: 4,  // theme.spacing(1) === '4px'
```

### MUI компоненти (overrides)

```typescript
MuiCard:      { styleOverrides: { root: { background: '#ffffff', border: '1px solid #e5e8f0',
                borderRadius: 16, transition: 'transform .18s ease, box-shadow .18s ease' } } },
MuiButton:    { styleOverrides: { root: { borderRadius: 12, textTransform: 'none', fontWeight: 600 } } },
MuiChip:      { styleOverrides: { root: { borderRadius: 999 } } },
MuiAppBar:    { styleOverrides: { root: { background: 'rgba(255,255,255,0.86)',
                backdropFilter: 'blur(12px)', borderBottom: '1px solid #e5e8f0', boxShadow: 'none' } } },
MuiTextField: { defaultProps: { variant: 'outlined', size: 'small' } },
```

---

## 13. Конвенції коду (TypeScript / React)

```typescript
// Іменування
- Компоненти:      PascalCase (AssetCard.tsx)
- Хуки:            camelCase з префіксом use (useAssets.ts)
- Типи/Інтерфейси: PascalCase з суфіксом (AssetDto, UserProfile)
- Константи:       SCREAMING_SNAKE_CASE
- CSS-токени:      --color-*, --spacing-*, --radius-*

// Стиль
- Тільки функціональні компоненти + хуки
- Пропси завжди типізовані (interface Props)
- Уникати any, використовувати unknown де потрібно
- JSDoc для публічних компонентів та хуків
- MUI v9: ЗАВЖДИ використовувати sx={{}} для будь-яких стилів (system props видалено)
```

---

## 14. Дизайн-референси

> Макети — статичний hi-fi референс. Всі інтеракції реалізуються безпосередньо в коді.

### Структура HomePage (порядок секцій)

```
1. <Navbar />               — sticky + blur, пошук, wishlist, cart, аватар
2. <HeroSection />          — градієнтний заголовок, search-CTA, popular-теги,
                              4 trust-метрики (180K+ активів, 12K+ авторів, 4.9★, 8.2M завантажень)
3. <CategoryGrid />         — 7 тайлів: іконка, назва, лічильник активів
4. <AssetGrid label="Trending" />         — 8 карток (sales_last_7d * 0.7 + avg_rating * 0.3)
5. <AssetGrid label="Нові надходження" /> — 8 карток (created_at DESC)
6. <SellerCtaBanner />      — navy-900 bg, radial-gradient акцент; тільки гостям та ROLE_USER
7. <Footer />
```

### Специфікація AssetCard (hover 200ms ease)

```
- translateY(-5px) + box-shadow підсилюється
- border-color: transparent
- thumb-overlay: rgba(0,0,0,0.4) opacity 0 → 1
- preview-btn: translateY(8px) → translateY(0)
- wish icon: opacity 0 → 1, translateY(-4px) → translateY(0)
```

### Специфікація Navbar

```
Ліво:   Логотип 34×34px rounded gradient (--blue-500 → --navy-900) + "AssetMaster" 20px 700
Центр:  SearchBar ~40% ширини, debounce 300ms, autocomplete 8 результатів grouped
Право:  wishlist icon → cart icon (badge) → Avatar (auth) або "Увійти"+"Реєстрація" (guest)

position: sticky, top: 0, backdrop-filter: blur(12px)
background: rgba(255,255,255,0.86)
z-index: 50 (нижче MUI Drawer = 1200)
Mobile < 768px: логотип + бургер → MUI Drawer
```

### Специфікація AssetPage

```
Ліва колонка (60%):
  - ImageSlider: до 5 прев'ю (стрілки + dot-індикатор)
  - type === '3D_MODEL': Three.js WebGL viewer
  - Tabs: Опис | Характеристики | Відгуки (N)

Права колонка (40%, sticky top: navbar_height + 16px):
  - Назва (H1), Author chip, Ціна
  - LicenseToggle: Стандартна | Комерційна (price * 2)
  - "Додати до кошика" + "Купити зараз"
  - Trust bar: avg_rating ★ | кількість продажів | "Verified Author" chip
```

---

## Критичні технічні рішення (frontend)

### MUI v9 breaking changes

- `<Typography fontWeight={600}>` → `<Typography sx={{ fontWeight: 600 }}>` — system props видалено
- `<Box display="flex">` → `<Box sx={{ display: 'flex' }}>` — те саме для всіх Box props
- Іконки: `PersonOutline` не існує → використовувати `PersonOutlined`; `CheckCircleOutline` → `CheckCircleOutlined`, `HelpOutline` → `HelpOutlined`, `ErrorOutline` → `ErrorOutlined`

### TanStack Query v5

- `useInfiniteQuery` вимагає `initialPageParam: 0` (обов'язковий параметр)
- `placeholderData: (prev) => prev` — правильний синтаксис (не `keepPreviousData`)
- `isPending` замість `isLoading` для mutations

### React Router v7 — ProtectedRoute + lazy

- Статичний `element` перемагає `Component` з `lazy` — сторінка не рендерилась
- `ProtectedRoute` рендерить `<Outlet />` коли `children` відсутні
- `router.tsx`: layout-routes `ProtectedRoute → DashboardLayout → page`

### AuthContext — login() та 2FA flow

- `login()` повертає `LoginResult` — або `{ requires2fa: false }` або `{ requires2fa: true }`
- `LoginPage` — 2-кроковий state machine: credentials step → TOTP step
- `features/auth/types.ts`: `AuthResponse` discriminated union, `LoginResult` type
- `LoginPage.test.tsx`: mock `login` повертає `{ requires2fa: false }`, додано mock `verify2fa`

### Vitest 4.x + MUI v9 — `server.deps.inline`

- `@mui/material/internal/Transition.mjs` → `react-transition-group/TransitionGroupContext` — directory import не підтримується Node.js ESM
- Фікс у `vitest.config.ts`: `test.server.deps.inline: ['react-transition-group', '@mui/material', '@mui/icons-material']`
- `resolve.alias` та `deps.optimizer.web.include` не підходять — не поширюються на транзитивні імпорти в `node_modules`

### ProfilePage — аватар upload

- `authApi.uploadAvatar(file)` — POST multipart до `POST /api/v1/auth/me/avatar`
- Кліковий Avatar з CameraAltOutlinedIcon overlay + hidden `<input type="file">` + spinner
- Zod schema: `avatarUrl` поле видалено; `PATCH /auth/me` відправляє тільки `displayName` + `bio`

### SecurityPage — QR-код

- `qrcode.react@4.2.0`; `QRCodeSVG` — генерація локальна, без зовнішніх запитів, offline

### Stripe Connect — PaymentsPage

- `StripeConnectSection` — 4 стани: Stripe disabled / not connected / onboarding incomplete / connected
- Обробляє `?stripe=success` та `?stripe=refresh` query params після redirect

### Layouts — важливо

- `PublicLayout`: `<Box minHeight:100vh flexDirection:column>` → Navbar + `<Box flex:1><Outlet /></Box>` + Footer
- `DashboardLayout`: Navbar + sticky sidebar (240px, desktop) + `<Outlet />`; `NavLink` + `&.active` MUI sx
- Checkout (`/checkout`, `/checkout/success`) — навмисно **поза** обома layouts (має власний Navbar+Footer)
- `/500`, `/maintenance` — поза PublicLayout (системні сторінки без layout)
- Sidebar notifications badge: `refetch` кожну хвилину

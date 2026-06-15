package com.assetmaster.api.config;

import com.assetmaster.api.entity.*;
import com.assetmaster.api.repository.AssetRepository;
import com.assetmaster.api.repository.BlogPostRepository;
import com.assetmaster.api.repository.CategoryRepository;
import com.assetmaster.api.repository.NotificationRepository;
import com.assetmaster.api.repository.PayoutRepository;
import com.assetmaster.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final NotificationRepository notificationRepository;
    private final PayoutRepository payoutRepository;
    private final BlogPostRepository blogPostRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (categoryRepository.count() > 0) {
            log.info("Seed data already exists, skipping.");
            return;
        }
        log.info("Seeding initial data...");
        seedCategories();
        seedDemoData();
        log.info("Seed data created successfully."); // NOSONAR
    }

    private void seedPayouts(User author) {
        payoutRepository.saveAll(java.util.List.of(
            Payout.builder().author(author).amount(new BigDecimal("127.50"))
                .status(PayoutStatus.PAID)
                .periodStart(java.time.LocalDate.of(2026, 4, 1))
                .periodEnd(java.time.LocalDate.of(2026, 4, 30))
                .processedAt(java.time.Instant.parse("2026-05-05T10:00:00Z"))
                .notes("Квітень 2026").build(),
            Payout.builder().author(author).amount(new BigDecimal("84.20"))
                .status(PayoutStatus.PAID)
                .periodStart(java.time.LocalDate.of(2026, 3, 1))
                .periodEnd(java.time.LocalDate.of(2026, 3, 31))
                .processedAt(java.time.Instant.parse("2026-04-04T10:00:00Z"))
                .notes("Березень 2026").build(),
            Payout.builder().author(author).amount(new BigDecimal("201.00"))
                .status(PayoutStatus.PENDING)
                .periodStart(java.time.LocalDate.of(2026, 5, 1))
                .periodEnd(java.time.LocalDate.of(2026, 5, 31))
                .notes("Травень 2026 — очікує обробки").build()
        ));
    }

    private void seedCategories() {
        List<String[]> cats = List.of(
                new String[]{"3D Моделі",    "3d-models",    "🎯"},
                new String[]{"UI Kit",        "ui-kits",      "🎨"},
                new String[]{"Шаблони",       "templates",    "📄"},
                new String[]{"Шрифти",        "fonts",        "🔤"},
                new String[]{"Ілюстрації",    "illustrations","🖼️"},
                new String[]{"Фото",          "photos",       "📷"},
                new String[]{"Game Assets",   "game-assets",  "🎮"}
        );
        for (String[] c : cats) {
            categoryRepository.save(Category.builder()
                    .name(c[0]).slug(c[1]).iconUrl(c[2]).build());
        }
    }

    private void seedDemoData() {
        User admin = userRepository.save(User.builder()
                .email("admin@gmail.com")
                .passwordHash(passwordEncoder.encode("admin123"))
                .displayName("AssetMaster Admin")
                .role(Role.ROLE_ADMIN)
                .verified(true)
                .emailVerified(true)
                .build());

        User author = userRepository.save(User.builder()
                .email("author@gmail.com")
                .passwordHash(passwordEncoder.encode("author123"))
                .displayName("Demo Studio")
                .role(Role.ROLE_AUTHOR)
                .verified(true)
                .emailVerified(true)
                .build());

        Map<String, Category> cats = categoryRepository.findAll().stream()
                .collect(Collectors.toMap(Category::getSlug, c -> c));

        record Seed(String title, String desc, String slug, String price,
                    String[] tags, int downloads, List<String> previews) {}

        List<Seed> seeds = List.of(
            new Seed("Sci-Fi Spaceship Pack",
                "High-quality low-poly sci-fi spaceships for games and renders. Includes 5 unique models with PBR textures.",
                "3d-models", "49.99",
                new String[]{"3d", "sci-fi", "spaceship", "lowpoly"}, 342,
                List.of("https://picsum.photos/seed/ship1/800/500", "https://picsum.photos/seed/ship2/800/500")),

            new Seed("Medieval Castle Environment",
                "Detailed medieval castle modular pack. 40+ assets with LODs, perfect for RPG games.",
                "3d-models", "79.99",
                new String[]{"3d", "medieval", "castle", "environment"}, 215,
                List.of("https://picsum.photos/seed/castle1/800/500", "https://picsum.photos/seed/castle2/800/500")),

            new Seed("Dashboard UI Kit Pro",
                "80+ components for professional web dashboards. Figma source included. Light & dark variants.",
                "ui-kits", "29.99",
                new String[]{"ui", "dashboard", "components", "figma"}, 891,
                List.of("https://picsum.photos/seed/dash1/800/500", "https://picsum.photos/seed/dash2/800/500")),

            new Seed("Mobile App UI Kit",
                "Complete iOS & Android UI kit with 120+ screens. Includes onboarding, e-commerce, social flows.",
                "ui-kits", "19.99",
                new String[]{"ui", "mobile", "ios", "android"}, 654,
                List.of("https://picsum.photos/seed/mobile1/800/500")),

            new Seed("Landing Page Template Set",
                "10 modern React landing page templates. Fully responsive, TailwindCSS, easy to customize.",
                "templates", "24.99",
                new String[]{"template", "landing", "react", "web"}, 423,
                List.of("https://picsum.photos/seed/landing1/800/500", "https://picsum.photos/seed/landing2/800/500")),

            new Seed("Portfolio Website Template",
                "Clean minimalist portfolio for creatives and developers. Built with Next.js and Framer Motion.",
                "templates", "14.99",
                new String[]{"template", "portfolio", "minimal", "nextjs"}, 312,
                List.of("https://picsum.photos/seed/port1/800/500")),

            new Seed("Geometric Sans Font Family",
                "Modern geometric sans-serif with 6 weights (Thin–Black) + italics. OpenType features included.",
                "fonts", "39.99",
                new String[]{"font", "sans-serif", "geometric", "typeface"}, 178,
                List.of("https://picsum.photos/seed/font1/800/500")),

            new Seed("Handwritten Script Pack",
                "3 elegant handwritten script fonts for branding, packaging, and editorial design.",
                "fonts", "19.99",
                new String[]{"font", "script", "handwritten", "calligraphy"}, 267,
                List.of("https://picsum.photos/seed/script1/800/500")),

            new Seed("Isometric Tech Icons",
                "300+ isometric technology icons for presentations, UI, and infographics. SVG + PNG formats.",
                "illustrations", "34.99",
                new String[]{"icons", "isometric", "tech", "illustration"}, 534,
                List.of("https://picsum.photos/seed/icons1/800/500", "https://picsum.photos/seed/icons2/800/500")),

            new Seed("Abstract Gradient Pack",
                "50 abstract gradient compositions for backgrounds, covers, and social media. 8K resolution.",
                "illustrations", "24.99",
                new String[]{"abstract", "gradient", "background", "art"}, 289,
                List.of("https://picsum.photos/seed/grad1/800/500")),

            new Seed("Urban Architecture Collection",
                "100 high-resolution urban architecture photos. Shot in Kyiv, Barcelona, and Berlin. RAW files included.",
                "photos", "49.99",
                new String[]{"photo", "architecture", "urban", "city"}, 445,
                List.of("https://picsum.photos/seed/urban1/800/500", "https://picsum.photos/seed/urban2/800/500")),

            new Seed("RPG Character Sprites Pack",
                "Animated RPG character sprites in 16×16 and 32×32 px. 8 characters × 12 animations each.",
                "game-assets", "59.99",
                new String[]{"game", "rpg", "sprites", "pixel-art"}, 678,
                List.of("https://picsum.photos/seed/rpg1/800/500", "https://picsum.photos/seed/rpg2/800/500"))
        );

        for (Seed s : seeds) {
            assetRepository.save(Asset.builder()
                    .author(author)
                    .title(s.title())
                    .description(s.desc())
                    .category(cats.get(s.slug()))
                    .price(new BigDecimal(s.price()))
                    .tags(s.tags())
                    .downloadsCount(s.downloads())
                    .previewUrls(s.previews())
                    .status(AssetStatus.PUBLISHED)
                    .licenseType(LicenseType.STANDARD)
                    .build());
        }

        seedNotifications(author, admin);
        seedPayouts(author);
        seedBlogPosts(admin);
    }

    private void seedBlogPosts(User admin) {
        record BP(String slug, String tag, String title, String excerpt, String readTime, String content) {}

        List<BP> posts = List.of(
            new BP("how-to-sell-3d-assets", "3D Моделі",
                "Як продавати 3D-активи та заробляти стабільний дохід",
                "Розглядаємо стратегії монетизації 3D-моделей: від оптимального ціноутворення до SEO-оптимізації сторінки активу.",
                "8 хв",
                "## Ринок 3D-активів у 2026 році\n\nПопит на якісні 3D-моделі зростає щороку — геймдев, метавсесвіт, AR/VR і анімація потребують тисячі нових ресурсів.\n\n## Що продається найкраще\n\n**Тематичні паки** перевершують поодинокі моделі у 3–4 рази за конверсією.\n\n**Оптимізація** — одна з найважливіших переваг. Low-poly моделі з LOD-рівнями мають вищий рейтинг у геймдев-категорії.\n\n**PBR-текстури** стали стандартом. Без Albedo/Normal/Roughness/Metallic ваш актив не конкуруватиме.\n\n## Ціноутворення\n\n- Одна модель (проста): $5–15\n- Пак (5–10 моделей): $30–60\n- Середовище (40+ об'єктів): $60–120\n\n## SEO на сторінці активу\n\n- Заголовок: ключове слово + категорія + стиль\n- Опис: 300+ слів із технічними деталями\n- Теги: мінімум 8, включайте движки (Unity, Unreal, Blender)\n\n## Висновок\n\nСтабільний дохід на AssetMaster — це системна робота: якість + SEO + регулярні оновлення паку."),
            new BP("ui-kit-best-practices", "UI Кіт",
                "UI Кіти: чому покупці обирають саме їх",
                "Аналізуємо топ-50 UI Кітів на AssetMaster та виявляємо спільні риси.",
                "6 хв",
                "## Чому UI Кіти — лідери продажів\n\nUI Кіти займають 28% від загального обороту AssetMaster.\n\n## Спільні риси топ-50\n\n**Компонентна архітектура** — покупці хочуть 80+ готових елементів.\n\n**Figma + код** — UI Кіти з вихідними файлами Figma і готовим React/Vue-кодом продаються вдвічі краще.\n\n**Темна та світла тема** — обидві теми підвищують конверсію на 35%.\n\n## Ціноутворення\n\n- 20–40 компонентів: $15–25\n- 80+ компонентів + код: $30–60\n- Повна система дизайну: $80–150"),
            new BP("licensing-guide", "Ліцензування",
                "Стандартна чи комерційна ліцензія: як не помилитися",
                "Повний гід по ліцензіях AssetMaster — що дозволено, що ні, і коли потрібна комерційна.",
                "5 хв",
                "## Дві ліцензії AssetMaster\n\n### Стандартна ліцензія\n\nДозволяє:\n- Використання в одному кінцевому продукті\n- Веб-сайти, застосунки, друковані матеріали\n\nЗабороняє:\n- Перепродаж «як є»\n- Включення у шаблони для перепродажу\n\n### Комерційна ліцензія\n\nУсе, що дозволяє стандартна, плюс:\n- Комерційні проєкти для клієнтів\n- Включення у продукти для перепродажу\n- Необмежена кількість проєктів\n\n## Якщо сумніваєтесь\n\nЗверніться до нас через /contact або купіть комерційну ліцензію."),
            new BP("author-tips-2026", "Поради авторам",
                "10 порад для авторів, що хочуть подвоїти продажі у 2026",
                "Конкретні кроки від досвідчених авторів: теги, прев'ю, ціноутворення та промоція.",
                "10 хв",
                "## 10 перевірених порад\n\n**1. Прев'ю — найважливіше**\nПерший зразок визначає 70% кліків.\n\n**2. Опис — мінімум 200 слів**\nАлгоритм пошуку враховує довжину і насиченість опису.\n\n**3. 8–12 тегів на актив**\nВключайте широкі та вузькі теги.\n\n**4. Оновлення — безкоштовний буст**\nНевелике оновлення повертає актив у топ.\n\n**5. Бандли підвищують середній чек**\nОб'єднайте 3–5 схожих активів у пак зі знижкою 20–30%.\n\n**6. Відповідайте на відгуки**\nАвтори, що відповідають на всі відгуки, мають на 40% вищий рейтинг.\n\n**7. Соціальні мережі**\nДрібкліп із процесом створення → посилання на AssetMaster.\n\n**8. Ексклюзив першого місяця**\nНові активи зі знижкою 25% генерують більше відгуків.\n\n**9. Стандартна + Комерційна завжди**\nЦе збільшує AOV на 35%.\n\n**10. Регулярність важливіша за ідеальність**\nОдин актив щотижня > один «ідеальний» актив раз на квартал."),
            new BP("game-assets-market", "Game Assets",
                "Ринок ігрових активів зростає: що це означає для авторів",
                "Game assets стали найбільш зростаючою категорією. Як скористатися цим трендом.",
                "7 хв",
                "## Game Assets: +47% за рік\n\nЗа даними внутрішньої аналітики AssetMaster, категорія Game Assets зросла на 47% порівняно з 2025 роком.\n\n## Чому зростає попит\n\n- Indie-геймдев демократизується: Unity/Godot/Unreal доступні безкоштовно\n- Мобільний геймінг вимагає нових активів щомісяця\n- AR/VR-ринок у фазі активного зростання\n\n## Що шукають покупці\n\n**Pixel Art** — 16×16, 32×32, 64×64 символи і тайли.\n\n**Low Poly 3D** — оптимізовані моделі для мобільних ігор.\n\n**UI для ігор** — health bars, inventory, buttons.\n\n**SFX Пакети** — звукові ефекти. Аудіо — найменш конкурентна ніша."),
            new BP("assetmaster-new-features", "Оновлення",
                "Нові функції AssetMaster: сповіщення, відгуки та 2FA",
                "Що нового з'явилось на платформі: система сповіщень, верифіковані автори та безпека акаунту.",
                "4 хв",
                "## Що нового на AssetMaster\n\n### Система сповіщень\n\nТепер ви отримуєте сповіщення в реальному часі:\n- Нова покупка вашого активу\n- Схвалення або відхилення активу модератором\n- Новий відгук на ваш актив\n\n### Верифіковані автори\n\nАвтори з підтвердженою особистістю отримують зелений бейдж ✓.\n\n### Двофакторна автентифікація (2FA)\n\nЗахистіть свій акаунт за допомогою TOTP-застосунку. Налаштування доступне в /dashboard/security.\n\n### Система відгуків\n\nПокупці, що придбали актив, можуть залишити відгук із рейтингом ★1–★5.")
        );

        for (BP p : posts) {
            blogPostRepository.save(BlogPost.builder()
                    .slug(p.slug()).tag(p.tag()).title(p.title())
                    .excerpt(p.excerpt()).readTime(p.readTime())
                    .content(p.content()).published(true).author(admin).build());
        }
    }

    private void seedNotifications(User author, User admin) {
        notificationRepository.saveAll(List.of(
            Notification.builder().user(author).type("ASSET_APPROVED").title("Актив схвалено")
                .body("Ваш актив «Sci-Fi Spaceship Pack» опубліковано та доступний у каталозі.")
                .link("/dashboard/assets").build(),
            Notification.builder().user(author).type("ORDER_PLACED").title("Нова покупка")
                .body("Покупець придбав «Dashboard UI Kit Pro» за $29.99.")
                .link("/dashboard/analytics").build(),
            Notification.builder().user(author).type("NEW_REVIEW").title("Новий відгук")
                .body("На ваш актив «RPG Character Sprites Pack» залишили відгук ★5.")
                .link("/assets/12").read(true).build(),
            Notification.builder().user(admin).type("SYSTEM").title("Нові активи на перевірці")
                .body("3 активи очікують модерації.")
                .link("/admin/moderation").build()
        ));
    }
}

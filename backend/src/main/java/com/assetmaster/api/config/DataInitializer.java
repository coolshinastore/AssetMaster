package com.assetmaster.api.config;

import com.assetmaster.api.entity.*;
import com.assetmaster.api.repository.AssetRepository;
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

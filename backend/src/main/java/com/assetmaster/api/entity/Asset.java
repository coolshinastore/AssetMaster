package com.assetmaster.api.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "assets")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "license_type", nullable = false, length = 50)
    @Builder.Default
    private LicenseType licenseType = LicenseType.STANDARD;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private AssetStatus status = AssetStatus.DRAFT;

    @Column(name = "file_key", length = 2048)
    private String fileKey;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "preview_urls", columnDefinition = "jsonb")
    @Builder.Default
    private List<String> previewUrls = new ArrayList<>();

    @Column(columnDefinition = "text[]")
    @Builder.Default
    private String[] tags = new String[0];

    @Column(name = "downloads_count", nullable = false)
    @Builder.Default
    private int downloadsCount = 0;

    @Column(name = "views_count", nullable = false)
    @Builder.Default
    private int viewsCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}

package com.assetmaster.api.controller;

import com.assetmaster.api.dto.AssetDetailDto;
import com.assetmaster.api.dto.AssetSummaryDto;
import com.assetmaster.api.dto.AuthorAssetDto;
import com.assetmaster.api.entity.LicenseType;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.service.AssetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/assets")
@RequiredArgsConstructor
@Tag(name = "Assets", description = "Публічний каталог цифрових активів")
public class AssetController {

    private final AssetService assetService;

    private Long userId(Authentication auth) {
        return ((User) auth.getPrincipal()).getId();
    }

    @GetMapping
    @Operation(summary = "Каталог з фільтрами та пагінацією")
    public ResponseEntity<Page<AssetSummaryDto>> getCatalog(
            @RequestParam(required = false) Long category,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String license,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        LicenseType licenseType = null;
        if (license != null && !license.isBlank()) {
            try { licenseType = LicenseType.valueOf(license.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }

        return ResponseEntity.ok(assetService.getCatalog(
                category, minPrice, maxPrice, licenseType, sort, page, Math.min(size, 50)));
    }

    @GetMapping("/trending")
    @Operation(summary = "Найпопулярніші активи (для головної сторінки)")
    public ResponseEntity<List<AssetSummaryDto>> getTrending(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(assetService.getTrending(Math.min(limit, 20)));
    }

    @GetMapping("/new")
    @Operation(summary = "Нові активи (для головної сторінки)")
    public ResponseEntity<List<AssetSummaryDto>> getNew(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(assetService.getNew(Math.min(limit, 20)));
    }

    @GetMapping("/search")
    @Operation(summary = "Пошук активів за назвою")
    public ResponseEntity<Page<AssetSummaryDto>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(assetService.search(q, page, Math.min(size, 50)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Детальна інформація про актив")
    public ResponseEntity<AssetDetailDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(assetService.getById(id));
    }

    // ── Author endpoints ──────────────────────────────────────────────────────

    @GetMapping("/mine")
    @PreAuthorize("hasRole('AUTHOR')")
    @Operation(summary = "Список активів поточного автора (всі статуси)")
    public ResponseEntity<List<AuthorAssetDto>> getMyAssets(Authentication auth) {
        return ResponseEntity.ok(assetService.getMyAssets(userId(auth)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('AUTHOR')")
    @Operation(summary = "Створити новий актив (статус PENDING)")
    public ResponseEntity<AssetDetailDto> createAsset(
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam Long categoryId,
            @RequestParam BigDecimal price,
            @RequestParam(defaultValue = "STANDARD") String licenseType,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String previewUrls,
            @RequestParam(required = false) MultipartFile file,
            Authentication auth) {

        return ResponseEntity.status(HttpStatus.CREATED).body(
                assetService.createAsset(userId(auth), title, description, categoryId,
                        price, licenseType, tags, previewUrls, file));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('AUTHOR')")
    @Operation(summary = "Оновити актив")
    public ResponseEntity<AssetDetailDto> updateAsset(
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal price,
            @RequestParam(required = false) String licenseType,
            @RequestParam(required = false) String tags,
            @RequestParam(required = false) String previewUrls,
            @RequestParam(required = false) MultipartFile file,
            Authentication auth) {

        return ResponseEntity.ok(
                assetService.updateAsset(userId(auth), id, title, description, categoryId,
                        price, licenseType, tags, previewUrls, file));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('AUTHOR')")
    @Operation(summary = "Видалити актив")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id, Authentication auth) {
        assetService.deleteAsset(userId(auth), id);
        return ResponseEntity.noContent().build();
    }
}

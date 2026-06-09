package com.assetmaster.api.service;

import com.assetmaster.api.dto.AssetDetailDto;
import com.assetmaster.api.dto.AssetSummaryDto;
import com.assetmaster.api.dto.AuthorAssetDto;
import com.assetmaster.api.entity.Asset;
import com.assetmaster.api.entity.AssetStatus;
import com.assetmaster.api.entity.LicenseType;
import com.assetmaster.api.exception.ApiException;
import com.assetmaster.api.repository.AssetRepository;
import com.assetmaster.api.repository.CategoryRepository;
import com.assetmaster.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AssetService {

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final StorageService storageService;

    public List<AssetSummaryDto> getTrending(int limit) {
        PageRequest pageable = PageRequest.of(0, limit, Sort.by(Direction.DESC, "downloadsCount"));
        return assetRepository.findByStatus(AssetStatus.PUBLISHED, pageable)
                .getContent().stream().map(AssetSummaryDto::fromEntity).toList();
    }

    public List<AssetSummaryDto> getNew(int limit) {
        PageRequest pageable = PageRequest.of(0, limit, Sort.by(Direction.DESC, "createdAt"));
        return assetRepository.findByStatus(AssetStatus.PUBLISHED, pageable)
                .getContent().stream().map(AssetSummaryDto::fromEntity).toList();
    }

    public Page<AssetSummaryDto> getCatalog(Long categoryId, BigDecimal minPrice, BigDecimal maxPrice,
                                             LicenseType license, String sort, int page, int size) {
        Sort sortObj = switch (sort == null ? "newest" : sort) {
            case "trending"   -> Sort.by(Direction.DESC, "downloadsCount");
            case "price_asc"  -> Sort.by(Direction.ASC,  "price");
            case "price_desc" -> Sort.by(Direction.DESC, "price");
            default           -> Sort.by(Direction.DESC, "createdAt");
        };

        PageRequest pageable = PageRequest.of(page, size, sortObj);

        Specification<Asset> spec = Specification.where(AssetSpecification.isPublished())
                .and(AssetSpecification.inCategory(categoryId))
                .and(AssetSpecification.priceBetween(minPrice, maxPrice))
                .and(AssetSpecification.hasLicense(license));

        return assetRepository.findAll(spec, pageable).map(AssetSummaryDto::fromEntity);
    }

    @Transactional
    public AssetDetailDto getById(Long id) {
        Asset asset = assetRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Актив не знайдено"));

        asset.setViewsCount(asset.getViewsCount() + 1);

        return AssetDetailDto.fromEntity(asset);
    }

    public Page<AssetSummaryDto> search(String q, int page, int size) {
        String pattern = "%" + q.toLowerCase() + "%";
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Direction.DESC, "createdAt"));
        return assetRepository.searchByTitle(AssetStatus.PUBLISHED, pattern, pageable)
                .map(AssetSummaryDto::fromEntity);
    }

    // ── Author methods ────────────────────────────────────────────────────────

    public List<AuthorAssetDto> getMyAssets(Long authorId) {
        return assetRepository.findByAuthorIdOrderByCreatedAtDesc(authorId)
                .stream().map(AuthorAssetDto::fromEntity).toList();
    }

    @Transactional
    public AssetDetailDto createAsset(Long authorId, String title, String description,
                                      Long categoryId, BigDecimal price, String licenseType,
                                      String tags, String previewUrlsRaw, MultipartFile file) {
        String fileKey = null;
        if (file != null && !file.isEmpty()) {
            fileKey = storageService.uploadFile(file);
        }

        Asset asset = Asset.builder()
                .author(userRepository.getReferenceById(authorId))
                .title(title)
                .description(description)
                .category(categoryId != null ? categoryRepository.findById(categoryId).orElse(null) : null)
                .price(price)
                .licenseType(parseLicense(licenseType))
                .status(AssetStatus.PENDING)
                .fileKey(fileKey)
                .previewUrls(parsePreviewUrls(previewUrlsRaw))
                .tags(parseTags(tags))
                .build();

        return AssetDetailDto.fromEntity(assetRepository.save(asset));
    }

    @Transactional
    public AssetDetailDto updateAsset(Long authorId, Long assetId, String title, String description,
                                      Long categoryId, BigDecimal price, String licenseType,
                                      String tags, String previewUrlsRaw, MultipartFile file) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Актив не знайдено"));

        if (!asset.getAuthor().getId().equals(authorId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Немає доступу до цього активу");
        }

        if (title != null && !title.isBlank())       asset.setTitle(title);
        if (description != null)                      asset.setDescription(description);
        if (price != null)                            asset.setPrice(price);
        if (licenseType != null && !licenseType.isBlank()) asset.setLicenseType(parseLicense(licenseType));
        if (tags != null)                             asset.setTags(parseTags(tags));
        if (previewUrlsRaw != null)                   asset.setPreviewUrls(parsePreviewUrls(previewUrlsRaw));
        if (categoryId != null)                       categoryRepository.findById(categoryId).ifPresent(asset::setCategory);
        if (file != null && !file.isEmpty()) {
            asset.setFileKey(storageService.uploadFile(file));
        }

        return AssetDetailDto.fromEntity(assetRepository.save(asset));
    }

    @Transactional
    public void deleteAsset(Long authorId, Long assetId) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Актив не знайдено"));

        if (!asset.getAuthor().getId().equals(authorId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Немає доступу до цього активу");
        }

        assetRepository.delete(asset);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private LicenseType parseLicense(String raw) {
        if (raw == null || raw.isBlank()) return LicenseType.STANDARD;
        try { return LicenseType.valueOf(raw.toUpperCase()); }
        catch (IllegalArgumentException e) { return LicenseType.STANDARD; }
    }

    private List<String> parsePreviewUrls(String raw) {
        if (raw == null || raw.isBlank()) return new ArrayList<>();
        return Arrays.stream(raw.split("\n"))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    private String[] parseTags(String raw) {
        if (raw == null || raw.isBlank()) return new String[0];
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
    }
}

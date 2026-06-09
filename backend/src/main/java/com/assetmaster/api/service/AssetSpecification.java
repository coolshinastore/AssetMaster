package com.assetmaster.api.service;

import com.assetmaster.api.entity.Asset;
import com.assetmaster.api.entity.AssetStatus;
import com.assetmaster.api.entity.LicenseType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;

public final class AssetSpecification {

    private AssetSpecification() {}

    public static Specification<Asset> isPublished() {
        return (root, query, cb) -> cb.equal(root.get("status"), AssetStatus.PUBLISHED);
    }

    public static Specification<Asset> inCategory(Long categoryId) {
        if (categoryId == null) return Specification.where(null);
        return (root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Asset> priceBetween(BigDecimal min, BigDecimal max) {
        return (root, query, cb) -> {
            Predicate p = cb.conjunction();
            if (min != null) p = cb.and(p, cb.greaterThanOrEqualTo(root.get("price"), min));
            if (max != null) p = cb.and(p, cb.lessThanOrEqualTo(root.get("price"), max));
            return p;
        };
    }

    public static Specification<Asset> hasLicense(LicenseType license) {
        if (license == null) return Specification.where(null);
        return (root, query, cb) -> cb.equal(root.get("licenseType"), license);
    }
}

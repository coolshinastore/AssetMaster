package com.assetmaster.api.dto;

import com.assetmaster.api.entity.Asset;
import com.assetmaster.api.entity.OrderItem;

import java.math.BigDecimal;

public record OrderItemDto(
        Long assetId,
        String assetTitle,
        String thumbnailUrl,
        String authorName,
        BigDecimal priceAtPurchase,
        String licenseType
) {
    public static OrderItemDto fromEntity(OrderItem item) {
        Asset asset = item.getAsset();
        String thumbnail = (asset.getPreviewUrls() != null && !asset.getPreviewUrls().isEmpty())
                ? asset.getPreviewUrls().get(0) : null;
        String author = asset.getAuthor() != null ? asset.getAuthor().getDisplayName() : null;
        return new OrderItemDto(
                asset.getId(),
                asset.getTitle(),
                thumbnail,
                author,
                item.getPriceAtPurchase(),
                item.getLicenseType().name()
        );
    }
}

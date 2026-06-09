package com.assetmaster.api.dto;

import com.assetmaster.api.entity.Category;

public record CategoryDto(
        Long id,
        String name,
        String slug,
        String iconUrl,
        Long parentId,
        long assetCount
) {
    public static CategoryDto fromEntity(Category c, long assetCount) {
        return new CategoryDto(
                c.getId(),
                c.getName(),
                c.getSlug(),
                c.getIconUrl(),
                c.getParent() != null ? c.getParent().getId() : null,
                assetCount
        );
    }
}

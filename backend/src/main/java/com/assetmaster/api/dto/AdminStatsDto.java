package com.assetmaster.api.dto;

public record AdminStatsDto(
        long totalUsers,
        long totalAssets,
        long pendingAssets,
        long publishedAssets
) {}

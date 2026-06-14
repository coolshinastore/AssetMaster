package com.assetmaster.api.dto;

public record ReviewStatsDto(
        double avgRating,
        long   count
) {}

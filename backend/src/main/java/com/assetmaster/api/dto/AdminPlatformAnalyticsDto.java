package com.assetmaster.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record AdminPlatformAnalyticsDto(
        long totalUsers,
        long totalAssets,
        long publishedAssets,
        long totalOrders,
        BigDecimal totalRevenue,
        List<MonthlyStatDto> monthly,
        List<CategoryStatDto> topCategories
) {
    public record MonthlyStatDto(String month, long newUsers, long orders, BigDecimal revenue) {}
    public record CategoryStatDto(String name, long assetCount) {}
}

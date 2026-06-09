package com.assetmaster.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record AnalyticsSummaryDto(
        BigDecimal totalEarnings,
        long totalSales,
        List<MonthlySalesDto> monthlySales,
        List<AssetSalesDto> topAssets
) {
    public record MonthlySalesDto(String month, long salesCount, BigDecimal earnings) {}

    public record AssetSalesDto(Long id, String title, long salesCount, BigDecimal earnings) {}
}

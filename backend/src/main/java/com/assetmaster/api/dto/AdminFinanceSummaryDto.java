package com.assetmaster.api.dto;

import java.math.BigDecimal;
import java.util.List;

public record AdminFinanceSummaryDto(
        BigDecimal totalRevenue,
        BigDecimal monthRevenue,
        long totalOrders,
        List<MonthlyRevenueDto> monthly,
        List<TopAuthorDto> topAuthors
) {
    public record MonthlyRevenueDto(String month, long orders, BigDecimal revenue) {}
    public record TopAuthorDto(Long authorId, String displayName, long sales, BigDecimal earnings) {}
}

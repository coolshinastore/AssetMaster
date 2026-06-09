package com.assetmaster.api.service;

import com.assetmaster.api.dto.AnalyticsSummaryDto;
import com.assetmaster.api.dto.AnalyticsSummaryDto.AssetSalesDto;
import com.assetmaster.api.dto.AnalyticsSummaryDto.MonthlySalesDto;
import com.assetmaster.api.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final OrderItemRepository orderItemRepository;

    public AnalyticsSummaryDto getAuthorAnalytics(Long authorId) {
        BigDecimal totalEarnings = orderItemRepository.sumEarningsByAuthorId(authorId);
        long totalSales = orderItemRepository.countSalesByAuthorId(authorId);

        List<MonthlySalesDto> monthlySales = orderItemRepository
                .findMonthlySalesByAuthorId(authorId)
                .stream()
                .map(row -> new MonthlySalesDto(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        new BigDecimal(row[2].toString())
                ))
                .toList();

        List<AssetSalesDto> topAssets = orderItemRepository
                .findTopAssetsByAuthorId(authorId)
                .stream()
                .map(row -> new AssetSalesDto(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        new BigDecimal(row[3].toString())
                ))
                .toList();

        return new AnalyticsSummaryDto(totalEarnings, totalSales, monthlySales, topAssets);
    }
}

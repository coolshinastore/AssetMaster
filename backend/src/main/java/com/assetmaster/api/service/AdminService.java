package com.assetmaster.api.service;

import com.assetmaster.api.dto.AdminAssetDto;
import com.assetmaster.api.dto.AdminFinanceSummaryDto;
import com.assetmaster.api.dto.AdminPlatformAnalyticsDto;
import com.assetmaster.api.dto.AdminStatsDto;
import com.assetmaster.api.dto.AdminUserDto;
import com.assetmaster.api.entity.Asset;
import com.assetmaster.api.entity.AssetStatus;
import com.assetmaster.api.entity.OrderStatus;
import com.assetmaster.api.entity.Role;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.exception.ApiException;
import com.assetmaster.api.repository.AssetRepository;
import com.assetmaster.api.repository.OrderItemRepository;
import com.assetmaster.api.repository.OrderRepository;
import com.assetmaster.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public AdminStatsDto getStats() {
        return new AdminStatsDto(
                userRepository.count(),
                assetRepository.count(),
                assetRepository.countByStatus(AssetStatus.PENDING),
                assetRepository.countByStatus(AssetStatus.PUBLISHED)
        );
    }

    public Page<AdminAssetDto> getPendingAssets(int page, int size) {
        return assetRepository
                .findByStatus(AssetStatus.PENDING, PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt")))
                .map(AdminAssetDto::fromEntity);
    }

    @Transactional
    public void approveAsset(Long id) {
        Asset asset = findAssetOrThrow(id);
        requirePending(asset);
        asset.setStatus(AssetStatus.PUBLISHED);
        asset.setRejectionReason(null);
    }

    @Transactional
    public void rejectAsset(Long id, String reason) {
        Asset asset = findAssetOrThrow(id);
        requirePending(asset);
        asset.setStatus(AssetStatus.REJECTED);
        asset.setRejectionReason(reason);
    }

    public Page<AdminUserDto> getUsers(int page, int size) {
        return userRepository
                .findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(AdminUserDto::fromEntity);
    }

    @Transactional
    public AdminUserDto updateUserRole(Long id, String roleName) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Користувача не знайдено"));
        Role role;
        try {
            role = Role.valueOf(roleName);
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Невідома роль: " + roleName);
        }
        user.setRole(role);
        return AdminUserDto.fromEntity(userRepository.save(user));
    }

    @Transactional
    public AdminUserDto verifyUser(Long id, boolean verified) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Користувача не знайдено"));
        user.setVerified(verified);
        return AdminUserDto.fromEntity(userRepository.save(user));
    }

    public AdminFinanceSummaryDto getFinanceSummary() {
        BigDecimal totalRevenue = orderItemRepository.sumPlatformTotalRevenue();
        BigDecimal monthRevenue = orderItemRepository.sumPlatformMonthRevenue();
        long totalOrders = orderRepository.countByStatus(OrderStatus.PAID);

        List<AdminFinanceSummaryDto.MonthlyRevenueDto> monthly = orderItemRepository
                .findPlatformMonthlyRevenue().stream()
                .map(row -> new AdminFinanceSummaryDto.MonthlyRevenueDto(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        new BigDecimal(row[2].toString())))
                .toList();

        List<AdminFinanceSummaryDto.TopAuthorDto> topAuthors = orderItemRepository
                .findTopAuthorsByEarnings().stream()
                .map(row -> new AdminFinanceSummaryDto.TopAuthorDto(
                        ((Number) row[0]).longValue(),
                        (String) row[1],
                        ((Number) row[2]).longValue(),
                        new BigDecimal(row[3].toString())))
                .toList();

        return new AdminFinanceSummaryDto(totalRevenue, monthRevenue, totalOrders, monthly, topAuthors);
    }

    public AdminPlatformAnalyticsDto getPlatformAnalytics() {
        long totalUsers = userRepository.count();
        long totalAssets = assetRepository.count();
        long publishedAssets = assetRepository.countByStatus(AssetStatus.PUBLISHED);
        long totalOrders = orderRepository.countByStatus(OrderStatus.PAID);
        BigDecimal totalRevenue = orderItemRepository.sumPlatformTotalRevenue();

        // Build monthly map: month → {newUsers, orders, revenue}
        Map<String, long[]> monthlyMap = new java.util.LinkedHashMap<>();
        for (Object[] row : userRepository.findMonthlyRegistrations()) {
            String month = (String) row[0];
            monthlyMap.computeIfAbsent(month, k -> new long[3])[0] = ((Number) row[1]).longValue();
        }
        for (Object[] row : orderItemRepository.findPlatformMonthlyRevenue()) {
            String month = (String) row[0];
            long[] entry = monthlyMap.computeIfAbsent(month, k -> new long[3]);
            entry[1] = ((Number) row[1]).longValue();
            entry[2] = new BigDecimal(row[2].toString()).multiply(BigDecimal.valueOf(100)).longValue();
        }

        List<AdminPlatformAnalyticsDto.MonthlyStatDto> monthly = monthlyMap.entrySet().stream()
                .sorted(Map.Entry.<String, long[]>comparingByKey().reversed())
                .limit(12)
                .map(e -> new AdminPlatformAnalyticsDto.MonthlyStatDto(
                        e.getKey(),
                        e.getValue()[0],
                        e.getValue()[1],
                        BigDecimal.valueOf(e.getValue()[2], 2)))
                .toList();

        List<AdminPlatformAnalyticsDto.CategoryStatDto> topCategories = assetRepository
                .findTopCategoriesByAssetCount().stream()
                .map(row -> new AdminPlatformAnalyticsDto.CategoryStatDto(
                        (String) row[0], ((Number) row[1]).longValue()))
                .toList();

        return new AdminPlatformAnalyticsDto(totalUsers, totalAssets, publishedAssets,
                totalOrders, totalRevenue, monthly, topCategories);
    }

    private Asset findAssetOrThrow(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Актив не знайдено"));
    }

    private void requirePending(Asset asset) {
        if (asset.getStatus() != AssetStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT, "Актив не має статусу PENDING");
        }
    }
}

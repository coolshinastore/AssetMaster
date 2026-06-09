package com.assetmaster.api.service;

import com.assetmaster.api.dto.CreateOrderRequestDto;
import com.assetmaster.api.dto.DownloadUrlDto;
import com.assetmaster.api.dto.OrderDetailDto;
import com.assetmaster.api.entity.*;
import com.assetmaster.api.exception.ApiException;
import com.assetmaster.api.repository.AssetRepository;
import com.assetmaster.api.repository.OrderItemRepository;
import com.assetmaster.api.repository.OrderRepository;
import com.assetmaster.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final StorageService storageService;

    @Transactional
    public OrderDetailDto createOrder(Long userId, CreateOrderRequestDto request) {
        List<Asset> assets = request.items().stream()
                .map(item -> {
                    Asset asset = assetRepository.findById(item.assetId())
                            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Актив не знайдено: " + item.assetId()));
                    if (asset.getStatus() != AssetStatus.PUBLISHED) {
                        throw new ApiException(HttpStatus.BAD_REQUEST, "Актив недоступний для покупки: " + asset.getId());
                    }
                    return asset;
                })
                .toList();

        BigDecimal total = assets.stream()
                .map(Asset::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        User buyer = userRepository.getReferenceById(userId);

        Order order = orderRepository.save(Order.builder()
                .buyer(buyer)
                .totalAmount(total)
                .status(OrderStatus.PAID)
                .build());

        for (int i = 0; i < assets.size(); i++) {
            Asset asset = assets.get(i);
            LicenseType license = LicenseType.valueOf(request.items().get(i).licenseType());

            orderItemRepository.save(OrderItem.builder()
                    .order(order)
                    .asset(asset)
                    .priceAtPurchase(asset.getPrice())
                    .licenseType(license)
                    .build());

            asset.setDownloadsCount(asset.getDownloadsCount() + 1);
        }

        return OrderDetailDto.fromEntity(
                orderRepository.findByIdAndBuyerId(order.getId(), userId).orElseThrow()
        );
    }

    @Transactional(readOnly = true)
    public List<OrderDetailDto> getOrders(Long userId) {
        return orderRepository.findByBuyerIdOrderByCreatedAtDesc(userId).stream()
                .map(OrderDetailDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderDetailDto getOrderById(Long userId, Long orderId) {
        Order order = orderRepository.findByIdAndBuyerId(orderId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Замовлення не знайдено"));
        return OrderDetailDto.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public DownloadUrlDto getDownloadUrl(Long userId, Long orderId, Long assetId) {
        Order order = orderRepository.findByIdAndBuyerId(orderId, userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Замовлення не знайдено"));

        OrderItem item = order.getItems().stream()
                .filter(i -> i.getAsset().getId().equals(assetId))
                .findFirst()
                .orElseThrow(() -> new ApiException(
                        HttpStatus.FORBIDDEN, "Актив не є частиною цього замовлення"));

        Asset asset = item.getAsset();
        Instant expiresAt = Instant.now().plus(15, ChronoUnit.MINUTES);

        if (asset.getFileKey() == null || asset.getFileKey().isBlank()) {
            String fallback = (asset.getPreviewUrls() != null && !asset.getPreviewUrls().isEmpty())
                    ? asset.getPreviewUrls().get(0)
                    : "https://picsum.photos/800/600";
            return new DownloadUrlDto(fallback, expiresAt);
        }

        return new DownloadUrlDto(storageService.generatePresignedUrl(asset.getFileKey()), expiresAt);
    }
}

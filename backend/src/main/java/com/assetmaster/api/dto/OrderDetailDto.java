package com.assetmaster.api.dto;

import com.assetmaster.api.entity.Order;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderDetailDto(
        Long id,
        BigDecimal totalAmount,
        String status,
        List<OrderItemDto> items,
        Instant createdAt
) {
    public static OrderDetailDto fromEntity(Order order) {
        List<OrderItemDto> itemDtos = order.getItems().stream()
                .map(OrderItemDto::fromEntity)
                .toList();
        return new OrderDetailDto(
                order.getId(),
                order.getTotalAmount(),
                order.getStatus().name(),
                itemDtos,
                order.getCreatedAt()
        );
    }
}

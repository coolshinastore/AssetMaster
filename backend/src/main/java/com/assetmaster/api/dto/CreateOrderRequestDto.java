package com.assetmaster.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateOrderRequestDto(
        @NotEmpty @Valid List<OrderItemRequestDto> items
) {
    public record OrderItemRequestDto(
            @NotNull Long assetId,
            @NotNull String licenseType
    ) {}
}

package com.assetmaster.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TriggerPayoutRequestDto(
        @NotNull Long authorId,
        @NotNull @DecimalMin("0.01") BigDecimal amount,
        @NotNull LocalDate periodStart,
        @NotNull LocalDate periodEnd,
        String notes
) {}

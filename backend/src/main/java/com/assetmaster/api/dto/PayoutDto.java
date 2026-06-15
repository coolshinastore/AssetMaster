package com.assetmaster.api.dto;

import com.assetmaster.api.entity.Payout;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record PayoutDto(
        Long id,
        Long authorId,
        String authorName,
        BigDecimal amount,
        String status,
        LocalDate periodStart,
        LocalDate periodEnd,
        Instant processedAt,
        String notes,
        Instant createdAt
) {
    public static PayoutDto from(Payout p) {
        return new PayoutDto(
                p.getId(),
                p.getAuthor().getId(),
                p.getAuthor().getDisplayName(),
                p.getAmount(),
                p.getStatus().name(),
                p.getPeriodStart(),
                p.getPeriodEnd(),
                p.getProcessedAt(),
                p.getNotes(),
                p.getCreatedAt()
        );
    }
}

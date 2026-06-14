package com.assetmaster.api.dto;

import jakarta.validation.constraints.NotBlank;

public record VerifyTotpRequestDto(
        @NotBlank String partialToken,
        @NotBlank String code
) {}

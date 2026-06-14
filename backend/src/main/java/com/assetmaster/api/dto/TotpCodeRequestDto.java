package com.assetmaster.api.dto;

import jakarta.validation.constraints.NotBlank;

public record TotpCodeRequestDto(@NotBlank String code) {}

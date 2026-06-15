package com.assetmaster.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpsertCategoryRequestDto(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 100) String slug,
        Long parentId,
        @Size(max = 2048) String iconUrl
) {}

package com.assetmaster.api.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequestDto(
        @Size(min = 2, max = 80)
        String displayName,

        @Size(max = 2048)
        String avatarUrl,

        @Size(max = 1000)
        String bio
) {}

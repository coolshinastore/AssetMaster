package com.assetmaster.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateBlogPostRequestDto(
        @NotBlank @Size(max = 200) String slug,
        @Size(max = 100) String tag,
        @NotBlank @Size(max = 500) String title,
        String excerpt,
        @NotBlank String content,
        boolean published,
        @Size(max = 50) String readTime
) {}

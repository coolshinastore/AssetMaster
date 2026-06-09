package com.assetmaster.api.dto;

import java.time.Instant;

public record DownloadUrlDto(
        String url,
        Instant expiresAt
) {}

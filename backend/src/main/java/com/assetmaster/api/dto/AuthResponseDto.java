package com.assetmaster.api.dto;

public record AuthResponseDto(
        String accessToken,
        UserResponseDto user
) {}

package com.assetmaster.api.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateUserRoleRequestDto(@NotBlank String role) {}

package com.assetmaster.api.dto;

import com.assetmaster.api.entity.User;

import java.time.OffsetDateTime;

public record AdminUserDto(
        Long id,
        String email,
        String displayName,
        String role,
        boolean verified,
        OffsetDateTime createdAt
) {
    public static AdminUserDto fromEntity(User u) {
        return new AdminUserDto(
                u.getId(),
                u.getEmail(),
                u.getDisplayName(),
                u.getRole().name(),
                u.isVerified(),
                u.getCreatedAt()
        );
    }
}

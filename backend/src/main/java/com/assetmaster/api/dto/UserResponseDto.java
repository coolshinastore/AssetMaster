package com.assetmaster.api.dto;

import com.assetmaster.api.entity.User;

public record UserResponseDto(
        Long id,
        String email,
        String displayName,
        String role,
        String avatarUrl,
        boolean verified
) {
    public static UserResponseDto fromEntity(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole().name(),
                user.getAvatarUrl(),
                user.isVerified()
        );
    }
}

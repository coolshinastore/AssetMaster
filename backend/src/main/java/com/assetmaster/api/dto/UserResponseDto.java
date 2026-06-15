package com.assetmaster.api.dto;

import com.assetmaster.api.entity.User;

public record UserResponseDto(
        Long    id,
        String  email,
        String  displayName,
        String  role,
        String  avatarUrl,
        String  bio,
        boolean verified,
        boolean emailVerified,
        boolean totpEnabled,
        boolean stripeConnected,
        boolean stripeOnboardingComplete
) {
    public static UserResponseDto fromEntity(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getRole().name(),
                user.getAvatarUrl(),
                user.getBio(),
                user.isVerified(),
                user.isEmailVerified(),
                user.isTotpEnabled(),
                user.getStripeAccountId() != null,
                user.isStripeOnboardingComplete()
        );
    }
}

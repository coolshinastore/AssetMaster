package com.assetmaster.api.dto;

public record AuthResponseDto(
        boolean       requires2fa,
        String        partialToken,   // set only when requires2fa=true
        String        accessToken,    // set only when requires2fa=false
        UserResponseDto user          // set only when requires2fa=false
) {
    public static AuthResponseDto success(String accessToken, UserResponseDto user) {
        return new AuthResponseDto(false, null, accessToken, user);
    }

    public static AuthResponseDto pending2fa(String partialToken) {
        return new AuthResponseDto(true, partialToken, null, null);
    }
}

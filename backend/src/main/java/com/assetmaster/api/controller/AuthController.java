package com.assetmaster.api.controller;

import com.assetmaster.api.dto.*;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.exception.ApiException;
import com.assetmaster.api.repository.UserRepository;
import com.assetmaster.api.service.AuthService;
import com.assetmaster.api.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Реєстрація, вхід, refresh, вихід, 2FA, відновлення пароля")
public class AuthController {

    private final AuthService authService;
    private final StorageService storageService;
    private final UserRepository userRepository;

    // ── Helpers ───────────────────────────────────────────────

    /** If avatarUrl is a MinIO key (starts with "avatars/"), resolve to a fresh presigned URL. */
    private UserResponseDto resolveAvatar(UserResponseDto dto) {
        String url = dto.avatarUrl();
        if (url != null && url.startsWith("avatars/")) {
            String freshUrl = storageService.generatePresignedUrl(url);
            return new UserResponseDto(
                    dto.id(), dto.email(), dto.displayName(), dto.role(),
                    freshUrl, dto.bio(), dto.verified(), dto.emailVerified(), dto.totpEnabled(),
                    dto.stripeConnected(), dto.stripeOnboardingComplete()
            );
        }
        return dto;
    }

    // ── Core auth ─────────────────────────────────────────────

    @PostMapping("/register")
    @Operation(summary = "Реєстрація нового користувача")
    public ResponseEntity<AuthResponseDto> register(
            @Valid @RequestBody RegisterRequestDto request,
            HttpServletResponse response) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request, response));
    }

    @PostMapping("/login")
    @Operation(summary = "Вхід у систему")
    public ResponseEntity<AuthResponseDto> login(
            @Valid @RequestBody LoginRequestDto request,
            HttpServletResponse response) {
        return ResponseEntity.ok(authService.login(request, response));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Оновлення access token через refresh cookie")
    public ResponseEntity<AuthResponseDto> refresh(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response) {
        if (refreshToken == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token відсутній");
        }
        return ResponseEntity.ok(authService.refresh(refreshToken, response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Вихід із системи")
    public ResponseEntity<Void> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Дані поточного авторизованого користувача")
    public ResponseEntity<UserResponseDto> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resolveAvatar(UserResponseDto.fromEntity(user)));
    }

    @PatchMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Оновлення профілю поточного користувача")
    public ResponseEntity<UserResponseDto> updateMe(
            @Valid @RequestBody UpdateProfileRequestDto request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(resolveAvatar(authService.updateProfile(user, request)));
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Завантаження фото аватара")
    public ResponseEntity<UserResponseDto> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Дозволені лише зображення (JPEG, PNG, WebP)");
        }
        if (file.getSize() > 2 * 1024 * 1024) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Розмір файлу не більше 2 МБ");
        }
        String key = storageService.uploadAvatarFile(file);
        user.setAvatarUrl(key);
        userRepository.save(user);
        return ResponseEntity.ok(resolveAvatar(UserResponseDto.fromEntity(user)));
    }

    // ── Email verification ────────────────────────────────────

    @GetMapping("/verify-email")
    @Operation(summary = "Підтвердження email за токеном з листа")
    public ResponseEntity<Void> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-email/resend")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Повторно надіслати лист підтвердження")
    public ResponseEntity<Void> resendVerification(@AuthenticationPrincipal User user) {
        authService.resendVerification(user);
        return ResponseEntity.noContent().build();
    }

    // ── Password reset ────────────────────────────────────────

    @PostMapping("/forgot-password")
    @Operation(summary = "Запит на відновлення пароля — надсилає email з токеном")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDto request) {
        authService.forgotPassword(request.email());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Встановлення нового пароля за токеном")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequestDto request) {
        authService.resetPassword(request);
        return ResponseEntity.noContent().build();
    }

    // ── 2FA (TOTP) ────────────────────────────────────────────

    @PostMapping("/2fa/verify")
    @Operation(summary = "Верифікація TOTP-коду після login (якщо requires2fa=true)")
    public ResponseEntity<AuthResponseDto> verify2fa(
            @Valid @RequestBody VerifyTotpRequestDto request,
            HttpServletResponse response) {
        return ResponseEntity.ok(authService.verify2fa(request, response));
    }

    @GetMapping("/2fa/setup")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Отримати секрет та QR URI для налаштування 2FA")
    public ResponseEntity<TotpSetupDto> setup2fa(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.setupTotp(user));
    }

    @PostMapping("/2fa/enable")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Увімкнути 2FA (підтвердити кодом після scan QR)")
    public ResponseEntity<UserResponseDto> enable2fa(
            @Valid @RequestBody TotpCodeRequestDto request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.enableTotp(user, request.code()));
    }

    @PostMapping("/2fa/disable")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Вимкнути 2FA (підтвердити поточним кодом)")
    public ResponseEntity<UserResponseDto> disable2fa(
            @Valid @RequestBody TotpCodeRequestDto request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.disableTotp(user, request.code()));
    }
}

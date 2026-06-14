package com.assetmaster.api.controller;

import com.assetmaster.api.dto.*;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.exception.ApiException;
import com.assetmaster.api.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Реєстрація, вхід, refresh, вихід, 2FA, відновлення пароля")
public class AuthController {

    private final AuthService authService;

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
        return ResponseEntity.ok(UserResponseDto.fromEntity(user));
    }

    @PatchMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Оновлення профілю поточного користувача")
    public ResponseEntity<UserResponseDto> updateMe(
            @Valid @RequestBody UpdateProfileRequestDto request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(authService.updateProfile(user, request));
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

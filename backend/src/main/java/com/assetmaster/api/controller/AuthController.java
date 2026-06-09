package com.assetmaster.api.controller;

import com.assetmaster.api.dto.AuthResponseDto;
import com.assetmaster.api.dto.LoginRequestDto;
import com.assetmaster.api.dto.RegisterRequestDto;
import com.assetmaster.api.dto.UserResponseDto;
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
@Tag(name = "Auth", description = "Реєстрація, вхід, refresh, вихід")
public class AuthController {

    private final AuthService authService;

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
}

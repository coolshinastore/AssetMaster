package com.assetmaster.api.service;

import com.assetmaster.api.dto.AuthResponseDto;
import com.assetmaster.api.dto.LoginRequestDto;
import com.assetmaster.api.dto.RegisterRequestDto;
import com.assetmaster.api.dto.UserResponseDto;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.exception.ApiException;
import com.assetmaster.api.repository.UserRepository;
import com.assetmaster.api.security.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Value("${app.jwt.refresh-expiry-sec}")
    private long refreshExpirySec;

    /**
     * Registers a new user, returns JWT tokens and sets the refresh cookie.
     */
    public AuthResponseDto register(RegisterRequestDto request, HttpServletResponse response) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email вже зайнятий");
        }

        User user = User.builder()
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .displayName(request.displayName())
                .build();

        userRepository.save(user);
        return issueTokens(user, response);
    }

    /**
     * Authenticates the user, returns JWT tokens and sets the refresh cookie.
     */
    public AuthResponseDto login(LoginRequestDto request, HttpServletResponse response) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (BadCredentialsException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Невірний email або пароль");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Невірний email або пароль"));

        return issueTokens(user, response);
    }

    /**
     * Issues a new access token from a valid refresh token.
     */
    public AuthResponseDto refresh(String refreshToken, HttpServletResponse response) {
        String email;
        try {
            email = jwtService.extractUsername(refreshToken);
        } catch (Exception e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Невалідний refresh token");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Користувача не знайдено"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Refresh token прострочений або невалідний");
        }

        return issueTokens(user, response);
    }

    /**
     * Clears the refresh token cookie (logout).
     */
    public void logout(HttpServletResponse response) {
        clearRefreshCookie(response);
    }

    // ── Helpers ──────────────────────────────────────────────

    private AuthResponseDto issueTokens(User user, HttpServletResponse response) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        setRefreshCookie(response, refreshToken);
        return new AuthResponseDto(accessToken, UserResponseDto.fromEntity(user));
    }

    private void setRefreshCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/v1/auth/refresh")
                .maxAge(Duration.ofSeconds(refreshExpirySec))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .sameSite("Lax")
                .path("/api/v1/auth/refresh")
                .maxAge(Duration.ZERO)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}

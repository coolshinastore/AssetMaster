package com.assetmaster.api.service;

import com.assetmaster.api.dto.*;
import com.assetmaster.api.entity.EmailVerificationToken;
import com.assetmaster.api.entity.PasswordResetToken;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.exception.ApiException;
import com.assetmaster.api.repository.EmailVerificationTokenRepository;
import com.assetmaster.api.repository.PasswordResetTokenRepository;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository                  userRepository;
    private final PasswordResetTokenRepository    passwordResetTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordEncoder                 passwordEncoder;
    private final JwtService                      jwtService;
    private final AuthenticationManager           authenticationManager;
    private final EmailService                    emailService;
    private final TotpService                     totpService;

    @Value("${app.jwt.refresh-expiry-sec}")
    private long refreshExpirySec;

    // ── Register ──────────────────────────────────────────────

    @Transactional
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

        sendVerificationEmail(user);
        return issueTokens(user, response);
    }

    // ── Login ─────────────────────────────────────────────────

    @Transactional
    public AuthResponseDto login(LoginRequestDto request, HttpServletResponse response) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        } catch (BadCredentialsException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Невірний email або пароль");
        }

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Невірний email або пароль"));

        if (user.isTotpEnabled()) {
            String partialToken = jwtService.generatePartialToken(user);
            return AuthResponseDto.pending2fa(partialToken);
        }
        return issueTokens(user, response);
    }

    // ── 2FA verify ────────────────────────────────────────────

    @Transactional
    public AuthResponseDto verify2fa(VerifyTotpRequestDto request, HttpServletResponse response) {
        String email;
        try {
            email = jwtService.extractUsername(request.partialToken());
        } catch (Exception e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Невалідний токен");
        }
        if (!jwtService.isPartialToken(request.partialToken())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Невалідний токен");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Користувача не знайдено"));

        if (!totpService.verify(user.getTotpSecret(), request.code())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Невірний код 2FA");
        }
        return issueTokens(user, response);
    }

    // ── Refresh / Logout ──────────────────────────────────────

    @Transactional
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

    public void logout(HttpServletResponse response) {
        clearRefreshCookie(response);
    }

    // ── Email verification ────────────────────────────────────

    @Transactional
    public void verifyEmail(String token) {
        EmailVerificationToken evt = emailVerificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Невалідний або прострочений токен"));

        if (evt.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Токен прострочений");
        }
        User user = evt.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
        emailVerificationTokenRepository.deleteByUserId(user.getId());
    }

    @Transactional
    public void resendVerification(User currentUser) {
        emailVerificationTokenRepository.deleteByUserId(currentUser.getId());
        sendVerificationEmail(currentUser);
    }

    // ── Password reset ────────────────────────────────────────

    @Transactional
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUserId(user.getId());
            String token = UUID.randomUUID().toString().replace("-", "");
            passwordResetTokenRepository.save(PasswordResetToken.builder()
                    .user(user)
                    .token(token)
                    .expiresAt(OffsetDateTime.now().plusHours(1))
                    .build());
            emailService.sendPasswordReset(email, token);
        });
        // Always succeed to avoid email enumeration
    }

    @Transactional
    public void resetPassword(ResetPasswordRequestDto request) {
        PasswordResetToken prt = passwordResetTokenRepository.findByToken(request.token())
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Невалідний або прострочений токен"));

        if (prt.isUsed()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Токен вже використано");
        }
        if (prt.getExpiresAt().isBefore(OffsetDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Токен прострочений");
        }

        User user = prt.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        prt.setUsed(true);
        passwordResetTokenRepository.save(prt);
    }

    // ── Profile update ────────────────────────────────────────

    @Transactional
    public UserResponseDto updateProfile(User user, UpdateProfileRequestDto request) {
        if (request.displayName() != null && !request.displayName().isBlank()) {
            user.setDisplayName(request.displayName());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl().isBlank() ? null : request.avatarUrl());
        }
        if (request.bio() != null) {
            user.setBio(request.bio().isBlank() ? null : request.bio());
        }
        return UserResponseDto.fromEntity(userRepository.save(user));
    }

    // ── TOTP setup ────────────────────────────────────────────

    @Transactional
    public TotpSetupDto setupTotp(User user) {
        if (user.isTotpEnabled()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "2FA вже увімкнено");
        }
        String secret = totpService.generateSecret();
        user.setTotpSecret(secret);
        userRepository.save(user);
        return new TotpSetupDto(secret, totpService.generateUri(user.getEmail(), secret));
    }

    @Transactional
    public UserResponseDto enableTotp(User user, String code) {
        if (user.getTotpSecret() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Спочатку налаштуйте 2FA");
        }
        if (!totpService.verify(user.getTotpSecret(), code)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Невірний код 2FA");
        }
        user.setTotpEnabled(true);
        return UserResponseDto.fromEntity(userRepository.save(user));
    }

    @Transactional
    public UserResponseDto disableTotp(User user, String code) {
        if (!user.isTotpEnabled()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "2FA не увімкнено");
        }
        if (!totpService.verify(user.getTotpSecret(), code)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Невірний код 2FA");
        }
        user.setTotpEnabled(false);
        user.setTotpSecret(null);
        return UserResponseDto.fromEntity(userRepository.save(user));
    }

    // ── Helpers ───────────────────────────────────────────────

    private AuthResponseDto issueTokens(User user, HttpServletResponse response) {
        String accessToken  = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        setRefreshCookie(response, refreshToken);
        return AuthResponseDto.success(accessToken, UserResponseDto.fromEntity(user));
    }

    private void sendVerificationEmail(User user) {
        String token = UUID.randomUUID().toString().replace("-", "");
        emailVerificationTokenRepository.save(EmailVerificationToken.builder()
                .user(user)
                .token(token)
                .expiresAt(OffsetDateTime.now().plusHours(24))
                .build());
        emailService.sendEmailVerification(user.getEmail(), token);
    }

    private void setRefreshCookie(HttpServletResponse response, String refreshToken) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true).secure(false).sameSite("Lax")
                .path("/api/v1/auth/refresh")
                .maxAge(Duration.ofSeconds(refreshExpirySec))
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void clearRefreshCookie(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true).secure(false).sameSite("Lax")
                .path("/api/v1/auth/refresh").maxAge(Duration.ZERO).build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}

package com.assetmaster.api.service;

import com.assetmaster.api.dto.AuthResponseDto;
import com.assetmaster.api.dto.RegisterRequestDto;
import com.assetmaster.api.entity.Role;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.exception.ApiException;
import com.assetmaster.api.repository.UserRepository;
import com.assetmaster.api.security.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock AuthenticationManager authenticationManager;
    @InjectMocks AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "refreshExpirySec", 3600L);
    }

    @Test
    void register_emailAlreadyTaken_throws409() {
        RegisterRequestDto req = new RegisterRequestDto("taken@test.com", "Test User", "Password1!");
        given(userRepository.existsByEmail("taken@test.com")).willReturn(true);

        ApiException ex = assertThrows(ApiException.class,
                () -> authService.register(req, mock(HttpServletResponse.class)));

        assertThat(ex.getStatus()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void register_newEmail_savesUserAndReturnsToken() {
        RegisterRequestDto req = new RegisterRequestDto("new@test.com", "New User", "Password1!");
        User savedUser = User.builder()
                .id(1L).email("new@test.com").displayName("New User")
                .passwordHash("hashed").role(Role.ROLE_USER).build();

        given(userRepository.existsByEmail("new@test.com")).willReturn(false);
        given(passwordEncoder.encode("Password1!")).willReturn("hashed");
        given(userRepository.save(any())).willReturn(savedUser);
        given(jwtService.generateAccessToken(any())).willReturn("access-token");
        given(jwtService.generateRefreshToken(any())).willReturn("refresh-token");

        AuthResponseDto result = authService.register(req, mock(HttpServletResponse.class));

        assertThat(result.accessToken()).isEqualTo("access-token");
        assertThat(result.user().email()).isEqualTo("new@test.com");
        verify(userRepository).save(argThat(u -> u.getEmail().equals("new@test.com")));
    }

    @Test
    void login_userNotFound_throws401() {
        var req = new com.assetmaster.api.dto.LoginRequestDto("ghost@test.com", "pass");
        given(userRepository.findByEmail("ghost@test.com")).willReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class,
                () -> authService.login(req, mock(HttpServletResponse.class)));

        assertThat(ex.getStatus()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}

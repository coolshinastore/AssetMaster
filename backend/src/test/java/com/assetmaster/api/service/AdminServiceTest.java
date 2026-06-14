package com.assetmaster.api.service;

import com.assetmaster.api.entity.Asset;
import com.assetmaster.api.entity.AssetStatus;
import com.assetmaster.api.entity.Role;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.exception.ApiException;
import com.assetmaster.api.repository.AssetRepository;
import com.assetmaster.api.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock AssetRepository assetRepository;
    @Mock UserRepository userRepository;
    @InjectMocks AdminService adminService;

    @Test
    void approveAsset_notFound_throws404() {
        given(assetRepository.findById(1L)).willReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class, () -> adminService.approveAsset(1L));

        assertThat(ex.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void approveAsset_notPending_throws409() {
        Asset asset = buildAsset(AssetStatus.PUBLISHED);
        given(assetRepository.findById(1L)).willReturn(Optional.of(asset));

        ApiException ex = assertThrows(ApiException.class, () -> adminService.approveAsset(1L));

        assertThat(ex.getStatus()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void approveAsset_success_setsPublishedAndClearsReason() {
        Asset asset = buildAsset(AssetStatus.PENDING);
        asset.setRejectionReason("previous reason");
        given(assetRepository.findById(1L)).willReturn(Optional.of(asset));

        adminService.approveAsset(1L);

        assertThat(asset.getStatus()).isEqualTo(AssetStatus.PUBLISHED);
        assertThat(asset.getRejectionReason()).isNull();
    }

    @Test
    void rejectAsset_success_setsRejectedWithReason() {
        Asset asset = buildAsset(AssetStatus.PENDING);
        given(assetRepository.findById(1L)).willReturn(Optional.of(asset));

        adminService.rejectAsset(1L, "Low resolution previews");

        assertThat(asset.getStatus()).isEqualTo(AssetStatus.REJECTED);
        assertThat(asset.getRejectionReason()).isEqualTo("Low resolution previews");
    }

    @Test
    void updateUserRole_invalidRole_throws400() {
        User user = User.builder().id(1L).email("u@test.com").passwordHash("h").role(Role.ROLE_USER).build();
        given(userRepository.findById(1L)).willReturn(Optional.of(user));

        ApiException ex = assertThrows(ApiException.class,
                () -> adminService.updateUserRole(1L, "ROLE_SUPERUSER"));

        assertThat(ex.getStatus()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void updateUserRole_success_changesRole() {
        User user = User.builder().id(1L).email("u@test.com").passwordHash("h").role(Role.ROLE_USER).build();
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(userRepository.save(user)).willReturn(user);

        var dto = adminService.updateUserRole(1L, "ROLE_AUTHOR");

        assertThat(dto.role()).isEqualTo("ROLE_AUTHOR");
        assertThat(user.getRole()).isEqualTo(Role.ROLE_AUTHOR);
    }

    private Asset buildAsset(AssetStatus status) {
        return Asset.builder()
                .id(1L).title("Asset").price(BigDecimal.TEN).status(status)
                .build();
    }
}

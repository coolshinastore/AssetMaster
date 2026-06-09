package com.assetmaster.api.service;

import com.assetmaster.api.dto.AdminAssetDto;
import com.assetmaster.api.dto.AdminStatsDto;
import com.assetmaster.api.dto.AdminUserDto;
import com.assetmaster.api.entity.Asset;
import com.assetmaster.api.entity.AssetStatus;
import com.assetmaster.api.entity.Role;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.exception.ApiException;
import com.assetmaster.api.repository.AssetRepository;
import com.assetmaster.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;

    public AdminStatsDto getStats() {
        return new AdminStatsDto(
                userRepository.count(),
                assetRepository.count(),
                assetRepository.countByStatus(AssetStatus.PENDING),
                assetRepository.countByStatus(AssetStatus.PUBLISHED)
        );
    }

    public Page<AdminAssetDto> getPendingAssets(int page, int size) {
        return assetRepository
                .findByStatus(AssetStatus.PENDING, PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt")))
                .map(AdminAssetDto::fromEntity);
    }

    @Transactional
    public void approveAsset(Long id) {
        Asset asset = findAssetOrThrow(id);
        requirePending(asset);
        asset.setStatus(AssetStatus.PUBLISHED);
        asset.setRejectionReason(null);
    }

    @Transactional
    public void rejectAsset(Long id, String reason) {
        Asset asset = findAssetOrThrow(id);
        requirePending(asset);
        asset.setStatus(AssetStatus.REJECTED);
        asset.setRejectionReason(reason);
    }

    public Page<AdminUserDto> getUsers(int page, int size) {
        return userRepository
                .findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(AdminUserDto::fromEntity);
    }

    @Transactional
    public AdminUserDto updateUserRole(Long id, String roleName) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Користувача не знайдено"));
        Role role;
        try {
            role = Role.valueOf(roleName);
        } catch (IllegalArgumentException e) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Невідома роль: " + roleName);
        }
        user.setRole(role);
        return AdminUserDto.fromEntity(userRepository.save(user));
    }

    private Asset findAssetOrThrow(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Актив не знайдено"));
    }

    private void requirePending(Asset asset) {
        if (asset.getStatus() != AssetStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT, "Актив не має статусу PENDING");
        }
    }
}

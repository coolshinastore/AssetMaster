package com.assetmaster.api.controller;

import com.assetmaster.api.dto.AdminAssetDto;
import com.assetmaster.api.dto.AdminStatsDto;
import com.assetmaster.api.dto.AdminUserDto;
import com.assetmaster.api.dto.RejectAssetRequestDto;
import com.assetmaster.api.dto.UpdateUserRoleRequestDto;
import com.assetmaster.api.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
@Tag(name = "Admin", description = "Адміністративні операції")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "Статистика платформи")
    public AdminStatsDto getStats() {
        return adminService.getStats();
    }

    @GetMapping("/assets/pending")
    @Operation(summary = "Черга активів на модерацію")
    public Page<AdminAssetDto> getPendingAssets(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return adminService.getPendingAssets(page, size);
    }

    @PutMapping("/assets/{id}/approve")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Схвалити актив")
    public void approveAsset(@PathVariable Long id) {
        adminService.approveAsset(id);
    }

    @PutMapping("/assets/{id}/reject")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Відхилити актив")
    public void rejectAsset(@PathVariable Long id, @RequestBody RejectAssetRequestDto request) {
        adminService.rejectAsset(id, request.reason());
    }

    @GetMapping("/users")
    @Operation(summary = "Список користувачів")
    public Page<AdminUserDto> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return adminService.getUsers(page, size);
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Змінити роль користувача")
    public AdminUserDto updateUserRole(
            @PathVariable Long id,
            @RequestBody @Valid UpdateUserRoleRequestDto request) {
        return adminService.updateUserRole(id, request.role());
    }
}

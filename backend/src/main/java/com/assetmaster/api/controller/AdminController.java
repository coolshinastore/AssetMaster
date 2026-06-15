package com.assetmaster.api.controller;

import com.assetmaster.api.dto.AdminAssetDto;
import com.assetmaster.api.dto.AdminFinanceSummaryDto;
import com.assetmaster.api.dto.AdminPlatformAnalyticsDto;
import com.assetmaster.api.dto.AdminStatsDto;
import com.assetmaster.api.dto.AdminUserDto;
import com.assetmaster.api.dto.BlogPostDto;
import com.assetmaster.api.dto.CategoryDto;
import com.assetmaster.api.dto.CreateBlogPostRequestDto;
import com.assetmaster.api.dto.RejectAssetRequestDto;
import com.assetmaster.api.dto.UpdateUserRoleRequestDto;
import com.assetmaster.api.dto.UpsertCategoryRequestDto;
import com.assetmaster.api.dto.PayoutDto;
import com.assetmaster.api.dto.TriggerPayoutRequestDto;
import com.assetmaster.api.entity.PayoutStatus;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.service.AdminService;
import com.assetmaster.api.service.BlogPostService;
import com.assetmaster.api.service.CategoryService;
import com.assetmaster.api.service.PayoutService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    private final BlogPostService blogPostService;
    private final CategoryService categoryService;
    private final PayoutService payoutService;

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

    @PutMapping("/users/{id}/verify")
    @Operation(summary = "Верифікувати або зняти верифікацію автора")
    public AdminUserDto verifyUser(
            @PathVariable Long id,
            @RequestParam boolean verified) {
        return adminService.verifyUser(id, verified);
    }

    // ── Finance & Analytics ──────────────────────────────────────

    @GetMapping("/finance")
    @Operation(summary = "Фінансова аналітика платформи")
    public AdminFinanceSummaryDto getFinanceSummary() {
        return adminService.getFinanceSummary();
    }

    @GetMapping("/finance/payouts")
    @Operation(summary = "Список всіх виплат авторам")
    public org.springframework.data.domain.Page<PayoutDto> getPayouts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return payoutService.getAllPayouts(page, size);
    }

    @PostMapping("/finance/payouts")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Створити виплату автору")
    public PayoutDto triggerPayout(@RequestBody @Valid TriggerPayoutRequestDto req) {
        return payoutService.triggerPayout(req);
    }

    @PutMapping("/finance/payouts/{id}/status")
    @Operation(summary = "Змінити статус виплати")
    public PayoutDto updatePayoutStatus(
            @PathVariable Long id,
            @RequestParam PayoutStatus status) {
        return payoutService.updateStatus(id, status);
    }

    @GetMapping("/analytics")
    @Operation(summary = "Аналітика платформи")
    public AdminPlatformAnalyticsDto getPlatformAnalytics() {
        return adminService.getPlatformAnalytics();
    }

    // ── Categories CRUD ──────────────────────────────────────────

    @GetMapping("/categories")
    @Operation(summary = "Список усіх категорій (адмін)")
    public java.util.List<CategoryDto> getCategories() {
        return categoryService.getAllCategories();
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Створити категорію")
    public CategoryDto createCategory(@RequestBody @Valid UpsertCategoryRequestDto req) {
        return categoryService.createCategory(req);
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Оновити категорію")
    public CategoryDto updateCategory(@PathVariable Long id,
                                      @RequestBody @Valid UpsertCategoryRequestDto req) {
        return categoryService.updateCategory(id, req);
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Видалити категорію")
    public void deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }

    // ── Blog CRUD ────────────────────────────────────────────────

    @GetMapping("/blog")
    @Operation(summary = "Всі статті блогу (опубліковані + чернетки)")
    public org.springframework.data.domain.Page<BlogPostDto> getBlogPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return blogPostService.getAllPosts(page, size);
    }

    @PostMapping("/blog")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Створити статтю блогу")
    public BlogPostDto createBlogPost(
            @RequestBody @Valid CreateBlogPostRequestDto req,
            @AuthenticationPrincipal User user) {
        return blogPostService.createPost(req, user);
    }

    @PutMapping("/blog/{id}")
    @Operation(summary = "Оновити статтю блогу")
    public BlogPostDto updateBlogPost(
            @PathVariable Long id,
            @RequestBody @Valid CreateBlogPostRequestDto req) {
        return blogPostService.updatePost(id, req);
    }

    @DeleteMapping("/blog/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Видалити статтю блогу")
    public void deleteBlogPost(@PathVariable Long id) {
        blogPostService.deletePost(id);
    }
}

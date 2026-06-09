package com.assetmaster.api.controller;

import com.assetmaster.api.dto.AnalyticsSummaryDto;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Аналітика автора")
public class DashboardController {

    private final AnalyticsService analyticsService;

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ROLE_AUTHOR') or hasRole('ROLE_ADMIN')")
    @Operation(summary = "Аналітика продажів автора")
    public AnalyticsSummaryDto getAnalytics(Authentication auth) {
        Long authorId = ((User) auth.getPrincipal()).getId();
        return analyticsService.getAuthorAnalytics(authorId);
    }
}

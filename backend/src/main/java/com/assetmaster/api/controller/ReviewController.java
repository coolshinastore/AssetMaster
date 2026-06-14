package com.assetmaster.api.controller;

import com.assetmaster.api.dto.CreateReviewRequestDto;
import com.assetmaster.api.dto.ReviewDto;
import com.assetmaster.api.dto.ReviewStatsDto;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/assets/{assetId}/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Відгуки на активи")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/stats")
    @Operation(summary = "Середній рейтинг та кількість відгуків")
    public ReviewStatsDto getStats(@PathVariable Long assetId) {
        return reviewService.getStats(assetId);
    }

    @GetMapping
    @Operation(summary = "Відгуки на актив")
    public Page<ReviewDto> getReviews(
            @PathVariable Long assetId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return reviewService.getReviews(assetId, page, size);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Залишити відгук (потребує покупки)")
    public ReviewDto createReview(
            @PathVariable Long assetId,
            @RequestBody @Valid CreateReviewRequestDto request,
            Authentication auth) {
        Long userId = ((User) auth.getPrincipal()).getId();
        return reviewService.createReview(userId, assetId, request.rating(), request.comment());
    }
}

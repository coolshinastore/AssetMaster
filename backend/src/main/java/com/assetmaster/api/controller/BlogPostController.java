package com.assetmaster.api.controller;

import com.assetmaster.api.dto.BlogPostDto;
import com.assetmaster.api.service.BlogPostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/blog")
@RequiredArgsConstructor
@Tag(name = "Blog", description = "Публічний блог")
public class BlogPostController {

    private final BlogPostService blogPostService;

    @GetMapping
    @Operation(summary = "Список опублікованих статей")
    public Page<BlogPostDto> getPublishedPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return blogPostService.getPublishedPosts(page, size);
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Стаття за slug")
    public BlogPostDto getBySlug(@PathVariable String slug) {
        return blogPostService.getPublishedBySlug(slug);
    }
}

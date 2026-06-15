package com.assetmaster.api.service;

import com.assetmaster.api.dto.CategoryDto;
import com.assetmaster.api.dto.UpsertCategoryRequestDto;
import com.assetmaster.api.entity.AssetStatus;
import com.assetmaster.api.entity.Category;
import com.assetmaster.api.repository.AssetRepository;
import com.assetmaster.api.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AssetRepository assetRepository;

    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> CategoryDto.fromEntity(c,
                        assetRepository.countByCategoryIdAndStatus(c.getId(), AssetStatus.PUBLISHED)))
                .toList();
    }

    @Transactional
    public CategoryDto createCategory(UpsertCategoryRequestDto req) {
        if (categoryRepository.findBySlug(req.slug()).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug вже існує");
        Category parent = resolveParent(req.parentId());
        Category saved = categoryRepository.save(Category.builder()
                .name(req.name()).slug(req.slug()).iconUrl(req.iconUrl()).parent(parent).build());
        return CategoryDto.fromEntity(saved, 0);
    }

    @Transactional
    public CategoryDto updateCategory(Long id, UpsertCategoryRequestDto req) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        categoryRepository.findBySlug(req.slug())
                .filter(c -> !c.getId().equals(id))
                .ifPresent(c -> { throw new ResponseStatusException(HttpStatus.CONFLICT, "Slug вже існує"); });
        cat.setName(req.name());
        cat.setSlug(req.slug());
        cat.setIconUrl(req.iconUrl());
        cat.setParent(resolveParent(req.parentId()));
        long count = assetRepository.countByCategoryIdAndStatus(id, AssetStatus.PUBLISHED);
        return CategoryDto.fromEntity(cat, count);
    }

    @Transactional
    public void deleteCategory(Long id) {
        if (!categoryRepository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        categoryRepository.deleteById(id);
    }

    private Category resolveParent(Long parentId) {
        if (parentId == null) return null;
        return categoryRepository.findById(parentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Батьківська категорія не знайдена"));
    }
}

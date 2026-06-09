package com.assetmaster.api.service;

import com.assetmaster.api.dto.CategoryDto;
import com.assetmaster.api.entity.AssetStatus;
import com.assetmaster.api.repository.AssetRepository;
import com.assetmaster.api.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
}

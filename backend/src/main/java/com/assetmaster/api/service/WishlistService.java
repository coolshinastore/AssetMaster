package com.assetmaster.api.service;

import com.assetmaster.api.dto.AssetSummaryDto;
import com.assetmaster.api.entity.Asset;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.entity.WishlistItem;
import com.assetmaster.api.exception.ApiException;
import com.assetmaster.api.repository.AssetRepository;
import com.assetmaster.api.repository.UserRepository;
import com.assetmaster.api.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistItemRepository wishlistItemRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AssetSummaryDto> getWishlist(Long userId) {
        return wishlistItemRepository.findByUserId(userId).stream()
                .map(item -> AssetSummaryDto.fromEntity(item.getAsset()))
                .toList();
    }

    @Transactional
    public void addToWishlist(Long userId, Long assetId) {
        if (wishlistItemRepository.existsByUserIdAndAssetId(userId, assetId)) {
            return;
        }
        if (!assetRepository.existsById(assetId)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Актив не знайдено");
        }
        User userRef  = userRepository.getReferenceById(userId);
        Asset assetRef = assetRepository.getReferenceById(assetId);
        wishlistItemRepository.save(WishlistItem.builder().user(userRef).asset(assetRef).build());
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long assetId) {
        wishlistItemRepository.deleteByUserIdAndAssetId(userId, assetId);
    }

    @Transactional(readOnly = true)
    public boolean isInWishlist(Long userId, Long assetId) {
        return wishlistItemRepository.existsByUserIdAndAssetId(userId, assetId);
    }
}

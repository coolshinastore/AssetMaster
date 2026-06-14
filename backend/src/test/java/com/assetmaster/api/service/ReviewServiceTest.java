package com.assetmaster.api.service;

import com.assetmaster.api.dto.ReviewDto;
import com.assetmaster.api.entity.Asset;
import com.assetmaster.api.entity.AssetStatus;
import com.assetmaster.api.entity.Review;
import com.assetmaster.api.entity.Role;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.exception.ApiException;
import com.assetmaster.api.repository.AssetRepository;
import com.assetmaster.api.repository.OrderItemRepository;
import com.assetmaster.api.repository.ReviewRepository;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock ReviewRepository reviewRepository;
    @Mock AssetRepository assetRepository;
    @Mock UserRepository userRepository;
    @Mock OrderItemRepository orderItemRepository;
    @InjectMocks ReviewService reviewService;

    private static final Long USER_ID  = 1L;
    private static final Long ASSET_ID = 10L;

    @Test
    void createReview_assetNotFound_throws404() {
        given(assetRepository.findById(ASSET_ID)).willReturn(Optional.empty());

        ApiException ex = assertThrows(ApiException.class,
                () -> reviewService.createReview(USER_ID, ASSET_ID, 5, "Great!"));

        assertThat(ex.getStatus()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void createReview_notPurchased_throws403() {
        given(assetRepository.findById(ASSET_ID)).willReturn(Optional.of(buildAsset()));
        given(orderItemRepository.existsByBuyerIdAndAssetId(USER_ID, ASSET_ID)).willReturn(false);

        ApiException ex = assertThrows(ApiException.class,
                () -> reviewService.createReview(USER_ID, ASSET_ID, 5, "Great!"));

        assertThat(ex.getStatus()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void createReview_alreadyReviewed_throws409() {
        given(assetRepository.findById(ASSET_ID)).willReturn(Optional.of(buildAsset()));
        given(orderItemRepository.existsByBuyerIdAndAssetId(USER_ID, ASSET_ID)).willReturn(true);
        given(reviewRepository.existsByAssetIdAndAuthorId(ASSET_ID, USER_ID)).willReturn(true);

        ApiException ex = assertThrows(ApiException.class,
                () -> reviewService.createReview(USER_ID, ASSET_ID, 5, "Great!"));

        assertThat(ex.getStatus()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void createReview_success_returnsDto() {
        User author = buildUser();
        Asset asset  = buildAsset();
        Review saved = Review.builder()
                .id(99L).asset(asset).author(author).rating(4).comment("Nice!").build();

        given(assetRepository.findById(ASSET_ID)).willReturn(Optional.of(asset));
        given(orderItemRepository.existsByBuyerIdAndAssetId(USER_ID, ASSET_ID)).willReturn(true);
        given(reviewRepository.existsByAssetIdAndAuthorId(ASSET_ID, USER_ID)).willReturn(false);
        given(userRepository.findById(USER_ID)).willReturn(Optional.of(author));
        given(reviewRepository.save(any())).willReturn(saved);

        ReviewDto dto = reviewService.createReview(USER_ID, ASSET_ID, 4, "Nice!");

        assertThat(dto.rating()).isEqualTo(4);
        assertThat(dto.comment()).isEqualTo("Nice!");
        assertThat(dto.authorId()).isEqualTo(USER_ID);
    }

    private Asset buildAsset() {
        return Asset.builder()
                .id(ASSET_ID).title("Test Asset")
                .price(BigDecimal.TEN).status(AssetStatus.PUBLISHED)
                .build();
    }

    private User buildUser() {
        return User.builder()
                .id(USER_ID).email("user@test.com")
                .displayName("Test User").passwordHash("hash")
                .role(Role.ROLE_USER).build();
    }
}

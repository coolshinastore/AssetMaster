package com.assetmaster.api.service;

import com.assetmaster.api.dto.ReviewDto;
import com.assetmaster.api.dto.ReviewStatsDto;
import com.assetmaster.api.entity.Asset;
import com.assetmaster.api.entity.Review;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.exception.ApiException;
import com.assetmaster.api.repository.AssetRepository;
import com.assetmaster.api.repository.OrderItemRepository;
import com.assetmaster.api.repository.ReviewRepository;
import com.assetmaster.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final OrderItemRepository orderItemRepository;

    public Page<ReviewDto> getReviews(Long assetId, int page, int size) {
        return reviewRepository
                .findByAssetIdOrderByCreatedAtDesc(assetId, PageRequest.of(page, size))
                .map(ReviewDto::fromEntity);
    }

    public ReviewStatsDto getStats(Long assetId) {
        Double avg   = reviewRepository.findAverageRatingByAssetId(assetId);
        long   count = reviewRepository.countByAssetId(assetId);
        return new ReviewStatsDto(avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0, count);
    }

    @Transactional
    public ReviewDto createReview(Long userId, Long assetId, int rating, String comment) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Актив не знайдено"));

        if (!orderItemRepository.existsByBuyerIdAndAssetId(userId, assetId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Можна залишити відгук лише після покупки");
        }
        if (reviewRepository.existsByAssetIdAndAuthorId(assetId, userId)) {
            throw new ApiException(HttpStatus.CONFLICT, "Ви вже залишили відгук на цей актив");
        }

        User author = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Користувача не знайдено"));

        Review review = Review.builder()
                .asset(asset)
                .author(author)
                .rating(rating)
                .comment(comment)
                .build();

        return ReviewDto.fromEntity(reviewRepository.save(review));
    }
}

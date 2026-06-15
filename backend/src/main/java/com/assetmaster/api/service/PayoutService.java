package com.assetmaster.api.service;

import com.assetmaster.api.dto.PayoutDto;
import com.assetmaster.api.dto.TriggerPayoutRequestDto;
import com.assetmaster.api.entity.Payout;
import com.assetmaster.api.entity.PayoutStatus;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.exception.ApiException;
import com.assetmaster.api.repository.PayoutRepository;
import com.assetmaster.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PayoutService {

    private final PayoutRepository payoutRepository;
    private final UserRepository userRepository;

    public List<PayoutDto> getAuthorPayouts(User author) {
        return payoutRepository.findByAuthorIdOrderByCreatedAtDesc(author.getId())
                .stream().map(PayoutDto::from).toList();
    }

    public Page<PayoutDto> getAllPayouts(int page, int size) {
        return payoutRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).map(PayoutDto::from);
    }

    @Transactional
    public PayoutDto triggerPayout(TriggerPayoutRequestDto req) {
        User author = userRepository.findById(req.authorId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Автора не знайдено"));
        Payout payout = payoutRepository.save(Payout.builder()
                .author(author)
                .amount(req.amount())
                .status(PayoutStatus.PENDING)
                .periodStart(req.periodStart())
                .periodEnd(req.periodEnd())
                .notes(req.notes())
                .build());
        return PayoutDto.from(payout);
    }

    @Transactional
    public PayoutDto updateStatus(Long id, PayoutStatus newStatus) {
        Payout payout = payoutRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Виплату не знайдено"));
        payout.setStatus(newStatus);
        if (newStatus == PayoutStatus.PAID) payout.setProcessedAt(Instant.now());
        return PayoutDto.from(payoutRepository.save(payout));
    }
}

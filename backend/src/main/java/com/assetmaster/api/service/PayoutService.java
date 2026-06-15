package com.assetmaster.api.service;

import com.assetmaster.api.dto.PayoutDto;
import com.assetmaster.api.dto.TriggerPayoutRequestDto;
import com.assetmaster.api.entity.Payout;
import com.assetmaster.api.entity.PayoutStatus;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.exception.ApiException;
import com.assetmaster.api.repository.PayoutRepository;
import com.assetmaster.api.repository.UserRepository;
import com.stripe.exception.StripeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PayoutService {

    private final PayoutRepository payoutRepository;
    private final UserRepository userRepository;
    private final StripeService stripeService;

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

    /**
     * Executes a Stripe Transfer for an existing PENDING/PROCESSING payout.
     * Requires the author to have completed Stripe Express onboarding.
     */
    @Transactional
    public PayoutDto executePayout(Long payoutId) {
        Payout payout = payoutRepository.findById(payoutId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Виплату не знайдено"));

        if (payout.getStatus() == PayoutStatus.PAID) {
            throw new ApiException(HttpStatus.CONFLICT, "Виплату вже виконано");
        }
        if (payout.getStripeTransferId() != null) {
            throw new ApiException(HttpStatus.CONFLICT, "Stripe Transfer вже існує: " + payout.getStripeTransferId());
        }

        User author = payout.getAuthor();
        if (author.getStripeAccountId() == null) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Автор не підключив Stripe — попросіть автора завершити Stripe onboarding");
        }
        if (!author.isStripeOnboardingComplete()) {
            throw new ApiException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "Автор не завершив Stripe onboarding");
        }
        if (!stripeService.isEnabled()) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Stripe не налаштовано на сервері (STRIPE_SECRET_KEY)");
        }

        // Convert to cents (Stripe works with smallest currency unit)
        long amountCents = payout.getAmount()
                .multiply(BigDecimal.valueOf(100))
                .longValue();

        String description = "AssetMaster payout %s — %s".formatted(
                payout.getPeriodStart(), payout.getPeriodEnd());

        try {
            String transferId = stripeService.createTransfer(
                    author.getStripeAccountId(), amountCents, description);
            payout.setStripeTransferId(transferId);
            payout.setStatus(PayoutStatus.PAID);
            payout.setProcessedAt(Instant.now());
            return PayoutDto.from(payoutRepository.save(payout));
        } catch (StripeException e) {
            log.error("Stripe transfer failed for payout {}: {}", payoutId, e.getMessage());
            payout.setStatus(PayoutStatus.FAILED);
            payout.setNotes("Stripe error: " + e.getMessage());
            payoutRepository.save(payout);
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Stripe помилка: " + e.getMessage());
        }
    }
}

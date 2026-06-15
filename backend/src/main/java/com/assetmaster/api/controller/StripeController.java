package com.assetmaster.api.controller;

import com.assetmaster.api.entity.User;
import com.assetmaster.api.repository.UserRepository;
import com.assetmaster.api.service.StripeService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.model.Event;
import com.stripe.model.StripeObject;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/v1/stripe")
@RequiredArgsConstructor
@Tag(name = "Stripe", description = "Stripe Connect інтеграція")
public class StripeController {

    private final StripeService stripeService;
    private final UserRepository userRepository;

    @PostMapping("/connect/onboard")
    @PreAuthorize("hasRole('ROLE_AUTHOR')")
    @Operation(summary = "Отримати посилання для підключення Stripe Express рахунку")
    public Map<String, String> startOnboarding(@AuthenticationPrincipal User user) {
        if (!stripeService.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Stripe не налаштовано на сервері");
        }
        try {
            String accountId = user.getStripeAccountId();
            if (accountId == null) {
                accountId = stripeService.createExpressAccount(user.getEmail());
                user.setStripeAccountId(accountId);
                userRepository.save(user);
            }
            String url = stripeService.createOnboardingLink(accountId);
            return Map.of("url", url);
        } catch (StripeException e) {
            log.error("Stripe onboarding failed for user {}: {}", user.getId(), e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Помилка Stripe: " + e.getMessage());
        }
    }

    @GetMapping("/connect/status")
    @PreAuthorize("hasRole('ROLE_AUTHOR') or hasRole('ROLE_ADMIN')")
    @Operation(summary = "Статус підключення Stripe для поточного автора")
    public Map<String, Object> getConnectStatus(@AuthenticationPrincipal User user) {
        return Map.of(
                "enabled", stripeService.isEnabled(),
                "connected", user.getStripeAccountId() != null,
                "onboardingComplete", user.isStripeOnboardingComplete()
        );
    }

    @PostMapping("/webhooks")
    @Operation(summary = "Обробник Stripe Webhook подій")
    public ResponseEntity<String> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        Event event;
        try {
            event = stripeService.constructWebhookEvent(payload, sigHeader);
        } catch (SignatureVerificationException e) {
            log.warn("Invalid Stripe webhook signature");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Webhook not configured");
        }

        log.info("Received Stripe event: {}", event.getType());

        switch (event.getType()) {
            case "account.updated" -> {
                Optional<StripeObject> obj = event.getDataObjectDeserializer().getObject();
                if (obj.isPresent() && obj.get() instanceof Account account) {
                    if (Boolean.TRUE.equals(account.getChargesEnabled())) {
                        userRepository.findByStripeAccountId(account.getId()).ifPresent(u -> {
                            u.setStripeOnboardingComplete(true);
                            userRepository.save(u);
                            log.info("Stripe onboarding complete for user {}", u.getId());
                        });
                    }
                }
            }
            default -> log.debug("Unhandled Stripe event type: {}", event.getType());
        }

        return ResponseEntity.ok("received");
    }
}

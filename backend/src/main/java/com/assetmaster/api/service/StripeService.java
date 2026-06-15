package com.assetmaster.api.service;

import com.stripe.Stripe;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Account;
import com.stripe.model.AccountLink;
import com.stripe.model.Event;
import com.stripe.model.Transfer;
import com.stripe.net.Webhook;
import com.stripe.param.AccountCreateParams;
import com.stripe.param.AccountLinkCreateParams;
import com.stripe.param.TransferCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class StripeService {

    @Value("${stripe.secret-key:}")
    private String secretKey;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    @Value("${stripe.connect.return-url}")
    private String returnUrl;

    @Value("${stripe.connect.refresh-url}")
    private String refreshUrl;

    @PostConstruct
    void init() {
        if (secretKey != null && !secretKey.isBlank()) {
            Stripe.apiKey = secretKey;
            log.info("Stripe integration enabled");
        } else {
            log.warn("STRIPE_SECRET_KEY not set — Stripe integration disabled");
        }
    }

    public boolean isEnabled() {
        return secretKey != null && !secretKey.isBlank();
    }

    private void requireEnabled() {
        if (!isEnabled()) {
            throw new IllegalStateException("Stripe не налаштовано. Встановіть STRIPE_SECRET_KEY.");
        }
    }

    /**
     * Creates an Express connected account for the author.
     * Returns the Stripe account ID (acct_...).
     */
    public String createExpressAccount(String email) throws StripeException {
        requireEnabled();
        AccountCreateParams params = AccountCreateParams.builder()
                .setType(AccountCreateParams.Type.EXPRESS)
                .setEmail(email)
                .setCapabilities(AccountCreateParams.Capabilities.builder()
                        .setTransfers(AccountCreateParams.Capabilities.Transfers.builder()
                                .setRequested(true)
                                .build())
                        .build())
                .build();
        Account account = Account.create(params);
        log.info("Created Stripe Express account {} for {}", account.getId(), email);
        return account.getId();
    }

    /**
     * Creates an AccountLink (onboarding URL) for an existing connected account.
     */
    public String createOnboardingLink(String stripeAccountId) throws StripeException {
        requireEnabled();
        AccountLinkCreateParams params = AccountLinkCreateParams.builder()
                .setAccount(stripeAccountId)
                .setReturnUrl(returnUrl)
                .setRefreshUrl(refreshUrl)
                .setType(AccountLinkCreateParams.Type.ACCOUNT_ONBOARDING)
                .build();
        AccountLink link = AccountLink.create(params);
        return link.getUrl();
    }

    /**
     * Checks if a connected account has completed onboarding.
     */
    public boolean isAccountOnboarded(String stripeAccountId) throws StripeException {
        requireEnabled();
        Account account = Account.retrieve(stripeAccountId);
        return Boolean.TRUE.equals(account.getChargesEnabled());
    }

    /**
     * Creates a Transfer to the author's connected account.
     * Amount must be in USD cents (e.g. $12.50 → 1250).
     * Returns the Stripe Transfer ID (tr_...).
     */
    public String createTransfer(String stripeAccountId, long amountCents, String description) throws StripeException {
        requireEnabled();
        TransferCreateParams params = TransferCreateParams.builder()
                .setAmount(amountCents)
                .setCurrency("usd")
                .setDestination(stripeAccountId)
                .setDescription(description)
                .build();
        Transfer transfer = Transfer.create(params);
        log.info("Created Stripe Transfer {} → {} for {} cents", transfer.getId(), stripeAccountId, amountCents);
        return transfer.getId();
    }

    /**
     * Verifies and constructs a Stripe webhook Event from raw payload + signature header.
     */
    public Event constructWebhookEvent(String payload, String sigHeader) throws SignatureVerificationException {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new IllegalStateException("STRIPE_WEBHOOK_SECRET не налаштовано");
        }
        return Webhook.constructEvent(payload, sigHeader, webhookSecret);
    }
}

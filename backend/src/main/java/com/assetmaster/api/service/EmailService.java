package com.assetmaster.api.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String from;

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    // ── Public API ────────────────────────────────────────────

    @Async
    public void sendPasswordReset(String to, String token) {
        String link = baseUrl + "/auth/reset-password?token=" + token;
        send(to,
             "Відновлення пароля — AssetMaster",
             buildPasswordResetHtml(link),
             "Відновлення пароля: " + link);
    }

    @Async
    public void sendEmailVerification(String to, String token) {
        String link = baseUrl + "/auth/verify-email?token=" + token;
        send(to,
             "Підтвердіть ваш email — AssetMaster",
             buildEmailVerificationHtml(link),
             "Підтвердження email: " + link);
    }

    // ── Core send ─────────────────────────────────────────────

    private void send(String to, String subject, String html, String fallbackLog) {
        if (mailSender == null || from.isBlank()) {
            log.warn("[EMAIL — SMTP не налаштований] To: {} | {}", to, fallbackLog);
            return;
        }
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, false, "UTF-8");
            helper.setFrom(from, "AssetMaster");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("[EMAIL] Sent '{}' → {}", subject, to);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("[EMAIL] Failed to send '{}' to {}: {}", subject, to, e.getMessage());
        }
    }

    // ── HTML templates ────────────────────────────────────────

    private String buildPasswordResetHtml(String link) {
        return wrap(
            "Відновлення пароля",
            """
            <p style="color:#3a4163;font-size:16px;line-height:1.6;margin:0 0 24px">
              Ми отримали запит на скидання пароля для вашого акаунту AssetMaster.
              Перейдіть за кнопкою нижче, щоб встановити новий пароль.
            </p>
            <p style="color:#5b6280;font-size:14px;line-height:1.6;margin:0 0 32px">
              Посилання дійсне <strong>1 годину</strong>. Якщо ви не робили цього запиту — проігноруйте лист.
            </p>
            """,
            link,
            "Скинути пароль"
        );
    }

    private String buildEmailVerificationHtml(String link) {
        return wrap(
            "Підтвердіть email",
            """
            <p style="color:#3a4163;font-size:16px;line-height:1.6;margin:0 0 24px">
              Дякуємо за реєстрацію в AssetMaster! Натисніть кнопку нижче, щоб підтвердити вашу адресу електронної пошти.
            </p>
            <p style="color:#5b6280;font-size:14px;line-height:1.6;margin:0 0 32px">
              Посилання дійсне <strong>24 години</strong>.
            </p>
            """,
            link,
            "Підтвердити email"
        );
    }

    private String wrap(String title, String body, String ctaLink, String ctaText) {
        return """
            <!DOCTYPE html>
            <html lang="uk">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width,initial-scale=1">
              <title>%s</title>
            </head>
            <body style="margin:0;padding:0;background:#f8f9fc;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f8f9fc;padding:40px 16px">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0"
                         style="background:#ffffff;border-radius:16px;border:1px solid #e5e8f0;overflow:hidden;max-width:560px;width:100%%">
                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#1A1F3C 0%%,#2f3566 100%%);padding:32px 40px;text-align:left">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="background:linear-gradient(135deg,#3B82F6,#1A1F3C);width:36px;height:36px;border-radius:8px"></td>
                            <td style="padding-left:12px;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.03em;vertical-align:middle">
                              AssetMaster
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                      <td style="padding:40px 40px 32px">
                        <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#1A1F3C;letter-spacing:-0.02em">%s</h1>
                        %s
                        <a href="%s"
                           style="display:inline-block;background:#3B82F6;color:#ffffff;text-decoration:none;
                                  padding:14px 28px;border-radius:12px;font-size:15px;font-weight:600;
                                  letter-spacing:-0.01em">
                          %s
                        </a>
                        <p style="color:#9aa0b6;font-size:12px;margin:24px 0 0;line-height:1.5">
                          Або скопіюйте посилання:<br>
                          <span style="color:#3B82F6;word-break:break-all">%s</span>
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="background:#f8f9fc;padding:20px 40px;border-top:1px solid #e5e8f0;text-align:center">
                        <p style="margin:0;color:#9aa0b6;font-size:12px;line-height:1.5">
                          © 2025 AssetMaster. Цей лист надіслано автоматично — не відповідайте на нього.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(title, title, body, ctaLink, ctaText, ctaLink);
    }
}

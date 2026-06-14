package com.assetmaster.api.service;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

@Service
public class TotpService {

    private static final String BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final long   STEP         = 30L;
    private static final int    DIGITS       = 6;
    private static final int    WINDOW       = 1;   // ±1 window for clock skew

    public String generateSecret() {
        byte[] buf = new byte[20];
        new SecureRandom().nextBytes(buf);
        return base32Encode(buf);
    }

    public String generateUri(String email, String secret) {
        return "otpauth://totp/AssetMaster:"
                + URLEncoder.encode(email, StandardCharsets.UTF_8)
                + "?secret=" + secret
                + "&issuer=AssetMaster&algorithm=SHA1&digits=6&period=30";
    }

    public boolean verify(String secret, String code) {
        if (code == null || code.length() != DIGITS) return false;
        try {
            byte[] key = base32Decode(secret);
            long t = System.currentTimeMillis() / 1000 / STEP;
            for (long i = t - WINDOW; i <= t + WINDOW; i++) {
                if (totp(key, i).equals(code)) return true;
            }
        } catch (Exception ignored) {}
        return false;
    }

    // ── internals ─────────────────────────────────────────────

    private String totp(byte[] secret, long counter) throws Exception {
        byte[] msg  = ByteBuffer.allocate(8).putLong(counter).array();
        Mac    mac  = Mac.getInstance("HmacSHA1");
        mac.init(new SecretKeySpec(secret, "HmacSHA1"));
        byte[] hash   = mac.doFinal(msg);
        int    offset = hash[hash.length - 1] & 0x0f;
        int    otp    = (((hash[offset]     & 0x7f) << 24)
                       | ((hash[offset + 1] & 0xff) << 16)
                       | ((hash[offset + 2] & 0xff) << 8)
                       |  (hash[offset + 3] & 0xff)) % 1_000_000;
        return String.format("%06d", otp);
    }

    private String base32Encode(byte[] data) {
        StringBuilder sb = new StringBuilder();
        int buffer = 0, bitsLeft = 0;
        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xff);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                sb.append(BASE32_CHARS.charAt((buffer >> (bitsLeft - 5)) & 31));
                bitsLeft -= 5;
            }
        }
        if (bitsLeft > 0) sb.append(BASE32_CHARS.charAt((buffer << (5 - bitsLeft)) & 31));
        return sb.toString();
    }

    private byte[] base32Decode(String data) {
        data = data.toUpperCase().replaceAll("[^A-Z2-7]", "");
        byte[] result = new byte[data.length() * 5 / 8];
        int buffer = 0, bitsLeft = 0, idx = 0;
        for (char c : data.toCharArray()) {
            int val = BASE32_CHARS.indexOf(c);
            if (val < 0) continue;
            buffer = (buffer << 5) | val;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                result[idx++] = (byte) (buffer >> (bitsLeft - 8));
                bitsLeft -= 8;
            }
        }
        return java.util.Arrays.copyOf(result, idx);
    }
}

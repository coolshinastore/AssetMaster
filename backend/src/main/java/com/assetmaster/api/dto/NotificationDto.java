package com.assetmaster.api.dto;

import com.assetmaster.api.entity.Notification;

import java.time.Instant;

public record NotificationDto(
        Long id,
        String type,
        String title,
        String body,
        String link,
        boolean read,
        Instant createdAt
) {
    public static NotificationDto from(Notification n) {
        return new NotificationDto(n.getId(), n.getType(), n.getTitle(),
                n.getBody(), n.getLink(), n.isRead(), n.getCreatedAt());
    }
}

package com.assetmaster.api.service;

import com.assetmaster.api.dto.NotificationDto;
import com.assetmaster.api.entity.Notification;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repo;

    public List<NotificationDto> getAll(User user) {
        return repo.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(NotificationDto::from).toList();
    }

    public Map<String, Long> unreadCount(User user) {
        return Map.of("count", repo.countByUserIdAndReadFalse(user.getId()));
    }

    @Transactional
    public void markAsRead(Long id, User user) {
        Notification n = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        if (!n.getUser().getId().equals(user.getId()))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        n.setRead(true);
    }

    @Transactional
    public void markAllAsRead(User user) {
        repo.markAllAsRead(user.getId());
    }

    public void send(User user, String type, String title, String body, String link) {
        repo.save(Notification.builder()
                .user(user).type(type).title(title).body(body).link(link).build());
    }
}

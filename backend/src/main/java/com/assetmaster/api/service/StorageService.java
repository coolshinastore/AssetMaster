package com.assetmaster.api.service;

import com.assetmaster.api.exception.ApiException;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.http.Method;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class StorageService {

    @Value("${app.storage.endpoint:}")
    private String endpoint;

    @Value("${app.storage.access-key:}")
    private String accessKey;

    @Value("${app.storage.secret-key:}")
    private String secretKey;

    @Value("${app.storage.bucket:assetmaster}")
    private String bucket;

    private MinioClient minioClient;

    @PostConstruct
    public void init() {
        if (StringUtils.hasText(endpoint)) {
            minioClient = MinioClient.builder()
                    .endpoint(endpoint)
                    .credentials(accessKey, secretKey)
                    .build();
            log.info("MinIO client initialized for endpoint: {}", endpoint);
        } else {
            log.warn("MinIO not configured — presigned URLs will use fallback");
        }
    }

    /**
     * Uploads avatar image to MinIO under the "avatars/" prefix and returns the object key.
     * Falls back to a simulated key if MinIO is not configured.
     */
    public String uploadAvatarFile(MultipartFile file) {
        String ext = Optional.ofNullable(file.getOriginalFilename())
                .filter(n -> n.contains("."))
                .map(n -> n.substring(n.lastIndexOf('.')))
                .orElse(".jpg");
        String key = "avatars/" + UUID.randomUUID() + ext;

        if (minioClient == null) {
            log.warn("MinIO not configured — avatar upload simulated, key: {}", key);
            return key;
        }
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(key)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType() != null ? file.getContentType() : "image/jpeg")
                            .build()
            );
            return key;
        } catch (Exception e) {
            log.error("Failed to upload avatar: {}", e.getMessage(), e);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Не вдалося завантажити аватар");
        }
    }

    /**
     * Uploads file to MinIO and returns the object key.
     * Falls back to a simulated key if MinIO is not configured.
     */
    public String uploadFile(MultipartFile file) {
        String ext = Optional.ofNullable(file.getOriginalFilename())
                .filter(n -> n.contains("."))
                .map(n -> n.substring(n.lastIndexOf('.')))
                .orElse("");
        String key = "uploads/" + UUID.randomUUID() + ext;

        if (minioClient == null) {
            log.warn("MinIO not configured — file upload simulated, key: {}", key);
            return key;
        }
        try {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(key)
                            .stream(file.getInputStream(), file.getSize(), -1)
                            .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                            .build()
            );
            return key;
        } catch (Exception e) {
            log.error("Failed to upload file: {}", file.getOriginalFilename(), e);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Не вдалося завантажити файл");
        }
    }

    /**
     * Generates a 15-minute presigned GET URL.
     * Falls back to a placeholder if MinIO is not configured.
     */
    public String generatePresignedUrl(String fileKey) {
        if (minioClient == null) {
            return "https://picsum.photos/seed/" + fileKey.hashCode() + "/800/600";
        }
        try {
            return minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(bucket)
                            .object(fileKey)
                            .expiry(15, TimeUnit.MINUTES)
                            .build()
            );
        } catch (Exception e) {
            log.error("Failed to generate presigned URL for key: {}", fileKey, e);
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Не вдалося отримати посилання для завантаження");
        }
    }
}

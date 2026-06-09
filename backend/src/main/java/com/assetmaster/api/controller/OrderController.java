package com.assetmaster.api.controller;

import com.assetmaster.api.dto.CreateOrderRequestDto;
import com.assetmaster.api.dto.DownloadUrlDto;
import com.assetmaster.api.dto.OrderDetailDto;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<OrderDetailDto> create(
            @RequestBody @Valid CreateOrderRequestDto request,
            Authentication auth
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(userId(auth), request));
    }

    @GetMapping
    public ResponseEntity<List<OrderDetailDto>> list(Authentication auth) {
        return ResponseEntity.ok(orderService.getOrders(userId(auth)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDetailDto> getById(
            @PathVariable Long id,
            Authentication auth
    ) {
        return ResponseEntity.ok(orderService.getOrderById(userId(auth), id));
    }

    @GetMapping("/{orderId}/download/{assetId}")
    public ResponseEntity<DownloadUrlDto> download(
            @PathVariable Long orderId,
            @PathVariable Long assetId,
            Authentication auth
    ) {
        return ResponseEntity.ok(orderService.getDownloadUrl(userId(auth), orderId, assetId));
    }

    private Long userId(Authentication auth) {
        return ((User) auth.getPrincipal()).getId();
    }
}

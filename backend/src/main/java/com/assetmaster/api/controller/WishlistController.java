package com.assetmaster.api.controller;

import com.assetmaster.api.dto.AssetSummaryDto;
import com.assetmaster.api.entity.User;
import com.assetmaster.api.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<AssetSummaryDto>> getWishlist(Authentication auth) {
        return ResponseEntity.ok(wishlistService.getWishlist(userId(auth)));
    }

    @PostMapping("/{assetId}")
    public ResponseEntity<Void> add(@PathVariable Long assetId, Authentication auth) {
        wishlistService.addToWishlist(userId(auth), assetId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{assetId}")
    public ResponseEntity<Void> remove(@PathVariable Long assetId, Authentication auth) {
        wishlistService.removeFromWishlist(userId(auth), assetId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check/{assetId}")
    public ResponseEntity<Map<String, Boolean>> check(@PathVariable Long assetId, Authentication auth) {
        boolean inWishlist = wishlistService.isInWishlist(userId(auth), assetId);
        return ResponseEntity.ok(Map.of("inWishlist", inWishlist));
    }

    private Long userId(Authentication auth) {
        return ((User) auth.getPrincipal()).getId();
    }
}

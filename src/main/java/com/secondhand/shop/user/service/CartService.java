package com.secondhand.shop.user.service;

import com.secondhand.shop.user.dto.CartItemDTO;
import java.util.List;

public interface CartService {
    void addToCart(Long userId, Long productId, Integer quantity);
    List<CartItemDTO> getCart(Long userId);
    void removeFromCart(Long cartItemId);
}
package com.secondhand.shop.user.service.impl;

import com.secondhand.shop.common.model.OrderItem;
import com.secondhand.shop.common.model.Product;
import com.secondhand.shop.user.dto.CartItemDTO;
// 1. Sửa lại 2 dòng import này trỏ về common
import com.secondhand.shop.common.repository.CartRepository;
import com.secondhand.shop.common.repository.ProductRepository;
import com.secondhand.shop.user.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service("userCartService")
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

    // 2. Những dòng này sẽ hết đỏ sau khi import đúng ở trên
    private final CartRepository cartRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void removeFromCart(Long cartItemId) {
        // Hàm này sẽ xóa món đồ khỏi giỏ hàng dựa trên ID
        cartRepository.deleteById(cartItemId);
    }
    public void addToCart(Long userId, Long productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

        OrderItem item = OrderItem.builder()
                .userId(userId)
                .product(product)
                .productName(product.getName())
                .price(product.getPrice())
                .quantity(quantity)
                .subtotal(product.getPrice() * quantity)
                .build();

        cartRepository.save(item);
    }

    @Override
    public List<CartItemDTO> getCart(Long userId) {
        // 3. Hàm này sẽ hết đỏ nếu trong CartRepository (common) đã khai báo nó
        return cartRepository.findByUserIdAndOrderIsNull(userId).stream().map(item -> {
            CartItemDTO dto = new CartItemDTO();
            dto.setId(item.getId());
            dto.setProductId(item.getProduct().getId());
            dto.setProductName(item.getProductName());
            dto.setPrice(item.getPrice());
            dto.setQuantity(item.getQuantity());
            return dto;
        }).collect(Collectors.toList());
    }
}
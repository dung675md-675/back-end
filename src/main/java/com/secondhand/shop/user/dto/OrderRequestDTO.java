package com.secondhand.shop.user.dto;

import lombok.Data;

import java.util.List;

@Data
public class OrderRequestDTO {
    private Long customerId;
    private String shippingAddress;
    private String shippingPhone;
    private String note;
    private Double totalAmount;
    private Double discountAmount;
    private Double finalAmount;
    private Long couponId;
    private List<OrderItemRequestDTO> orderItems;

    @Data
    public static class OrderItemRequestDTO {
        private Long productId;
        private Double price;
        private Integer quantity;
        private Double subtotal;
    }
}

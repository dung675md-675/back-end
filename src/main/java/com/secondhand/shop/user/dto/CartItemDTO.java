package com.secondhand.shop.user.dto;
import lombok.Data;

@Data
public class CartItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String image;
    private Double price;
    private Integer quantity;
}
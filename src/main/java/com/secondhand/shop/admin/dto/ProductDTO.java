package com.secondhand.shop.admin.dto;

import com.secondhand.shop.common.model.Product;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {

    private Long id;
    private String name;
    private String description;
    private Double price;  // ✅ ĐỔI
    private Double originalPrice;  // ✅ ĐỔI
    private String conditionStatus;
    private Integer quantity;
    private Long categoryId;
    private String categoryName;
    private String imageUrl;
    private String status;
    private Integer views;

    public static ProductDTO fromEntity(Product product) {
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .originalPrice(product.getOriginalPrice())
                .conditionStatus(product.getConditionStatus().name())
                .quantity(product.getQuantity())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .imageUrl(product.getImageUrl())
                .status(product.getStatus().name())
                .views(product.getViews())
                .build();
    }
}
package com.secondhand.shop.admin.dto;

import com.secondhand.shop.common.model.Coupon;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CouponDTO {
    private Long id;
    private String code;
    private Integer discountPercent;
    private Double maxDiscountAmount;
    private Double minOrderAmount;
    private String minRank;
    private String status;
    private String expiryDate;

    public static CouponDTO fromEntity(Coupon c) {
        return CouponDTO.builder()
                .id(c.getId())
                .code(c.getCode())
                .discountPercent(c.getDiscountPercent())
                .maxDiscountAmount(c.getMaxDiscountAmount())
                .minOrderAmount(c.getMinOrderAmount())
                .minRank(c.getMinRank().name())
                .status(c.getStatus().name())
                .expiryDate(c.getExpiryDate() != null ? c.getExpiryDate().toString() : null)
                .build();
    }
}
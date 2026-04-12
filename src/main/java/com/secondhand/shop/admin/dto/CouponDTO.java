package com.secondhand.shop.admin.dto;

import com.secondhand.shop.common.model.Coupon;
import com.secondhand.shop.common.support.CouponSupport;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Collections;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponDTO {
    private Long id;
    private String name;
    private String code;
    private String discountType;
    private Integer discountPercent;
    private Double fixedDiscountAmount;
    private Double maxDiscountAmount;
    private Double minOrderAmount;
    private String minRank;
    private String status;
    private String startDate;
    private String endDate;
    private String expiryDate;
    private List<String> targetLevels;
    private String discountLabel;

    public static CouponDTO fromEntity(Coupon coupon) {
        Coupon.DiscountType discountType = coupon.getDiscountType() != null
                ? coupon.getDiscountType()
                : Coupon.DiscountType.PERCENT;
        Coupon.CouponStatus status = coupon.getStatus() != null
                ? coupon.getStatus()
                : Coupon.CouponStatus.ACTIVE;
        Coupon.CustomerRank minRank = coupon.getMinRank() != null
                ? coupon.getMinRank()
                : Coupon.CustomerRank.BRONZE;

        return CouponDTO.builder()
                .id(coupon.getId())
                .name(coupon.getName())
                .code(coupon.getCode())
                .discountType(discountType.name())
                .discountPercent(coupon.getDiscountPercent())
                .fixedDiscountAmount(coupon.getFixedDiscountAmount())
                .maxDiscountAmount(coupon.getMaxDiscountAmount())
                .minOrderAmount(coupon.getMinOrderAmount())
                .minRank(minRank.name())
                .status(status.name())
                .startDate(coupon.getStartDate() != null ? coupon.getStartDate().toString() : null)
                .endDate(coupon.getExpiryDate() != null ? coupon.getExpiryDate().toString() : null)
                .expiryDate(coupon.getExpiryDate() != null ? coupon.getExpiryDate().toString() : null)
                .targetLevels(Collections.emptyList())
                .discountLabel(CouponSupport.getDiscountLabel(coupon))
                .build();
    }
}

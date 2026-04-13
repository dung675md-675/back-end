package com.secondhand.shop.common.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 20)
    private DiscountType discountType = DiscountType.PERCENT;

    @Column(name = "discount_percent", nullable = false)
    private Integer discountPercent = 0;

    @Column(name = "fixed_discount_amount")
    private Double fixedDiscountAmount = 0.0;

    @Column(name = "max_discount_amount", nullable = false)
    private Double maxDiscountAmount = 0.0;

    @Column(name = "min_order_amount")
    private Double minOrderValue = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(name = "min_rank", nullable = false)
    private CustomerRank minRank = CustomerRank.BRONZE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponStatus status = CouponStatus.ACTIVE;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "total_quantity")
    private Integer totalQuantity;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (name == null || name.isBlank()) {
            name = code;
        }
        if (startDate == null) {
            startDate = LocalDateTime.now();
        }
        if (discountType == null) {
            discountType = DiscountType.PERCENT;
        }
        if (discountPercent == null) {
            discountPercent = 0;
        }
        if (fixedDiscountAmount == null) {
            fixedDiscountAmount = 0.0;
        }
        if (maxDiscountAmount == null) {
            maxDiscountAmount = 0.0;
        }
        if (minOrderValue == null) {
            minOrderValue = 0.0;
        }
    }

    public Double getMinOrderAmount() {
        return minOrderValue;
    }

    public void setMinOrderAmount(Double minOrderAmount) {
        this.minOrderValue = minOrderAmount;
    }

    public enum CouponStatus {
        ACTIVE,
        INACTIVE
    }

    public enum DiscountType {
        PERCENT,
        FIXED_AMOUNT
    }

    public enum CustomerRank {
        BRONZE,
        SILVER,
        GOLD,
        PLATINUM,
        DIAMOND
    }
}


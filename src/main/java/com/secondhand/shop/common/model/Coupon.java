package com.secondhand.shop.common.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "discount_percent", nullable = false)
    private Integer discountPercent; // % giảm giá (vd: 10 = 10%)

    @Column(name = "max_discount_amount", nullable = false)
    private Double maxDiscountAmount; // Số tiền giảm tối đa

    @Column(name = "min_order_amount")
    private Double minOrderAmount = 0.0; // Đơn tối thiểu để dùng

    @Enumerated(EnumType.STRING)
    @Column(name = "min_rank", nullable = false)
    private CustomerRank minRank = CustomerRank.BRONZE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponStatus status = CouponStatus.ACTIVE;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public enum CouponStatus { ACTIVE, INACTIVE }

    public enum CustomerRank {
        BRONZE,    // < 1 triệu
        SILVER,    // 1 - 5 triệu
        GOLD,      // 5 - 20 triệu
        PLATINUM,  // 20 - 50 triệu
        DIAMOND    // > 50 triệu
    }
}
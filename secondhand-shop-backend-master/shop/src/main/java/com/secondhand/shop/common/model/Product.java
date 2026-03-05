package com.secondhand.shop.common.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    // ✅ KHÔNG DÙNG precision/scale
    @Column(nullable = false)
    private Double price;

    @Column(name = "original_price")
    private Double originalPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "condition_status")
    private ProductCondition conditionStatus = ProductCondition.GOOD;

    @Column(nullable = false)
    private Integer quantity = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;


    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status = ProductStatus.AVAILABLE;


    @Column(nullable = false)
    private Integer views = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum ProductCondition {
        NEW, LIKE_NEW, GOOD, FAIR, POOR
    }

    public enum ProductStatus {
        AVAILABLE, SOLD, RESERVED, DELETED
    }
}
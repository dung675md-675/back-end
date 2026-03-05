package com.secondhand.shop.common.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", nullable = false, unique = true, length = 50)
    private String orderCode;

    // --- PHẦN GIỮ LẠI CHO ADMIN ---
    private Long userId;        // Admin dùng để quản lý ID người dùng
    private String fullName;    // Admin dùng để hiển thị tên khách hàng
    private String phone;       // Admin dùng để hiện số điện thoại
    private String address;     // Admin dùng để hiện địa chỉ
    // ------------------------------

    // --- PHẦN CHO USER & CUSTOMER ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(name = "shipping_address", columnDefinition = "TEXT")
    private String shippingAddress;

    @Column(name = "shipping_phone", length = 20)
    private String shippingPhone;
    // ------------------------------

    @Column(name = "total_amount", nullable = false)
    private Double totalAmount;

    @Column(name = "discount_amount")
    private Double discountAmount = 0.0;

    @Column(name = "final_amount")
    private Double finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String note;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        // Đồng bộ dữ liệu cũ và mới để tránh lỗi Null ở Database
        if (this.shippingAddress == null) this.shippingAddress = this.address;
        if (this.shippingPhone == null) this.shippingPhone = this.phone;
        if (this.finalAmount == null) this.finalAmount = this.totalAmount;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum OrderStatus {
        PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED
    }
}
package com.secondhand.shop.user.dto;
import lombok.Data;
import java.util.List;

@Data
public class OrderRequestDTO {
    // Frontend gửi customerId (từ customer.id)
    private Long customerId;

    // Các field thông tin giao hàng
    private String shippingAddress;
    private String shippingPhone;
    private String note;

    // Tổng tiền
    private Double totalAmount;
    private Double discountAmount;
    private Double finalAmount;

    // Danh sách sản phẩm trong đơn
    private List<OrderItemRequestDTO> orderItems;

    @Data
    public static class OrderItemRequestDTO {
        private Long productId;
        private Double price;
        private Integer quantity;
        private Double subtotal;
    }
}
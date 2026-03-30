package com.secondhand.shop.admin.dto;

import com.secondhand.shop.common.model.Order;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {

    private Long id;
    private String orderCode;
    private Long customerId;
    private String customerName;
    private Double totalAmount;  // ✅ ĐỔI
    private Double discountAmount;  // ✅ ĐỔI
    private Double finalAmount;  // ✅ ĐỔI
    private String status;
    private String shippingAddress;
    private String shippingPhone;
    private String note;
    private List<OrderItemDTO> orderItems;
    private String createdAt;



    public static OrderDTO fromEntity(Order order) {
        return OrderDTO.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getUser().getFullName())
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .status(order.getStatus().name())
                .shippingAddress(order.getShippingAddress())
                .shippingPhone(order.getShippingPhone())
                .note(order.getNote())
                .createdAt(order.getCreatedAt() != null
                        ? order.getCreatedAt().toString()
                        : null)
                .orderItems(
                        order.getOrderItems() == null
                                ? List.of()
                                : order.getOrderItems().stream()
                                .map(OrderItemDTO::fromEntity)
                                .collect(Collectors.toList())
                )
                .build();
    }
}
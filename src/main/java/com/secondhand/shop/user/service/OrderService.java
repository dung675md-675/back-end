package com.secondhand.shop.user.service;

import com.secondhand.shop.user.dto.OrderRequestDTO;
import java.util.List;

public interface OrderService {

    Object createOrder(OrderRequestDTO request);

    List<?> getOrdersByUserId(Long userId);

    Object getOrderDetail(Long orderId);

    Object cancelPendingOrder(Long orderId, Long userId);
}

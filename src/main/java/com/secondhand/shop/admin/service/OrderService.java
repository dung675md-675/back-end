package com.secondhand.shop.admin.service;

import com.secondhand.shop.admin.dto.OrderDTO;
import java.util.List;

public interface OrderService {

    List<OrderDTO> getAllOrders();

    OrderDTO getOrderById(Long id);

    OrderDTO createOrder(OrderDTO orderDTO);

    OrderDTO updateOrderStatus(Long id, String status);

    void cancelOrder(Long id);

    List<OrderDTO> getOrdersByCustomer(Long customerId);

    List<OrderDTO> getOrdersByStatus(String status);
}
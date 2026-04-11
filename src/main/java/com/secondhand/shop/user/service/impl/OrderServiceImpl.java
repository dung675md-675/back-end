package com.secondhand.shop.user.service.impl;

import com.secondhand.shop.common.model.Customer;
import com.secondhand.shop.common.model.Order;
import com.secondhand.shop.common.model.OrderItem;
import com.secondhand.shop.common.model.Product;
import com.secondhand.shop.common.repository.CustomerRepository;
import com.secondhand.shop.common.repository.OrderRepository;
import com.secondhand.shop.common.repository.ProductRepository;
import com.secondhand.shop.user.dto.OrderRequestDTO;
import com.secondhand.shop.user.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service("userOrderService")
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public Object createOrder(OrderRequestDTO request) {
        // Customer có field "user" (object), dùng findByUser_Id
        Customer customer = customerRepository.findByUser_Id(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy customer với userId: " + request.getCustomerId()));

        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderCode("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setShippingAddress(request.getShippingAddress());
        order.setShippingPhone(request.getShippingPhone());
        order.setNote(request.getNote());
        order.setTotalAmount(request.getTotalAmount());
        order.setDiscountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : 0.0);
        order.setFinalAmount(request.getFinalAmount() != null ? request.getFinalAmount() : request.getTotalAmount());
        order.setStatus(Order.OrderStatus.PENDING);

        List<OrderItem> orderItems = new ArrayList<>();
        for (OrderRequestDTO.OrderItemRequestDTO itemDTO : request.getOrderItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm id: " + itemDTO.getProductId()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setPrice(itemDTO.getPrice());
            orderItem.setQuantity(itemDTO.getQuantity());
            orderItem.setSubtotal(itemDTO.getSubtotal());
            orderItems.add(orderItem);
        }

        order.setOrderItems(orderItems);
        return orderRepository.save(order);
    }

    @Override
    public List<?> getOrdersByUserId(Long userId) {
        // Dùng query JOIN FETCH qua customer.user.id
        return orderRepository.findByCustomerUserIdWithItems(userId);
    }

    @Override
    public Object getOrderDetail(Long orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }
}
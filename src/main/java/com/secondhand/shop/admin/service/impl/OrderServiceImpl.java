package com.secondhand.shop.admin.service.impl;

import com.secondhand.shop.common.model.Customer;
import com.secondhand.shop.common.model.Order;
import com.secondhand.shop.common.model.OrderItem;
import com.secondhand.shop.common.model.Product;
import com.secondhand.shop.common.repository.CustomerRepository;
import com.secondhand.shop.common.repository.OrderItemRepository;
import com.secondhand.shop.common.repository.OrderRepository;
import com.secondhand.shop.common.repository.ProductRepository;
import com.secondhand.shop.admin.dto.OrderDTO;
import com.secondhand.shop.admin.dto.OrderItemDTO;
import com.secondhand.shop.admin.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service("adminOrderService")
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        return OrderDTO.fromEntity(order);
    }

    @Override
    public OrderDTO createOrder(OrderDTO orderDTO) {
        System.out.println("=== CREATE ORDER START ===");
        System.out.println("OrderDTO: " + orderDTO);

        try {
            // Validate customer
            Customer customer = customerRepository.findById(orderDTO.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found with id: " + orderDTO.getCustomerId()));

            System.out.println("Customer found: " + customer.getId());

            // Generate order code
            String orderCode = generateOrderCode();
            System.out.println("Generated order code: " + orderCode);

            // Create order
            Order order = Order.builder()
                    .orderCode(orderCode)
                    .customer(customer)
                    .totalAmount(orderDTO.getTotalAmount())
                    .discountAmount(orderDTO.getDiscountAmount())
                    .finalAmount(orderDTO.getFinalAmount())
                    .status(Order.OrderStatus.PENDING)
                    .shippingAddress(orderDTO.getShippingAddress())
                    .shippingPhone(orderDTO.getShippingPhone())
                    .note(orderDTO.getNote())
                    .build();

            Order savedOrder = orderRepository.save(order);
            System.out.println("Order saved with id: " + savedOrder.getId());

            // Create order items
            if (orderDTO.getOrderItems() != null && !orderDTO.getOrderItems().isEmpty()) {
                System.out.println("Processing " + orderDTO.getOrderItems().size() + " order items");

                for (OrderItemDTO itemDTO : orderDTO.getOrderItems()) {
                    System.out.println("Processing item - Product ID: " + itemDTO.getProductId());

                    // Validate product exists
                    Product product = productRepository.findById(itemDTO.getProductId())
                            .orElseThrow(() -> new RuntimeException("Sản phẩm ID " + itemDTO.getProductId() + " không tồn tại hoặc đã bị xóa!"));

                    System.out.println("Product found: " + product.getName());

                    // Check product status
                    if (product.getStatus() == Product.ProductStatus.DELETED) {
                        throw new RuntimeException("Sản phẩm '" + product.getName() + "' đã ngừng bán!");
                    }

                    if (product.getStatus() == Product.ProductStatus.SOLD) {
                        throw new RuntimeException("Sản phẩm '" + product.getName() + "' đã được bán!");
                    }

                    // Check quantity
                    if (product.getQuantity() < itemDTO.getQuantity()) {
                        throw new RuntimeException("Sản phẩm '" + product.getName() + "' chỉ còn " + product.getQuantity() + " sản phẩm!");
                    }

                    // Create order item
                    OrderItem orderItem = OrderItem.builder()
                            .order(savedOrder)
                            .product(product)
                            .productName(product.getName())
                            .price(itemDTO.getPrice())
                            .quantity(itemDTO.getQuantity())
                            .subtotal(itemDTO.getSubtotal())
                            .build();

                    orderItemRepository.save(orderItem);
                    System.out.println("Order item saved");

                    // Update product quantity
                    product.setQuantity(product.getQuantity() - itemDTO.getQuantity());
                    if (product.getQuantity() == 0) {
                        product.setStatus(Product.ProductStatus.SOLD);
                    }
                    productRepository.save(product);
                    System.out.println("Product quantity updated: " + product.getQuantity());
                }
            }

            // Update customer stats
            customer.setTotalOrders(customer.getTotalOrders() + 1);
            customerRepository.save(customer);
            System.out.println("Customer stats updated");

            System.out.println("=== CREATE ORDER SUCCESS ===");

            return OrderDTO.fromEntity(orderRepository.findById(savedOrder.getId()).get());

        } catch (RuntimeException e) {
            System.err.println("=== CREATE ORDER ERROR ===");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        } catch (Exception e) {
            System.err.println("=== UNEXPECTED ERROR ===");
            e.printStackTrace();
            throw new RuntimeException("Lỗi hệ thống khi tạo đơn hàng: " + e.getMessage());
        }
    }

    @Override
    public OrderDTO updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        order.setStatus(Order.OrderStatus.valueOf(status));

        if (status.equals("DELIVERED")) {
            Customer customer = order.getCustomer();
            customer.setTotalSpent(customer.getTotalSpent() + order.getFinalAmount());
            customerRepository.save(customer);
        }

        Order updatedOrder = orderRepository.save(order);
        return OrderDTO.fromEntity(updatedOrder);
    }

    @Override
    public void cancelOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        if (order.getStatus() == Order.OrderStatus.PENDING ||
                order.getStatus() == Order.OrderStatus.CONFIRMED) {

            order.setStatus(Order.OrderStatus.REJECTED);

            // Return products to inventory
            for (OrderItem item : order.getOrderItems()) {
                Product product = item.getProduct();
                product.setQuantity(product.getQuantity() + item.getQuantity());
                product.setStatus(Product.ProductStatus.AVAILABLE);
                productRepository.save(product);
            }

            orderRepository.save(order);
        } else {
            throw new RuntimeException("Cannot cancel order with status: " + order.getStatus());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByCustomer(Long customerId) {
        return orderRepository.findByCustomerId(customerId).stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(Order.OrderStatus.valueOf(status)).stream()
                .map(OrderDTO::fromEntity)
                .collect(Collectors.toList());
    }

    private String generateOrderCode() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        long count = orderRepository.count() + 1;
        return "ORD" + timestamp + String.format("%03d", count);
    }
}

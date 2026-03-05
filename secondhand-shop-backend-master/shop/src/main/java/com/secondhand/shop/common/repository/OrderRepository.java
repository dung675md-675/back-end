package com.secondhand.shop.common.repository;

import com.secondhand.shop.common.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository("commonOrderRepository")
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);

    List<Order> findByCustomerId(Long customerId);

    List<Order> findByStatus(Order.OrderStatus status);

    // Admin dùng - Order có field userId trực tiếp
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Order> findByCustomerIdAndStatus(Long customerId, Order.OrderStatus status);

    long countByCustomerId(Long customerId);

    @Query("SELECT SUM(o.finalAmount) FROM Order o WHERE o.customer.id = :customerId AND o.status = 'DELIVERED'")
    Double calculateTotalSpentByCustomer(@Param("customerId") Long customerId);

    // User dùng - lấy đơn qua customer.user.id + JOIN FETCH tránh LazyInitializationException
    @Query("SELECT DISTINCT o FROM Order o " +
            "LEFT JOIN FETCH o.orderItems oi " +
            "LEFT JOIN FETCH oi.product " +
            "WHERE o.customer.user.id = :userId " +
            "ORDER BY o.createdAt DESC")
    List<Order> findByCustomerUserIdWithItems(@Param("userId") Long userId);
}
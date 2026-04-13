package com.secondhand.shop.user.service.impl;

import com.secondhand.shop.common.model.Coupon;
import com.secondhand.shop.common.model.CouponAssignment;
import com.secondhand.shop.common.model.Customer;
import com.secondhand.shop.common.model.Order;
import com.secondhand.shop.common.model.OrderItem;
import com.secondhand.shop.common.model.Product;
import com.secondhand.shop.common.repository.CouponAssignmentRepository;
import com.secondhand.shop.common.repository.CouponRepository;
import com.secondhand.shop.common.repository.CustomerRepository;
import com.secondhand.shop.common.repository.OrderRepository;
import com.secondhand.shop.common.repository.ProductRepository;
import com.secondhand.shop.common.support.CouponSupport;
import com.secondhand.shop.common.support.CustomerRankSupport;
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
    private final CouponRepository couponRepository;
    private final CouponAssignmentRepository couponAssignmentRepository;

    private static final List<Order.OrderStatus> COUPON_USAGE_EXCLUDED_STATUSES = List.of(
            Order.OrderStatus.CANCELLED,
            Order.OrderStatus.REJECTED
    );

    @Override
    @Transactional
    public Object createOrder(OrderRequestDTO request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Khong tim thay khach hang voi id: " + request.getCustomerId()));

        Order order = new Order();
        order.setCustomer(customer);
        order.setOrderCode("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        order.setUserId(customer.getUser().getId());
        order.setFullName(customer.getUser().getFullName());
        order.setPhone(request.getShippingPhone());
        order.setAddress(request.getShippingAddress());
        order.setShippingAddress(request.getShippingAddress());
        order.setShippingPhone(request.getShippingPhone());
        order.setNote(request.getNote());
        order.setStatus(Order.OrderStatus.PENDING);

        List<OrderItem> orderItems = new ArrayList<>();
        double subtotal = 0.0;
        for (OrderRequestDTO.OrderItemRequestDTO itemDTO : request.getOrderItems()) {
            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm ID: " + itemDTO.getProductId()));

            // ✅ KIỂM TRA TỒN KHO
            if (product.getQuantity() < itemDTO.getQuantity()) {
                throw new RuntimeException("Sản phẩm '" + product.getName() + "' chỉ còn " + product.getQuantity() + " sản phẩm có sẵn. Vui lòng giảm số lượng.");
            }

            double itemSubtotal = product.getPrice() * itemDTO.getQuantity();
            subtotal += itemSubtotal;

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .productName(product.getName())
                    .price(product.getPrice())
                    .quantity(itemDTO.getQuantity())
                    .subtotal(itemSubtotal)
                    .build();
            orderItems.add(orderItem);

            // ✅ TRỪ KHO
            product.setQuantity(product.getQuantity() - itemDTO.getQuantity());
            if (product.getQuantity() <= 0 && product.getStatus() != Product.ProductStatus.DELETED) {
                product.setStatus(Product.ProductStatus.SOLD);
            }
            productRepository.save(product);
        }

        Coupon coupon = resolveCoupon(request.getCouponId(), customer, subtotal);
        double discountAmount = coupon != null ? CouponSupport.calculateDiscountAmount(coupon, subtotal) : 0.0;
        double finalAmount = Math.max(0.0, subtotal - discountAmount);

        order.setCoupon(coupon);
        order.setCouponCode(coupon != null ? coupon.getCode() : null);
        order.setCouponName(coupon != null ? coupon.getName() : null);
        order.setTotalAmount(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setFinalAmount(finalAmount);
        order.setOrderItems(orderItems);

        return orderRepository.save(order);
    }

    @Override
    public List<?> getOrdersByUserId(Long userId) {
        return orderRepository.findByCustomerUserIdWithItems(userId);
    }

    @Override
    public Object getOrderDetail(Long orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    @Override
    @Transactional
    public Object cancelPendingOrder(Long orderId, Long userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay don hang"));

        if (order.getCustomer() == null || order.getCustomer().getUser() == null
                || !order.getCustomer().getUser().getId().equals(userId)) {
            throw new RuntimeException("Ban khong co quyen huy don hang nay");
        }

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Chi duoc huy don o trang thai cho xac nhan");
        }

        order.setStatus(Order.OrderStatus.CANCELLED);

        for (OrderItem item : order.getOrderItems()) {
            Product product = item.getProduct();
            if (product == null) {
                continue;
            }

            product.setQuantity(product.getQuantity() + item.getQuantity());
            if (product.getStatus() != Product.ProductStatus.DELETED) {
                product.setStatus(Product.ProductStatus.AVAILABLE);
            }
            productRepository.save(product);
        }

        return orderRepository.save(order);
    }

    private Coupon resolveCoupon(Long couponId, Customer customer, double subtotal) {
        if (couponId == null) {
            return null;
        }

        Coupon coupon = couponRepository.findByIdForUpdate(couponId)
                .orElseThrow(() -> new RuntimeException("Khong tim thay voucher da chon"));

        if (!CouponSupport.isActiveAt(coupon, LocalDateTime.now())) {
            throw new RuntimeException("Voucher da chon khong con hieu luc");
        }

        List<CouponAssignment> assignments = couponAssignmentRepository.findByCouponId(couponId);
        if (!assignments.isEmpty()) {
            boolean matched = assignments.stream().anyMatch(assignment ->
                    assignment.getCustomer() != null
                            && assignment.getCustomer().getId().equals(customer.getId()));
            if (!matched) {
                matched = assignments.stream().anyMatch(assignment ->
                        assignment.getAssignmentType() == CouponAssignment.AssignmentType.LEVEL
                                && assignment.getTargetRank() == customer.getLevel());
            }
            if (!matched) {
                throw new RuntimeException("Voucher nay chua duoc gan cho tai khoan cua ban");
            }
        } else if (!CustomerRankSupport.meetsMinimumRank(customer.getTotalSpent(), coupon.getMinRank())) {
            throw new RuntimeException("Hang khach hang cua ban chua du dieu kien de dung voucher nay");
        }

        if (hasCustomerUsedCoupon(customer.getId(), coupon.getId())) {
            throw new RuntimeException("Moi khach hang chi duoc su dung voucher nay 1 lan");
        }

        if (isCouponExhausted(coupon)) {
            throw new RuntimeException("Voucher da het luot su dung");
        }

        if (coupon.getMinOrderValue() != null && subtotal < coupon.getMinOrderValue()) {
            long minOrderValue = Math.round(coupon.getMinOrderValue());
            throw new RuntimeException("Don hang toi thieu " + minOrderValue + "d moi duoc dung voucher nay");
        }

        return coupon;
    }

    private boolean hasCustomerUsedCoupon(Long customerId, Long couponId) {
        return orderRepository.existsByCustomer_IdAndCoupon_IdAndStatusNotIn(
                customerId,
                couponId,
                COUPON_USAGE_EXCLUDED_STATUSES
        );
    }

    private boolean isCouponExhausted(Coupon coupon) {
        Integer totalQuantity = coupon.getTotalQuantity();
        if (totalQuantity == null || totalQuantity <= 0) {
            return false;
        }
        return countCouponUsedQuantity(coupon.getId()) >= totalQuantity;
    }

    private int countCouponUsedQuantity(Long couponId) {
        return (int) orderRepository.countByCoupon_IdAndStatusNotIn(couponId, COUPON_USAGE_EXCLUDED_STATUSES);
    }
}

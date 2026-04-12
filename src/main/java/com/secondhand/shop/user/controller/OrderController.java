package com.secondhand.shop.user.controller;

import com.secondhand.shop.user.dto.OrderRequestDTO;
import com.secondhand.shop.user.service.OrderService;
import com.secondhand.shop.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController("userOrderController")
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin("*")
public class OrderController {

    private final OrderService orderService;

    /**
     * POST /api/orders/checkout  --> tránh xung đột với admin POST /api/orders
     */
    @PostMapping("/checkout")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequestDTO request) {
        try {
            Object order = orderService.createOrder(request);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi tạo đơn hàng: " + e.getMessage());
        }
    }

    /**
     * GET /api/orders/user/{userId}  --> lấy lịch sử đơn hàng
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getOrdersByUser(@PathVariable Long userId) {
        try {
            List<?> orders = orderService.getOrdersByUserId(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi khi tải lịch sử đơn hàng: " + e.getMessage());
        }
    }

    /**
     * GET /api/orders/{orderId}  --> chi tiết đơn hàng
     */
    @GetMapping("/user/detail/{orderId}")
    public ResponseEntity<?> getOrderDetail(@PathVariable Long orderId) {
        try {
            Object order = orderService.getOrderDetail(orderId);
            if (order == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lỗi: " + e.getMessage());
        }
    }

    @PostMapping("/{orderId}/cancel-by-user")
    public ResponseEntity<?> cancelPendingOrder(@PathVariable Long orderId, Authentication authentication) {
        try {
            Long currentUserId = extractCurrentUserId(authentication);
            if (currentUserId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("KhĂ´ng xĂ¡c Ä‘á»‹nh Ä‘Æ°á»£c ngÆ°á»i dĂ¹ng");
            }
            Object order = orderService.cancelPendingOrder(orderId, currentUserId);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Lá»—i khi há»§y Ä‘Æ¡n: " + e.getMessage());
        }
    }

    private Long extractCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetails customUserDetails) {
            return customUserDetails.getUser().getId();
        }
        return null;
    }
}

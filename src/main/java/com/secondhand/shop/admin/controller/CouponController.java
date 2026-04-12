package com.secondhand.shop.admin.controller;

import com.secondhand.shop.admin.dto.CouponAssignmentDTO;
import com.secondhand.shop.admin.dto.CouponAssignmentRequestDTO;
import com.secondhand.shop.admin.dto.CouponDTO;
import com.secondhand.shop.admin.dto.CustomerDTO;
import com.secondhand.shop.admin.service.CouponService;
import com.secondhand.shop.admin.service.CustomerService;
import com.secondhand.shop.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CouponController {

    private final CouponService couponService;
    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<List<CouponDTO>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @GetMapping("/me")
    public ResponseEntity<List<CouponDTO>> getCurrentCustomerCoupons(Authentication authentication) {
        Long currentUserId = extractCurrentUserId(authentication);
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        CustomerDTO customer = customerService.getCustomerByUserId(currentUserId);
        return ResponseEntity.ok(couponService.getAvailableCouponsForCustomer(customer.getId()));
    }

    @PostMapping
    public ResponseEntity<CouponDTO> createCoupon(@RequestBody CouponDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(couponService.createCoupon(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CouponDTO> updateCoupon(@PathVariable Long id, @RequestBody CouponDTO dto) {
        return ResponseEntity.ok(couponService.updateCoupon(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{couponId}/assign/level")
    public ResponseEntity<CouponAssignmentDTO> assignCouponToLevel(
            @PathVariable Long couponId,
            @RequestBody CouponAssignmentRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(couponService.assignCouponToLevel(couponId, request.getRank()));
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateCoupon(@RequestParam String code, @RequestParam Long customerId) {
        try {
            return ResponseEntity.ok(couponService.validateCoupon(code, customerId));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
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


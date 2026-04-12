package com.secondhand.shop.admin.service;

import com.secondhand.shop.admin.dto.CouponAssignmentDTO;
import com.secondhand.shop.admin.dto.CouponDTO;

import java.util.List;

public interface CouponService {
    List<CouponDTO> getAllCoupons();
    CouponDTO createCoupon(CouponDTO dto);
    CouponDTO updateCoupon(Long id, CouponDTO dto);
    void deleteCoupon(Long id);
    CouponDTO validateCoupon(String code, Long customerId);
    List<CouponDTO> getAvailableCouponsForCustomer(Long customerId);

    default CouponAssignmentDTO assignCouponToLevel(Long couponId, String rank) {
        throw new UnsupportedOperationException("assignCouponToLevel is not implemented");
    }

    default CouponAssignmentDTO assignCouponToCustomer(Long couponId, Long customerId) {
        throw new UnsupportedOperationException("assignCouponToCustomer is not implemented");
    }

    default List<CouponAssignmentDTO> assignCouponsToCustomer(Long customerId, List<Long> couponIds) {
        throw new UnsupportedOperationException("assignCouponsToCustomer is not implemented");
    }
}

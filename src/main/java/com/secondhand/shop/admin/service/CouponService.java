package com.secondhand.shop.admin.service;

import com.secondhand.shop.admin.dto.CouponDTO;
import java.util.List;

public interface CouponService {
    List<CouponDTO> getAllCoupons();
    CouponDTO createCoupon(CouponDTO dto);
    CouponDTO updateCoupon(Long id, CouponDTO dto);
    void deleteCoupon(Long id);
    CouponDTO validateCoupon(String code, Long customerId);
}
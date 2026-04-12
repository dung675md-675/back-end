package com.secondhand.shop.admin.service.impl;

import com.secondhand.shop.admin.dto.CouponDTO;
import com.secondhand.shop.admin.service.CouponService;
import com.secondhand.shop.common.model.Coupon;
import com.secondhand.shop.common.model.Coupon.CustomerRank;
import com.secondhand.shop.common.model.Customer;
import com.secondhand.shop.common.repository.CouponRepository;
import com.secondhand.shop.common.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CouponDTO> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(CouponDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public CouponDTO createCoupon(CouponDTO dto) {
        if (couponRepository.existsByCode(dto.getCode()))
            throw new RuntimeException("Mã coupon đã tồn tại: " + dto.getCode());

        Coupon coupon = Coupon.builder()
                .code(dto.getCode().toUpperCase())
                .discountPercent(dto.getDiscountPercent())
                .maxDiscountAmount(dto.getMaxDiscountAmount())
                .minOrderAmount(dto.getMinOrderAmount() != null ? dto.getMinOrderAmount() : 0.0)
                .minRank(CustomerRank.valueOf(dto.getMinRank()))
                .status(Coupon.CouponStatus.ACTIVE)
                .expiryDate(dto.getExpiryDate() != null ? LocalDateTime.parse(dto.getExpiryDate()) : null)
                .build();

        return CouponDTO.fromEntity(couponRepository.save(coupon));
    }

    @Override
    public CouponDTO updateCoupon(Long id, CouponDTO dto) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy coupon"));
        coupon.setDiscountPercent(dto.getDiscountPercent());
        coupon.setMaxDiscountAmount(dto.getMaxDiscountAmount());
        coupon.setMinOrderAmount(dto.getMinOrderAmount());
        coupon.setMinRank(CustomerRank.valueOf(dto.getMinRank()));
        coupon.setStatus(Coupon.CouponStatus.valueOf(dto.getStatus()));
        return CouponDTO.fromEntity(couponRepository.save(coupon));
    }

    @Override
    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public CouponDTO validateCoupon(String code, Long customerId) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Mã giảm giá không hợp lệ"));

        if (coupon.getStatus() == Coupon.CouponStatus.INACTIVE)
            throw new RuntimeException("Mã giảm giá đã hết hạn sử dụng");

        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDateTime.now()))
            throw new RuntimeException("Mã giảm giá đã hết hạn");

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        // Kiểm tra rank: rank của customer phải >= minRank của coupon
        int customerRankOrder = customer.getRank().ordinal();
        int requiredRankOrder = coupon.getMinRank().ordinal();
        if (customerRankOrder < requiredRankOrder)
            throw new RuntimeException("Rank của bạn chưa đủ để dùng mã này. Cần rank: " + coupon.getMinRank());

        return CouponDTO.fromEntity(coupon);
    }
}
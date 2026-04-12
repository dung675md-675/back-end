package com.secondhand.shop.common.support;

import com.secondhand.shop.common.model.Coupon;

import java.time.LocalDateTime;
import java.util.Locale;

public final class CouponSupport {

    private CouponSupport() {
    }

    public static boolean isActiveAt(Coupon coupon, LocalDateTime time) {
        if (coupon == null || coupon.getStatus() != Coupon.CouponStatus.ACTIVE) {
            return false;
        }

        LocalDateTime effectiveTime = time != null ? time : LocalDateTime.now();
        if (coupon.getStartDate() != null && coupon.getStartDate().isAfter(effectiveTime)) {
            return false;
        }

        return coupon.getExpiryDate() == null || !coupon.getExpiryDate().isBefore(effectiveTime);
    }

    public static double calculateDiscountAmount(Coupon coupon, double subtotal) {
        if (coupon == null || subtotal <= 0) {
            return 0.0;
        }

        if (coupon.getMinOrderAmount() != null && subtotal < coupon.getMinOrderAmount()) {
            return 0.0;
        }

        Coupon.DiscountType discountType = coupon.getDiscountType() != null
                ? coupon.getDiscountType()
                : Coupon.DiscountType.PERCENT;

        return switch (discountType) {
            case FIXED_AMOUNT -> clamp(coupon.getFixedDiscountAmount(), subtotal);
            case PERCENT -> {
                double percent = coupon.getDiscountPercent() != null ? coupon.getDiscountPercent() : 0;
                double rawDiscount = subtotal * percent / 100.0;
                double maxDiscount = coupon.getMaxDiscountAmount() != null && coupon.getMaxDiscountAmount() > 0
                        ? coupon.getMaxDiscountAmount()
                        : rawDiscount;
                yield clamp(Math.min(rawDiscount, maxDiscount), subtotal);
            }
        };
    }

    public static String getDiscountLabel(Coupon coupon) {
        if (coupon == null) {
            return "";
        }

        Coupon.DiscountType discountType = coupon.getDiscountType() != null
                ? coupon.getDiscountType()
                : Coupon.DiscountType.PERCENT;

        if (discountType == Coupon.DiscountType.FIXED_AMOUNT) {
            return "Giảm " + formatAmount(coupon.getFixedDiscountAmount());
        }

        return "Giảm " + (coupon.getDiscountPercent() != null ? coupon.getDiscountPercent() : 0) + "%";
    }

    private static double clamp(Double discount, double subtotal) {
        double safeDiscount = discount != null ? discount : 0.0;
        return Math.max(0.0, Math.min(safeDiscount, subtotal));
    }

    private static String formatAmount(Double amount) {
        double safeAmount = amount != null ? amount : 0.0;
        return String.format(Locale.US, "%,.0fđ", safeAmount).replace(',', '.');
    }
}

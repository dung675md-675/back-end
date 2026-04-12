package com.secondhand.shop.common.support;

import com.secondhand.shop.common.model.Coupon;
import com.secondhand.shop.common.model.CustomerLevel;

public final class CustomerRankSupport {

    public static final double SILVER_MIN_SPENT = 1_000_000;
    public static final double GOLD_MIN_SPENT = 5_000_000;
    public static final double PLATINUM_MIN_SPENT = 10_000_000;
    public static final double DIAMOND_MIN_SPENT = 15_000_000;
    public static final double VIP_A_MIN_SPENT = 20_000_000;
    public static final double VIP_S_MIN_SPENT = 30_000_000;
    public static final double VIP_SS_MIN_SPENT = 50_000_000;
    public static final double VIP_SSS_MIN_SPENT = 100_000_000;

    private CustomerRankSupport() {
    }

    public static CustomerLevel resolveLevel(Double totalSpent) {
        double spent = totalSpent == null ? 0.0 : totalSpent;

        if (spent < SILVER_MIN_SPENT) {
            return CustomerLevel.BRONZE;
        }
        if (spent < GOLD_MIN_SPENT) {
            return CustomerLevel.SILVER;
        }
        if (spent < PLATINUM_MIN_SPENT) {
            return CustomerLevel.GOLD;
        }
        if (spent < DIAMOND_MIN_SPENT) {
            return CustomerLevel.PLATINUM;
        }
        if (spent < VIP_A_MIN_SPENT) {
            return CustomerLevel.DIAMOND;
        }
        if (spent < VIP_S_MIN_SPENT) {
            return CustomerLevel.VIP_A;
        }
        if (spent < VIP_SS_MIN_SPENT) {
            return CustomerLevel.VIP_S;
        }
        if (spent < VIP_SSS_MIN_SPENT) {
            return CustomerLevel.VIP_SS;
        }
        return CustomerLevel.VIP_SSS;
    }

    public static Coupon.CustomerRank resolveCouponRank(Double totalSpent) {
        return resolveCouponRank(resolveLevel(totalSpent));
    }

    public static Coupon.CustomerRank resolveCouponRank(CustomerLevel level) {
        return switch (level) {
            case BRONZE -> Coupon.CustomerRank.BRONZE;
            case SILVER -> Coupon.CustomerRank.SILVER;
            case GOLD -> Coupon.CustomerRank.GOLD;
            case PLATINUM -> Coupon.CustomerRank.PLATINUM;
            case DIAMOND, VIP_A, VIP_S, VIP_SS, VIP_SSS -> Coupon.CustomerRank.DIAMOND;
        };
    }

    public static boolean meetsMinimumRank(Double totalSpent, Coupon.CustomerRank minRank) {
        double spent = totalSpent == null ? 0.0 : totalSpent;

        return switch (minRank) {
            case BRONZE -> spent >= 0;
            case SILVER -> spent >= SILVER_MIN_SPENT;
            case GOLD -> spent >= GOLD_MIN_SPENT;
            case PLATINUM -> spent >= PLATINUM_MIN_SPENT;
            case DIAMOND -> spent >= DIAMOND_MIN_SPENT;
        };
    }

    public static String getDisplayLabel(CustomerLevel level) {
        return switch (level) {
            case BRONZE -> "Dong";
            case SILVER -> "Bac";
            case GOLD -> "Vang";
            case PLATINUM -> "Bach Kim";
            case DIAMOND -> "Kim Cuong";
            case VIP_A -> "VIP A";
            case VIP_S -> "VIP S";
            case VIP_SS -> "VIP SS";
            case VIP_SSS -> "VIP SSS";
        };
    }
}

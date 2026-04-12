package com.secondhand.shop;

import com.secondhand.shop.common.model.CustomerLevel;
import com.secondhand.shop.common.support.CustomerRankSupport;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class CustomerRankSupportTests {

    @Test
    void shouldResolveCustomerLevelsUsingNewThresholds() {
        assertThat(CustomerRankSupport.resolveLevel(0.0)).isEqualTo(CustomerLevel.BRONZE);
        assertThat(CustomerRankSupport.resolveLevel(999_999.0)).isEqualTo(CustomerLevel.BRONZE);
        assertThat(CustomerRankSupport.resolveLevel(1_000_000.0)).isEqualTo(CustomerLevel.SILVER);
        assertThat(CustomerRankSupport.resolveLevel(4_999_999.0)).isEqualTo(CustomerLevel.SILVER);
        assertThat(CustomerRankSupport.resolveLevel(5_000_000.0)).isEqualTo(CustomerLevel.GOLD);
        assertThat(CustomerRankSupport.resolveLevel(9_999_999.0)).isEqualTo(CustomerLevel.GOLD);
        assertThat(CustomerRankSupport.resolveLevel(10_000_000.0)).isEqualTo(CustomerLevel.PLATINUM);
        assertThat(CustomerRankSupport.resolveLevel(14_999_999.0)).isEqualTo(CustomerLevel.PLATINUM);
        assertThat(CustomerRankSupport.resolveLevel(15_000_000.0)).isEqualTo(CustomerLevel.DIAMOND);
        assertThat(CustomerRankSupport.resolveLevel(19_999_999.0)).isEqualTo(CustomerLevel.DIAMOND);
        assertThat(CustomerRankSupport.resolveLevel(20_000_000.0)).isEqualTo(CustomerLevel.VIP_A);
        assertThat(CustomerRankSupport.resolveLevel(29_999_999.0)).isEqualTo(CustomerLevel.VIP_A);
        assertThat(CustomerRankSupport.resolveLevel(30_000_000.0)).isEqualTo(CustomerLevel.VIP_S);
        assertThat(CustomerRankSupport.resolveLevel(49_999_999.0)).isEqualTo(CustomerLevel.VIP_S);
        assertThat(CustomerRankSupport.resolveLevel(50_000_000.0)).isEqualTo(CustomerLevel.VIP_SS);
        assertThat(CustomerRankSupport.resolveLevel(99_999_999.0)).isEqualTo(CustomerLevel.VIP_SS);
        assertThat(CustomerRankSupport.resolveLevel(100_000_000.0)).isEqualTo(CustomerLevel.VIP_SSS);
    }
}

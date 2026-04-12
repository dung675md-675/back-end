package com.secondhand.shop.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CouponAssignmentRequestDTO {
    private String rank;
    private List<String> ranks;
    private Long customerId;
    private List<Long> couponIds;
}

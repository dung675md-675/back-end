package com.secondhand.shop.admin.dto;

import com.secondhand.shop.common.model.CouponAssignment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponAssignmentDTO {
    private Long id;
    private Long couponId;
    private String couponCode;
    private String assignmentType;
    private String targetRank;
    private Long customerId;
    private String customerName;
    private LocalDateTime createdAt;

    public static CouponAssignmentDTO fromEntity(CouponAssignment assignment) {
        return CouponAssignmentDTO.builder()
                .id(assignment.getId())
                .couponId(assignment.getCoupon().getId())
                .couponCode(assignment.getCoupon().getCode())
                .assignmentType(assignment.getAssignmentType().name())
                .targetRank(assignment.getTargetRank() != null ? assignment.getTargetRank().name() : null)
                .customerId(assignment.getCustomer() != null ? assignment.getCustomer().getId() : null)
                .customerName(assignment.getCustomer() != null ? assignment.getCustomer().getUser().getFullName() : null)
                .createdAt(assignment.getCreatedAt())
                .build();
    }
}

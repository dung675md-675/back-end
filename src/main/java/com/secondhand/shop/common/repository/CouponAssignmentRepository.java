package com.secondhand.shop.common.repository;

import com.secondhand.shop.common.model.CouponAssignment;
import com.secondhand.shop.common.model.CustomerLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface CouponAssignmentRepository extends JpaRepository<CouponAssignment, Long> {

    List<CouponAssignment> findByCouponId(Long couponId);

    List<CouponAssignment> findByCustomerId(Long customerId);

    List<CouponAssignment> findByCustomerIdIn(Collection<Long> customerIds);

    boolean existsByCouponIdAndCustomerId(Long couponId, Long customerId);

    boolean existsByCustomerIdAndCouponId(Long customerId, Long couponId);

    boolean existsByCouponIdAndTargetRankAndAssignmentType(
            Long couponId,
            CustomerLevel targetRank,
            CouponAssignment.AssignmentType assignmentType
    );
}

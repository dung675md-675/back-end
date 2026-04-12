package com.secondhand.shop.admin.service.impl;

import com.secondhand.shop.admin.dto.CouponAssignmentDTO;
import com.secondhand.shop.admin.dto.CouponDTO;
import com.secondhand.shop.admin.service.CouponService;
import com.secondhand.shop.common.model.Coupon;
import com.secondhand.shop.common.model.CouponAssignment;
import com.secondhand.shop.common.model.Customer;
import com.secondhand.shop.common.model.CustomerLevel;
import com.secondhand.shop.common.repository.CouponAssignmentRepository;
import com.secondhand.shop.common.repository.CouponRepository;
import com.secondhand.shop.common.repository.CustomerRepository;
import com.secondhand.shop.common.support.CouponSupport;
import com.secondhand.shop.common.support.CustomerRankSupport;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@Primary
@RequiredArgsConstructor
@Transactional
public class PrimaryCouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final CouponAssignmentRepository couponAssignmentRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CouponDTO> getAllCoupons() {
        return couponRepository.findAll().stream()
                .sorted((left, right) -> {
                    LocalDateTime leftTime = left.getCreatedAt() != null ? left.getCreatedAt() : LocalDateTime.MIN;
                    LocalDateTime rightTime = right.getCreatedAt() != null ? right.getCreatedAt() : LocalDateTime.MIN;
                    return rightTime.compareTo(leftTime);
                })
                .map(CouponDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public CouponDTO createCoupon(CouponDTO dto) {
        String normalizedCode = normalizeCode(dto.getCode());
        if (couponRepository.existsByCode(normalizedCode)) {
            throw new RuntimeException("M? voucher đ? t?n t?i: " + normalizedCode);
        }

        Coupon coupon = Coupon.builder()
                .name(resolveName(dto))
                .code(normalizedCode)
                .discountType(resolveDiscountType(dto))
                .discountPercent(resolveDiscountPercent(dto))
                .fixedDiscountAmount(resolveFixedDiscountAmount(dto))
                .maxDiscountAmount(resolveMaxDiscountAmount(dto))
                .minOrderAmount(dto.getMinOrderAmount() != null ? dto.getMinOrderAmount() : 0.0)
                .minRank(Coupon.CustomerRank.BRONZE)
                .status(Coupon.CouponStatus.ACTIVE)
                .startDate(parseDateTime(dto.getStartDate()))
                .expiryDate(parseDateTime(firstNonBlank(dto.getEndDate(), dto.getExpiryDate())))
                .build();

        Coupon savedCoupon = couponRepository.save(coupon);
        assignCouponToLevelsInternal(savedCoupon, dto.getTargetLevels());
        return CouponDTO.fromEntity(savedCoupon);
    }

    @Override
    public CouponDTO updateCoupon(Long id, CouponDTO dto) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không t?m th?y voucher"));

        coupon.setName(resolveName(dto));
        coupon.setCode(normalizeCode(dto.getCode()));
        coupon.setDiscountType(resolveDiscountType(dto));
        coupon.setDiscountPercent(resolveDiscountPercent(dto));
        coupon.setFixedDiscountAmount(resolveFixedDiscountAmount(dto));
        coupon.setMaxDiscountAmount(resolveMaxDiscountAmount(dto));
        coupon.setMinOrderAmount(dto.getMinOrderAmount() != null ? dto.getMinOrderAmount() : 0.0);
        coupon.setStartDate(parseDateTime(dto.getStartDate()));
        coupon.setExpiryDate(parseDateTime(firstNonBlank(dto.getEndDate(), dto.getExpiryDate())));
        if (dto.getStatus() != null && !dto.getStatus().isBlank()) {
            coupon.setStatus(Coupon.CouponStatus.valueOf(dto.getStatus()));
        }

        return CouponDTO.fromEntity(couponRepository.save(coupon));
    }

    @Override
    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public CouponDTO validateCoupon(String code, Long customerId) {
        Coupon coupon = couponRepository.findByCode(normalizeCode(code))
                .orElseThrow(() -> new RuntimeException("M? gi?m giá không h?p l?"));

        if (!CouponSupport.isActiveAt(coupon, LocalDateTime.now())) {
            throw new RuntimeException("Voucher hi?n không c?n hi?u l?c");
        }

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không t?m th?y khách hàng"));

        List<CouponAssignment> assignments = couponAssignmentRepository.findByCouponId(coupon.getId());
        if (!assignments.isEmpty()) {
            boolean matched = assignments.stream().anyMatch(assignment ->
                    assignment.getCustomer() != null
                            && assignment.getCustomer().getId().equals(customerId));

            if (!matched) {
                matched = assignments.stream().anyMatch(assignment ->
                        assignment.getAssignmentType() == CouponAssignment.AssignmentType.LEVEL
                                && assignment.getTargetRank() == customer.getLevel());
            }

            if (!matched) {
                throw new RuntimeException("Voucher này chưa đư?c g?n cho tài kho?n c?a b?n");
            }

            return CouponDTO.fromEntity(coupon);
        }

        if (!CustomerRankSupport.meetsMinimumRank(customer.getTotalSpent(), coupon.getMinRank())) {
            throw new RuntimeException("H?ng khách hàng c?a b?n chưa đ? đ? dùng voucher này");
        }

        return CouponDTO.fromEntity(coupon);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CouponDTO> getAvailableCouponsForCustomer(Long customerId) {
        customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không t?m th?y khách hàng"));

        return couponAssignmentRepository.findByCustomerId(customerId).stream()
                .map(CouponAssignment::getCoupon)
                .filter(Objects::nonNull)
                .filter(coupon -> CouponSupport.isActiveAt(coupon, LocalDateTime.now()))
                .collect(Collectors.collectingAndThen(
                        Collectors.toMap(Coupon::getId, coupon -> coupon, (first, ignored) -> first),
                        map -> map.values().stream()
                                .sorted((left, right) -> left.getName().compareToIgnoreCase(right.getName()))
                                .map(CouponDTO::fromEntity)
                                .toList()
                ));
    }

    @Override
    public CouponAssignmentDTO assignCouponToLevel(Long couponId, String rank) {
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Không t?m th?y voucher"));

        List<CouponAssignment> createdAssignments = createAssignmentsForLevel(coupon, rank);
        if (createdAssignments.isEmpty()) {
            throw new RuntimeException("Không có khách hàng phù h?p trong h?ng đ? ch?n");
        }

        return CouponAssignmentDTO.fromEntity(createdAssignments.get(0));
    }

    @Override
    public CouponAssignmentDTO assignCouponToCustomer(Long couponId, Long customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không t?m th?y khách hàng"));
        Coupon coupon = couponRepository.findById(couponId)
                .orElseThrow(() -> new RuntimeException("Không t?m th?y voucher"));

        CouponAssignment assignment = findOrCreateCustomerAssignment(customer, coupon);
        return CouponAssignmentDTO.fromEntity(assignment);
    }

    @Override
    public List<CouponAssignmentDTO> assignCouponsToCustomer(Long customerId, List<Long> couponIds) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không t?m th?y khách hàng"));

        List<Long> normalizedIds = couponIds == null ? List.of() : couponIds.stream()
                .filter(Objects::nonNull)
                .distinct()
                .toList();
        if (normalizedIds.isEmpty()) {
            return List.of();
        }

        List<Coupon> coupons = couponRepository.findAllById(normalizedIds);
        if (coupons.size() != normalizedIds.size()) {
            throw new RuntimeException("Có voucher không t?n t?i trong danh sách đ? ch?n");
        }

        List<CouponAssignmentDTO> assignments = new ArrayList<>();
        for (Coupon coupon : coupons) {
            CouponAssignment assignment = findOrCreateCustomerAssignment(customer, coupon);
            assignments.add(CouponAssignmentDTO.fromEntity(assignment));
        }
        return assignments;
    }

    private void assignCouponToLevelsInternal(Coupon coupon, List<String> targetLevels) {
        if (targetLevels == null || targetLevels.isEmpty()) {
            return;
        }

        Set<String> normalizedLevels = targetLevels.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(level -> !level.isEmpty())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        for (String level : normalizedLevels) {
            createAssignmentsForLevel(coupon, level);
        }
    }

    private List<CouponAssignment> createAssignmentsForLevel(Coupon coupon, String rank) {
        CustomerLevel targetRank = CustomerLevel.valueOf(rank.trim().toUpperCase(Locale.ROOT));
        List<Customer> customers = customerRepository.findAll().stream()
                .filter(customer -> customer.getLevel() == targetRank)
                .toList();

        List<CouponAssignment> assignments = new ArrayList<>();
        for (Customer customer : customers) {
            assignments.add(findOrCreateCustomerAssignment(customer, coupon));
        }
        return assignments;
    }

    private CouponAssignment findOrCreateCustomerAssignment(Customer customer, Coupon coupon) {
        List<CouponAssignment> existingAssignments = couponAssignmentRepository.findByCustomerId(customer.getId());
        return existingAssignments.stream()
                .filter(assignment -> assignment.getCoupon() != null && assignment.getCoupon().getId().equals(coupon.getId()))
                .findFirst()
                .orElseGet(() -> couponAssignmentRepository.save(CouponAssignment.builder()
                        .coupon(coupon)
                        .customer(customer)
                        .assignmentType(CouponAssignment.AssignmentType.CUSTOMER)
                        .build()));
    }

    private Coupon.DiscountType resolveDiscountType(CouponDTO dto) {
        if (dto.getDiscountType() != null && !dto.getDiscountType().isBlank()) {
            return Coupon.DiscountType.valueOf(dto.getDiscountType());
        }
        if (dto.getFixedDiscountAmount() != null && dto.getFixedDiscountAmount() > 0) {
            return Coupon.DiscountType.FIXED_AMOUNT;
        }
        return Coupon.DiscountType.PERCENT;
    }

    private String resolveName(CouponDTO dto) {
        String candidate = firstNonBlank(dto.getName(), dto.getCode());
        if (candidate == null) {
            throw new RuntimeException("Tên voucher không đư?c đ? tr?ng");
        }
        return candidate.trim();
    }

    private String normalizeCode(String code) {
        if (code == null || code.isBlank()) {
            throw new RuntimeException("M? voucher không đư?c đ? tr?ng");
        }
        return code.trim().toUpperCase(Locale.ROOT);
    }

    private Integer resolveDiscountPercent(CouponDTO dto) {
        return resolveDiscountType(dto) == Coupon.DiscountType.PERCENT
                ? dto.getDiscountPercent()
                : 0;
    }

    private Double resolveFixedDiscountAmount(CouponDTO dto) {
        return resolveDiscountType(dto) == Coupon.DiscountType.FIXED_AMOUNT
                ? dto.getFixedDiscountAmount()
                : 0.0;
    }

    private Double resolveMaxDiscountAmount(CouponDTO dto) {
        if (resolveDiscountType(dto) == Coupon.DiscountType.FIXED_AMOUNT) {
            return dto.getFixedDiscountAmount() != null ? dto.getFixedDiscountAmount() : 0.0;
        }
        return dto.getMaxDiscountAmount() != null ? dto.getMaxDiscountAmount() : 0.0;
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return LocalDateTime.parse(value);
    }

    private String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        return second;
    }
}


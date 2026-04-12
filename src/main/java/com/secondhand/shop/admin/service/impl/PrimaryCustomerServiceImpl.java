package com.secondhand.shop.admin.service.impl;

import com.secondhand.shop.admin.dto.CustomerDTO;
import com.secondhand.shop.admin.service.CustomerService;
import com.secondhand.shop.common.model.CouponAssignment;
import com.secondhand.shop.common.model.Customer;
import com.secondhand.shop.common.model.User;
import com.secondhand.shop.common.repository.CouponAssignmentRepository;
import com.secondhand.shop.common.repository.CustomerRepository;
import com.secondhand.shop.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Primary
@RequiredArgsConstructor
@Transactional
public class PrimaryCustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final CouponAssignmentRepository couponAssignmentRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CustomerDTO> getAllCustomers() {
        List<Customer> customers = customerRepository.findAllByOrderByTotalSpentDescIdAsc();
        Map<Long, List<String>> assignmentMap = buildAssignmentMap(customers);

        return customers.stream()
                .map(customer -> CustomerDTO.fromEntity(
                        customer,
                        assignmentMap.getOrDefault(customer.getId(), List.of())))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        return CustomerDTO.fromEntity(customer, buildAssignmentMap(List.of(customer))
                .getOrDefault(customer.getId(), List.of()));
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDTO getCustomerByUserId(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Customer not found with user id: " + userId));
        return CustomerDTO.fromEntity(customer, buildAssignmentMap(List.of(customer))
                .getOrDefault(customer.getId(), List.of()));
    }

    @Override
    public CustomerDTO updateCustomer(Long id, CustomerDTO customerDTO) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));

        customer.setAddress(customerDTO.getAddress());
        customer.setCity(customerDTO.getCity());
        customer.setDistrict(customerDTO.getDistrict());
        customer.setWard(customerDTO.getWard());

        Customer updatedCustomer = customerRepository.save(customer);
        return CustomerDTO.fromEntity(updatedCustomer, buildAssignmentMap(List.of(updatedCustomer))
                .getOrDefault(updatedCustomer.getId(), List.of()));
    }

    @Override
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Customer not found with id: " + id);
        }
        customerRepository.deleteById(id);
    }

    @Override
    public CustomerDTO createCustomerWithUser(Long userId, CustomerDTO customerDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        if (customerRepository.existsByUserId(userId)) {
            throw new RuntimeException("Customer already exists for user id: " + userId);
        }

        Customer customer = Customer.builder()
                .user(user)
                .address(customerDTO.getAddress())
                .city(customerDTO.getCity())
                .district(customerDTO.getDistrict())
                .ward(customerDTO.getWard())
                .totalOrders(0)
                .totalSpent(0.0)
                .build();

        Customer savedCustomer = customerRepository.save(customer);
        return CustomerDTO.fromEntity(savedCustomer);
    }

    private Map<Long, List<String>> buildAssignmentMap(List<Customer> customers) {
        Map<Long, List<String>> assignmentMap = new HashMap<>();
        if (customers.isEmpty()) {
            return assignmentMap;
        }

        List<Long> customerIds = customers.stream()
                .map(Customer::getId)
                .toList();

        List<CouponAssignment> directAssignments = couponAssignmentRepository.findByCustomerIdIn(customerIds);
        directAssignments.forEach(assignment -> assignmentMap
                .computeIfAbsent(assignment.getCustomer().getId(), key -> new ArrayList<>())
                .add(assignment.getCoupon().getCode()));

        List<CouponAssignment> levelAssignments = couponAssignmentRepository.findAll().stream()
                .filter(assignment -> assignment.getAssignmentType() == CouponAssignment.AssignmentType.LEVEL)
                .toList();

        for (Customer customer : customers) {
            for (CouponAssignment assignment : levelAssignments) {
                if (assignment.getTargetRank() == customer.getLevel()) {
                    assignmentMap
                            .computeIfAbsent(customer.getId(), key -> new ArrayList<>())
                            .add(assignment.getCoupon().getCode());
                }
            }
        }

        assignmentMap.replaceAll((customerId, codes) -> codes.stream()
                .distinct()
                .sorted(Comparator.naturalOrder())
                .toList());
        return assignmentMap;
    }
}

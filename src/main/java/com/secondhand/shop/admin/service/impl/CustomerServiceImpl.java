package com.secondhand.shop.admin.service.impl;

import com.secondhand.shop.admin.dto.CustomerDTO;
import com.secondhand.shop.common.model.Customer;
import com.secondhand.shop.common.model.User;
import com.secondhand.shop.common.repository.CustomerRepository;
import com.secondhand.shop.common.repository.UserRepository;
import com.secondhand.shop.admin.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(CustomerDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        return CustomerDTO.fromEntity(customer);
    }

    @Override
    @Transactional(readOnly = true)
    public CustomerDTO getCustomerByUserId(Long userId) {
        Customer customer = customerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Customer not found with user id: " + userId));
        return CustomerDTO.fromEntity(customer);
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
        return CustomerDTO.fromEntity(updatedCustomer);
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
        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        // Check if customer already exists for this user
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
}
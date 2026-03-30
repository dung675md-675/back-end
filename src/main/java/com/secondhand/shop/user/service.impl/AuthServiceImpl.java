package com.secondhand.shop.user.service.impl;

import com.secondhand.shop.user.dto.AuthDTO;
import com.secondhand.shop.common.model.Customer;
import com.secondhand.shop.common.model.Role;
import com.secondhand.shop.common.model.User;
import com.secondhand.shop.common.repository.CustomerRepository;
import com.secondhand.shop.common.repository.RoleRepository;
import com.secondhand.shop.common.repository.UserRepository;
import com.secondhand.shop.user.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CustomerRepository customerRepository;

    @Override
    public AuthDTO.LoginResponse login(AuthDTO.LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Username hoặc mật khẩu không đúng!"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new RuntimeException("Username hoặc mật khẩu không đúng!");
        }

        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new RuntimeException("Tài khoản đã bị khóa!");
        }

        return AuthDTO.LoginResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .token(null)
                .build();
    }

    @Override
    public AuthDTO.LoginResponse register(AuthDTO.RegisterRequest request) {
        System.out.println("AuthServiceImpl.register() called");

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username đã tồn tại!");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Role CUSTOMER không tồn tại!"));

        User user = User.builder()
                .username(request.getUsername())
                .password(request.getPassword())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(customerRole)
                .status(User.UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);

        Customer customer = Customer.builder()
                .user(savedUser)
                .address(request.getAddress())
                .city(request.getCity())
                .district(request.getDistrict())
                .ward(request.getWard() != null ? request.getWard() : "")
                .totalOrders(0)
                .totalSpent(0.0)
                .build();

        customerRepository.save(customer);

        return AuthDTO.LoginResponse.builder()
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().getName())
                .token(null)
                .build();
    }
}
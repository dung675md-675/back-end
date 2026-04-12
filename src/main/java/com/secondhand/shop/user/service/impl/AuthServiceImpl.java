package com.secondhand.shop.user.service.impl;

import com.secondhand.shop.common.model.Customer;
import com.secondhand.shop.common.model.Role;
import com.secondhand.shop.common.model.User;
import com.secondhand.shop.common.repository.CustomerRepository;
import com.secondhand.shop.common.repository.RoleRepository;
import com.secondhand.shop.common.repository.UserRepository;
import com.secondhand.shop.security.CustomUserDetails;
import com.secondhand.shop.security.JwtService;
import com.secondhand.shop.user.dto.AuthDTO;
import com.secondhand.shop.user.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CustomerRepository customerRepository;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public AuthDTO.LoginResponse login(AuthDTO.LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()));

            CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
            User user = principal.getUser();
            String token = jwtService.generateToken(principal);

            return AuthDTO.LoginResponse.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .role(user.getRole().getName())
                    .token(token)
                    .build();
        } catch (BadCredentialsException e) {
            System.err.println("=== BAD CREDENTIALS: " + e.getMessage());
            throw new RuntimeException("Invalid username or password.");
        } catch (DisabledException e) {
            System.err.println("=== DISABLED: " + e.getMessage());
            throw new RuntimeException("Account is disabled or locked.");
        } catch (Exception e) {
            System.err.println("=== LOGIN ERROR: " + e.getClass().getName() + " - " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException(e.getMessage());
        }
    }

    @Override
    public AuthDTO.LoginResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already in use.");
        }

        Role customerRole = roleRepository.findByName("CUSTOMER")
                .orElseThrow(() -> new RuntimeException("Role CUSTOMER is missing."));

        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
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

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()));
        CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
        String token = jwtService.generateToken(principal);

        return AuthDTO.LoginResponse.builder()
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .fullName(savedUser.getFullName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().getName())
                .token(token)
                .build();
    }
}

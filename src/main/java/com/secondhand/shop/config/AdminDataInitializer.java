package com.secondhand.shop.config;

import com.secondhand.shop.common.model.Role;
import com.secondhand.shop.common.model.User;
import com.secondhand.shop.common.repository.RoleRepository;
import com.secondhand.shop.common.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.enabled:true}")
    private boolean adminEnabled;

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Value("${app.admin.email:admin@secondhandshop.local}")
    private String adminEmail;

    @Value("${app.admin.full-name:System Administrator}")
    private String adminFullName;

    @Value("${app.admin.phone:0123456789}")
    private String adminPhone;

    @Override
    public void run(String... args) {
        if (!adminEnabled) {
            return;
        }

        User admin = userRepository.findByUsername(adminUsername).orElse(null);
        
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .name("ADMIN")
                        .description("Administrator")
                        .build()));

        if (admin == null) {
            // Check email uniquely only for new creation
            if (userRepository.existsByEmail(adminEmail)) {
                return;
            }

            userRepository.save(User.builder()
                    .username(adminUsername)
                    .password(passwordEncoder.encode(adminPassword))
                    .email(adminEmail)
                    .fullName(adminFullName)
                    .phone(adminPhone)
                    .role(adminRole)
                    .status(User.UserStatus.ACTIVE)
                    .build());
            System.out.println("=== ADMIN USER CREATED: " + adminUsername);
        } else {
            // Force update password to match application.yml for recovery
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(adminRole); // Ensure role is correct
            userRepository.save(admin);
            System.out.println("=== ADMIN USER PASSWORD UPDATED from config: " + adminUsername);
        }
    }
}

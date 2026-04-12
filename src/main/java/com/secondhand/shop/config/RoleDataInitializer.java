package com.secondhand.shop.config;

import com.secondhand.shop.common.model.Role;
import com.secondhand.shop.common.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoleDataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {
        createRoleIfMissing("ADMIN", "Administrator");
        createRoleIfMissing("CUSTOMER", "Customer");
    }

    private void createRoleIfMissing(String name, String description) {
        if (roleRepository.existsByName(name)) {
            return;
        }

        roleRepository.save(Role.builder()
                .name(name)
                .description(description)
                .build());
    }
}

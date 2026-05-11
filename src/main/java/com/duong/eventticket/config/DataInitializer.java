package com.duong.eventticket.config;

import com.duong.eventticket.entity.Role;
import com.duong.eventticket.entity.RoleName;
import com.duong.eventticket.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) {

        if (roleRepository.count() == 0) {

            Role userRole = new Role();
            userRole.setName(RoleName.ROLE_USER);

            Role adminRole = new Role();
            adminRole.setName(RoleName.ROLE_ADMIN);

            roleRepository.save(userRole);
            roleRepository.save(adminRole);

            System.out.println("Roles initialized successfully");
        }
    }
}
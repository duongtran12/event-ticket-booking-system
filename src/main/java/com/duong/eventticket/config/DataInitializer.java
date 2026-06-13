package com.duong.eventticket.config;

import com.duong.eventticket.entity.Role;
import com.duong.eventticket.entity.RoleName;
import com.duong.eventticket.entity.User;
import com.duong.eventticket.repository.RoleRepository;
import com.duong.eventticket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

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

        if (!userRepository.existsByEmail("admin@gmail.com")) {
            Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Role Admin not found"));

            User admin = new User();
            admin.setFullName("System Admin");
            admin.setEmail("admin@gmail.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(adminRole);

            userRepository.save(admin);
            System.out.println("Default Admin user initialized successfully");
        }
    }
}
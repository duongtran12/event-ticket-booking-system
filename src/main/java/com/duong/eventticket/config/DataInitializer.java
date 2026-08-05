package com.duong.eventticket.config;

import com.duong.eventticket.entity.Role;
import com.duong.eventticket.entity.RoleName;
import com.duong.eventticket.entity.User;
import com.duong.eventticket.repository.RoleRepository;
import com.duong.eventticket.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public DataInitializer(
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap-admin.email:}") String adminEmail,
            @Value("${app.bootstrap-admin.password:}") String adminPassword
    ) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail == null ? "" : adminEmail.trim().toLowerCase();
        this.adminPassword = adminPassword == null ? "" : adminPassword;
    }

    @Override
    public void run(String... args) {
        initializeRole(RoleName.ROLE_USER);
        initializeRole(RoleName.ROLE_ADMIN);

        if (adminEmail.isBlank() && adminPassword.isBlank()) {
            log.info("Bootstrap admin creation is disabled. Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD to enable it.");
            return;
        }

        if (adminEmail.isBlank() || adminPassword.isBlank()) {
            throw new IllegalStateException("Both bootstrap admin email and password must be configured");
        }

        if (adminPassword.length() < 12) {
            throw new IllegalStateException("Bootstrap admin password must contain at least 12 characters");
        }

        if (userRepository.existsByEmail(adminEmail)) {
            log.info("Bootstrap admin account already exists: {}", adminEmail);
            return;
        }

        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseThrow(() -> new IllegalStateException("Admin role was not initialized"));

        User admin = new User();
        admin.setFullName("System Admin");
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole(adminRole);

        userRepository.save(admin);
        log.info("Bootstrap admin account created: {}", adminEmail);
    }

    private void initializeRole(RoleName roleName) {
        if (roleRepository.findByName(roleName).isEmpty()) {
            Role role = new Role();
            role.setName(roleName);
            roleRepository.save(role);
            log.info("Role initialized: {}", roleName);
        }
    }
}

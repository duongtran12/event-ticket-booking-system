package com.duong.eventticket.config;

import com.duong.eventticket.entity.Role;
import com.duong.eventticket.entity.RoleName;
import com.duong.eventticket.entity.User;
import com.duong.eventticket.repository.RoleRepository;
import com.duong.eventticket.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    void doesNotCreateAdminWhenBootstrapCredentialsAreEmpty() throws Exception {
        DataInitializer initializer = new DataInitializer(
                roleRepository, userRepository, passwordEncoder, "", ""
        );

        initializer.run();

        verify(userRepository, never()).save(any(User.class));
        verify(passwordEncoder, never()).encode(any());
    }

    @Test
    void createsConfiguredAdminWithoutStoringPlainTextPassword() throws Exception {
        Role adminRole = new Role();
        adminRole.setName(RoleName.ROLE_ADMIN);
        Role userRole = new Role();
        userRole.setName(RoleName.ROLE_USER);
        when(roleRepository.findByName(any(RoleName.class))).thenAnswer(invocation -> {
            RoleName roleName = invocation.getArgument(0);
            return Optional.of(roleName == RoleName.ROLE_ADMIN ? adminRole : userRole);
        });
        when(userRepository.existsByEmail("admin@example.com")).thenReturn(false);
        when(passwordEncoder.encode("a-secure-password")).thenReturn("encoded-password");

        DataInitializer initializer = new DataInitializer(
                roleRepository, userRepository, passwordEncoder,
                " Admin@Example.com ", "a-secure-password"
        );

        initializer.run();

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals("admin@example.com", userCaptor.getValue().getEmail());
        assertEquals("encoded-password", userCaptor.getValue().getPassword());
        assertEquals(adminRole, userCaptor.getValue().getRole());
    }

    @Test
    void rejectsIncompleteBootstrapCredentials() {
        DataInitializer initializer = new DataInitializer(
                roleRepository, userRepository, passwordEncoder, "admin@example.com", ""
        );

        assertThrows(IllegalStateException.class, initializer::run);
        verify(userRepository, never()).save(any(User.class));
    }
}

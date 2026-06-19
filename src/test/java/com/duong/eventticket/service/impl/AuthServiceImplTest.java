package com.duong.eventticket.service.impl;

import com.duong.eventticket.dto.request.LoginRequest;
import com.duong.eventticket.dto.request.RegisterRequest;
import com.duong.eventticket.dto.response.LoginResponse;
import com.duong.eventticket.dto.response.MessageResponse;
import com.duong.eventticket.entity.Role;
import com.duong.eventticket.entity.RoleName;
import com.duong.eventticket.entity.User;
import com.duong.eventticket.exception.custom.ResourceAlreadyExistsException;
import com.duong.eventticket.exception.custom.ResourceNotFoundException;
import com.duong.eventticket.repository.RoleRepository;
import com.duong.eventticket.repository.UserRepository;
import com.duong.eventticket.security.jwt.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void registerShouldCreateUserWithEncodedPasswordAndDefaultRole() {
        RegisterRequest request = buildRegisterRequest();
        Role userRole = buildRole(RoleName.ROLE_USER);

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(roleRepository.findByName(RoleName.ROLE_USER)).thenReturn(Optional.of(userRole));
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MessageResponse response = authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        assertEquals("User registered successfully", response.getMessage());
        assertEquals(request.getFullName(), userCaptor.getValue().getFullName());
        assertEquals(request.getEmail(), userCaptor.getValue().getEmail());
        assertEquals("encoded-password", userCaptor.getValue().getPassword());
        assertEquals(RoleName.ROLE_USER, userCaptor.getValue().getRole().getName());
    }

    @Test
    void registerShouldThrowWhenEmailAlreadyExists() {
        RegisterRequest request = buildRegisterRequest();

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(true);

        assertThrows(ResourceAlreadyExistsException.class, () -> authService.register(request));
    }

    @Test
    void registerShouldThrowWhenDefaultRoleIsMissing() {
        RegisterRequest request = buildRegisterRequest();

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(roleRepository.findByName(RoleName.ROLE_USER)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> authService.register(request));
    }

    @Test
    void loginShouldAuthenticateAndReturnJwtToken() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("password123");

        when(jwtService.generateToken(request.getEmail())).thenReturn("jwt-token");

        LoginResponse response = authService.login(request);

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
    }

    private RegisterRequest buildRegisterRequest() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Nguyen Van A");
        request.setEmail("user@example.com");
        request.setPassword("password123");
        return request;
    }

    private Role buildRole(RoleName roleName) {
        Role role = new Role();
        role.setName(roleName);
        return role;
    }
}
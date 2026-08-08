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
import com.duong.eventticket.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    // Repository to manage User persistence
    private final UserRepository userRepository;

    // Repository to look up roles for new users
    private final RoleRepository roleRepository;

    // Password encoder for hashing user passwords
    private final PasswordEncoder passwordEncoder;

    // Spring Security authentication manager for login checks
    private final AuthenticationManager authenticationManager;

    // JWT service used to create authentication tokens
    private final JwtService jwtService;

    @Override
    public MessageResponse register(RegisterRequest request) {

        // Prevent duplicate email registration
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists");
        }

        // Find default user role, fail if missing
        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        User user = new User();

        // Map request fields to the User entity
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setCccd(request.getCccd());
        user.setAge(request.getAge());
        user.setGender(request.getGender());
        user.setAvatarUrl(request.getAvatarUrl());

        // Store encoded password, never save plain text
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setRole(userRole);

        userRepository.save(user);

        return new MessageResponse("User registered successfully");
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        // Authenticate credentials using Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Generate JWT token after successful authentication
        String token = jwtService.generateToken(request.getEmail());

        return new LoginResponse(token);
    }
}
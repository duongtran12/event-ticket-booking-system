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

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    public MessageResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email already exists");
        }

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        User user = new User();

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());

        user.setPassword(passwordEncoder.encode(request.getPassword()));

        user.setRole(userRole);

        userRepository.save(user);

        return new MessageResponse("User registered successfully");
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        String token =
                jwtService.generateToken(
                        request.getEmail()
                );

        return new LoginResponse(token);
    }
}
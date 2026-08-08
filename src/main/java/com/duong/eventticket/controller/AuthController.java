package com.duong.eventticket.controller;

import com.duong.eventticket.dto.request.LoginRequest;
import com.duong.eventticket.dto.request.RegisterRequest;
import com.duong.eventticket.dto.response.LoginResponse;
import com.duong.eventticket.dto.response.MessageResponse;
import com.duong.eventticket.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "APIs for user registration and login")
public class AuthController {

    // AuthService is injected via Lombok @RequiredArgsConstructor
    // AuthService contains the business logic for registration and login
    private final AuthService authService;

    // Endpoint to register a new user and receive a confirmation message
    // RegisterRequest is validated for fields like email, password, and name
    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    public ResponseEntity<MessageResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        // Call service to create the new user and return a success response
        return ResponseEntity.ok(
                authService.register(request)
        );
    }

    // Endpoint to login and return a JWT token upon successful authentication
    // LoginRequest includes username/email and password
    @PostMapping("/login")
    @Operation(summary = "Login and receive a JWT token")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        // Call service login and return JWT with user information
        return ResponseEntity.ok(
                authService.login(request)
        );
    }
}

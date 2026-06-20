package com.duong.eventticket.controller;

import com.duong.eventticket.dto.request.LoginRequest;
import com.duong.eventticket.dto.request.RegisterRequest;
import com.duong.eventticket.dto.response.LoginResponse;
import com.duong.eventticket.dto.response.MessageResponse;
import com.duong.eventticket.service.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @Test
    void registerShouldDelegateToAuthServiceAndReturnSuccessResponse() {
        RegisterRequest request = new RegisterRequest();
        request.setFullName("Nguyen Van A");
        request.setEmail("user@example.com");
        request.setPassword("password123");

        MessageResponse serviceResponse = new MessageResponse("User registered successfully");
        when(authService.register(request)).thenReturn(serviceResponse);

        ResponseEntity<MessageResponse> response = authController.register(request);

        verify(authService).register(request);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("User registered successfully", response.getBody().getMessage());
    }

    @Test
    void loginShouldDelegateToAuthServiceAndReturnTokenResponse() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@example.com");
        request.setPassword("password123");

        LoginResponse serviceResponse = new LoginResponse("jwt-token");
        when(authService.login(request)).thenReturn(serviceResponse);

        ResponseEntity<LoginResponse> response = authController.login(request);

        verify(authService).login(request);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertEquals("jwt-token", response.getBody().getToken());
    }
}
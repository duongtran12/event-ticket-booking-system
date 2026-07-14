package com.duong.eventticket.controller;

import com.duong.eventticket.dto.response.UserProfileResponse;
import com.duong.eventticket.security.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "APIs for user registration and login")
public class UserController {

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserProfileResponse> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        return ResponseEntity.ok(
                new UserProfileResponse(
                        userDetails.getId(),
                        userDetails.getFullName(),
                        userDetails.getUsername(),
                        userDetails.getAuthorities().stream()
                                .findFirst()
                                .map(Object::toString)
                                .orElse("ROLE_USER")
                )
        );
    }
}

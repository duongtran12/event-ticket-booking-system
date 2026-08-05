package com.duong.eventticket.controller;

import com.duong.eventticket.dto.response.UserProfileResponse;
import com.duong.eventticket.security.SecurityConfig;
import com.duong.eventticket.security.UserDetailsImpl;
import com.duong.eventticket.security.UserDetailsServiceImpl;
import com.duong.eventticket.security.jwt.JwtAuthenticationFilter;
import com.duong.eventticket.security.jwt.JwtService;
import com.duong.eventticket.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class UserControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void rejectsAnonymousProfileRequests() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(userService);
    }

    @Test
    void allowsAuthenticatedProfileRequests() throws Exception {
        UserDetailsImpl principal = new UserDetailsImpl(
                1L, "Test User", "user@example.com", "encoded-password",
                List.of(new SimpleGrantedAuthority("ROLE_USER"))
        );
        UserProfileResponse profile = new UserProfileResponse(
                1L, "Test User", "user@example.com", "ROLE_USER",
                null, null, null, null, null
        );
        when(userService.getCurrentUser("user@example.com")).thenReturn(profile);

        mockMvc.perform(get("/api/users/me").with(user(principal)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("user@example.com"));

        verify(userService).getCurrentUser("user@example.com");
    }
}

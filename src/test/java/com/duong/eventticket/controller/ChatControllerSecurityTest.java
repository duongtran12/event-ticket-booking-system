package com.duong.eventticket.controller;

import com.duong.eventticket.security.SecurityConfig;
import com.duong.eventticket.security.UserDetailsServiceImpl;
import com.duong.eventticket.security.jwt.JwtAuthenticationFilter;
import com.duong.eventticket.security.jwt.JwtService;
import com.duong.eventticket.service.OpenAIChatService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ChatController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class ChatControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OpenAIChatService chatService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void rejectsAnonymousChatRequests() throws Exception {
        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"Show upcoming events\"}"))
                .andExpect(status().isUnauthorized());

        verifyNoInteractions(chatService);
    }

    @Test
    @WithMockUser(username = "user@example.com")
    void allowsAuthenticatedChatRequests() throws Exception {
        when(chatService.ask("Show upcoming events")).thenReturn("There are two upcoming events.");

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\":\"Show upcoming events\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("There are two upcoming events."));

        verify(chatService).ask("Show upcoming events");
    }
}

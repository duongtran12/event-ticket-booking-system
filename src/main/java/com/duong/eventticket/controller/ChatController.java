package com.duong.eventticket.controller;

import com.duong.eventticket.dto.request.ChatRequest;
import com.duong.eventticket.dto.response.ChatResponse;
import com.duong.eventticket.service.OpenAIChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final OpenAIChatService openAIChatService;

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        String answer = openAIChatService.ask(request.message());
        return ResponseEntity.ok(new ChatResponse(answer));
    }
}

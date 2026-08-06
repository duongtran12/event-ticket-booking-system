package com.duong.eventticket.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ChatRequest(
        @NotBlank(message = "Message cannot be blank")
        @Size(max = 1000, message = "Message must not exceed 1000 characters")
        String message,

        @Size(max = 10, message = "Chat history must not exceed 10 messages")
        List<@Valid ChatHistoryMessage> history
) {
}

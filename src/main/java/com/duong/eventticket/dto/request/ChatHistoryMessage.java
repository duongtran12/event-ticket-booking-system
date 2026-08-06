package com.duong.eventticket.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ChatHistoryMessage(
        @NotBlank(message = "Chat history role is required")
        @Pattern(regexp = "user|assistant", message = "Chat history role must be user or assistant")
        String role,

        @NotBlank(message = "Chat history content is required")
        @Size(max = 2000, message = "Chat history content must not exceed 2000 characters")
        String content
) {
}

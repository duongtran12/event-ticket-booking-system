package com.duong.eventticket.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Digits;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class TicketTypeRequest {

    @Positive(message = "Ticket type ID must be positive")
    private Long id;

    @NotBlank(message = "Ticket type name is required")
    @Size(max = 100, message = "Ticket type name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Ticket type price is required")
    @PositiveOrZero(message = "Ticket type price must be zero or positive")
    @Digits(integer = 12, fraction = 2, message = "Ticket type price has an invalid format")
    private BigDecimal price;

    @NotNull(message = "Ticket type total tickets is required")
    @Positive(message = "Ticket type total tickets must be positive")
    @Max(value = 1000000, message = "Ticket type total tickets must not exceed 1000000")
    private Integer totalTickets;
}

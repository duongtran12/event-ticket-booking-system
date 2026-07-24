package com.duong.eventticket.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class TicketTypeRequest {

    @NotBlank(message = "Ticket type name is required")
    private String name;

    @NotNull(message = "Ticket type price is required")
    @PositiveOrZero(message = "Ticket type price must be zero or positive")
    private BigDecimal price;

    @NotNull(message = "Ticket type total tickets is required")
    @PositiveOrZero(message = "Ticket type total tickets must be zero or positive")
    private Integer totalTickets;
}

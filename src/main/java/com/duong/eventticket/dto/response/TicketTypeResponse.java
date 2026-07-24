package com.duong.eventticket.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class TicketTypeResponse {

    private Long id;
    private String name;
    private BigDecimal price;
    private Integer totalTickets;
    private Integer availableTickets;
}

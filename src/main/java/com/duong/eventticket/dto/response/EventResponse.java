package com.duong.eventticket.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class EventResponse {

    private Long id;
    private String title;
    private String description;
    private String location;
    private String imageUrl;
    private LocalDateTime dateTime;
    private BigDecimal price;
    private Integer totalTickets;
    private Integer availableTickets;
    private List<TicketTypeResponse> ticketTypes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

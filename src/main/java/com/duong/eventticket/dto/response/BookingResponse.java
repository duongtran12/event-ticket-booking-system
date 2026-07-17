package com.duong.eventticket.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class BookingResponse {

    private Long id;
    private Long eventId;
    private String eventTitle;
    private Long userId;
    private String userEmail;
    private Integer quantity;
    private BigDecimal totalPrice;
    private String status;
    private String cancelReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

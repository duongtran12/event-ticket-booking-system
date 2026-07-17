package com.duong.eventticket.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancelBookingResponse {
    private Long bookingId;
    private String status;
    private String cancelReason;
    private String message;
}
